require "sequel/no_core_ext"

class GpTableCopier
  class ImportFailed < StandardError; end

  attr_accessor :attributes, :source_database_url, :destination_database_url

  def self.run_import(source_database_url, destination_database_url, attributes)
    new(source_database_url, destination_database_url, attributes).start
  end

  def initialize(source_database_url, destination_database_url, attributes)
    self.source_database_url = source_database_url
    self.destination_database_url = destination_database_url
    self.attributes = HashWithIndifferentAccess.new(attributes)
  end

  def start
    copier = self
    if source_database_url != destination_database_url
      copier = GpPipe.new(self)  # delegate cross-database copies to a GpPipe instance
    end

    copier.run
  end

  def database
    source_database
  end

  def source_database
    @source_database ||= Sequel.connect(source_database_url)
  end

  def destination_database
    @destination_database ||= Sequel.connect(destination_database_url)
  end

  def distribution_key_clause
    return 'DISTRIBUTED RANDOMLY' if chorus_view?
    @distribution_key_clause ||= begin
      rows = source_database.fetch(distribution_key_sql)
      rows.empty? ? 'DISTRIBUTED RANDOMLY' : "DISTRIBUTED BY(#{quote_and_join(rows)})"
    end
  end

  def quote_and_join(collection)
    collection.map do |element|
      "\"#{element[:attname]}\""
    end.join(', ')
  end

  def limit_clause
    row_limit.nil? ? '' : "LIMIT #{row_limit}"
  end

  def chorus_view?
    attributes[:from_table].is_a?(Hash)
  end

  def run
    table_exists = database.table_exists?(destination_table)

    database.transaction do
      record_internal_exception do
        if chorus_view?
          database << attributes[:from_table][:query]
        end

        if create_new_table? && !table_exists
          create_command = "CREATE TABLE #{destination_table_fullname} (%s) #{distribution_key_clause};"
          database << create_command % [table_definition_with_keys]
        elsif truncate?
          truncate_command = "TRUNCATE TABLE #{destination_table_fullname};"
          database << truncate_command
        end
        copy_command = "INSERT INTO #{destination_table_fullname} (SELECT * FROM #{source_table_path} #{limit_clause});"
        database.execute(copy_command)
      end
    end

  rescue StandardError => e
    raise ImportFailed, (@internal_exception || e).message
  end

  def create_new_table?
    attributes[:new_table].to_s == "true"
  end

  def row_limit
    attributes[:sample_count]
  end

  def destination_table_name
    attributes[:to_table]
  end

  def qualified_table_name(table)
    %Q{"#{table.table}"."#{table.column}"}
  end

    def destination_table_fullname
      qualified_table_name(destination_table)
    end

  def destination_table
    attributes[:to_table]
  end

  def destination_schema_name
    destination_table.table
  end

  def source_table_fullname
    qualified_table_name(source_table)
  end

  def source_schema_name
    source_table.table
  end

  def source_table_name
    source_table.column
  end

  def source_table
    if chorus_view?
      attributes[:from_table][:identifier]
    else
      attributes[:from_table]
    end
  end

  def truncate?
    attributes[:truncate].to_s == "true"
  end

  def table_definition
    @table_definition || begin
      # No way of testing ordinal position clause since we can't reproduce an out of order result from the following query
      rows = source_database.fetch(describe_table)
      rows.map { |col_def| "\"#{col_def[:column_name]}\" #{col_def[:data_type]}" }.join(", ")
    end
  end

  def table_definition_with_keys
    @table_definition_with_keys ||= begin
      if chorus_view?
        primary_key_rows = []
      else
        primary_key_rows = source_database.fetch(primary_key_sql)
      end
      primary_key_clause = primary_key_rows.empty? ? '' : ", PRIMARY KEY(#{quote_and_join(primary_key_rows)})"
      table_definition + primary_key_clause
    end
  end

  def source_table_path
    chorus_view? ? %Q|"#{source_table_name}"| : source_table_fullname
  end
  private

  # this is a workaround for jdbc postgres adapter hiding exceptions
  def record_internal_exception
    yield
  rescue => e
    @internal_exception = e
    raise
  end
 
  def distribution_key_sql
    <<-SQL
      SELECT attname
      FROM   (SELECT *, generate_series(1, array_upper(attrnums, 1)) AS rn
      FROM   gp_distribution_policy where localoid = '#{source_table_path}'::regclass
      ) y, pg_attribute WHERE attrelid = '#{source_table_path}'::regclass::oid AND attrnums[rn] = attnum ORDER by rn;
    SQL
  end

  def primary_key_sql
    <<-SQL
      SELECT attname
      FROM   (SELECT *, generate_series(1, array_upper(conkey, 1)) AS rn
      FROM   pg_constraint where conrelid = '#{source_table_path}'::regclass and contype='p'
      ) y, pg_attribute WHERE attrelid = '#{source_table_path}'::regclass::oid AND conkey[rn] = attnum ORDER by rn;
    SQL
  end

  def describe_table
    <<-SQL
      SELECT a.attname as column_name,
        pg_catalog.format_type(a.atttypid, a.atttypmod) as data_type,
        (SELECT substring(pg_catalog.pg_get_expr(d.adbin, d.adrelid) for 128)
         FROM pg_catalog.pg_attrdef d
         WHERE d.adrelid = a.attrelid
          AND d.adnum = a.attnum
          AND a.atthasdef),
        a.attnotnull, a.attnum,
        NULL AS attcollation
      FROM pg_catalog.pg_attribute a
      WHERE a.attrelid =
          (SELECT c.oid
          FROM pg_catalog.pg_class c
            LEFT JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
          WHERE c.relname ~ '^(#{source_table_name})$'
            #{"AND n.nspname ~ '^(#{source_schema_name})$'" unless chorus_view?} LIMIT 1)
        AND a.attnum > 0
        AND NOT a.attisdropped
      ORDER BY a.attnum;
    SQL
  end
end