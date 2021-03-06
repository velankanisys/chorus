class GpdbInstance < ActiveRecord::Base
  attr_accessible :name, :description, :host, :port, :maintenance_db, :state,
                  :provision_type, :description, :instance_provider, :version

  validates_presence_of :name, :maintenance_db
  validates_numericality_of :port, :only_integer => true, :if => :host?
  validates_length_of :name, :maximum => 64

  has_many :activities, :as => :entity
  has_many :events, :through => :activities
  belongs_to :owner, :class_name => 'User'
  has_many :accounts, :class_name => 'InstanceAccount'
  has_many :databases, :class_name => 'GpdbDatabase'
  has_many :schemas, :through => :databases, :class_name => 'GpdbSchema'
  has_many :datasets, :through => :schemas
  has_many :workspaces, :through => :schemas, :foreign_key => 'sandbox_id'
  after_update :solr_reindex_later, :if => :shared_changed?

  attr_accessor :highlighted_attributes, :search_result_notes
  searchable do
    text :name, :stored => true, :boost => SOLR_PRIMARY_FIELD_BOOST
    text :description, :stored => true, :boost => SOLR_SECONDARY_FIELD_BOOST
    string :grouping_id
    string :type_name
    string :security_type_name, :multiple => true
  end

  def self.unshared
    where("gpdb_instances.shared = false OR gpdb_instances.shared IS NULL")
  end

  def self.reindex_instance instance_id
    instance = GpdbInstance.find(instance_id)
    instance.solr_index
    instance.datasets(:reload => true).each(&:solr_index)
  end

  def self.refresh_databases instance_id
    GpdbInstance.find(instance_id).refresh_databases
  end

  def solr_reindex_later
    QC.enqueue_if_not_queued('GpdbInstance.reindex_instance', id)
  end

  def refresh_databases_later
    QC.enqueue_if_not_queued('GpdbInstance.refresh_databases', id)
  end

  def self.owned_by(user)
    if user.admin?
      scoped
    else
      where(:owner_id => user.id)
    end
  end

  def used_by_workspaces(viewing_user)
    workspaces.workspaces_for(viewing_user).order("lower(workspaces.name)")
  end

  def self.accessible_to(user)
    where('gpdb_instances.shared OR gpdb_instances.owner_id = :owned OR gpdb_instances.id IN (:with_membership)',
          :owned => user.id,
          :with_membership => user.instance_accounts.pluck(:gpdb_instance_id)
    )
  end

  def accessible_to(user)
    GpdbInstance.accessible_to(user).include?(self)
  end

  def refresh_databases(options ={})
    found_databases = []
    rows = Gpdb::ConnectionBuilder.connect!(self, owner_account, maintenance_db) { |conn| conn.select_all(database_and_role_sql) }
    database_account_groups = rows.inject({}) do |groups, row|
      groups[row["database_name"]] ||= []
      groups[row["database_name"]] << row["db_username"]
      groups
    end

    database_account_groups.each do |database_name, db_usernames|
      database = databases.find_or_create_by_name!(database_name)
      database.update_attributes!({:stale_at => nil}, :without_protection => true)
      database_accounts = accounts.where(:db_username => db_usernames)
      if database.instance_accounts.sort != database_accounts.sort
        database.instance_accounts = database_accounts
        QC.enqueue_if_not_queued("GpdbDatabase.reindexDatasetPermissions", database.id)
      end
      found_databases << database
    end
  rescue ActiveRecord::JDBCError => e
    Chorus.log_error "Could not refresh database: #{e.message} on #{e.backtrace[0]}"
  ensure
    if options[:mark_stale]
      (databases.not_stale - found_databases).each do |database|
        database.stale_at = Time.now
        database.save
      end
    end
  end

  def create_database(name, current_user)
    raise ActiveRecord::StatementInvalid, "Database '#{name}' already exists." unless databases.where(:name => name).empty?
    create_database_in_instance(name, current_user)
    refresh_databases
    databases.find_by_name!(name)
  end

  def account_names
    accounts.pluck(:db_username)
  end

  def owner_account
    account_owned_by(owner)
  end

  def account_for_user(user)
    if shared?
      owner_account
    else
      account_owned_by(user)
    end
  end

  def account_for_user!(user)
    account_for_user(user) || (raise ActiveRecord::RecordNotFound.new)
  end

  def gpdb_instance
    self
  end

  def self.refresh(id, options={})
    find(id).refresh_all options
  end

  def refresh_all(options={})
    refresh_databases options

    databases.each do |database|
      GpdbSchema.refresh(owner_account, database, options.reverse_merge(:refresh_all => true))
    end
  end

  def entity_type_name
    'gpdb_instance'
  end

  def self.type_name
    'Instance'
  end

  private

  def create_database_in_instance(name, current_user)
    Gpdb::ConnectionBuilder.connect!(self, account_for_user!(current_user)) do |conn|
      sql = "CREATE DATABASE #{conn.quote_column_name(name)}"
      conn.exec_query(sql)
    end
  end

  def database_and_role_sql
    roles = Arel::Table.new("pg_catalog.pg_roles", :as => "r")
    databases = Arel::Table.new("pg_catalog.pg_database", :as => "d")

    roles.join(databases).
        on(Arel.sql("has_database_privilege(r.oid, d.oid, 'CONNECT')")).
        where(
        databases[:datname].not_eq("postgres").
            and(databases[:datistemplate].eq(false)).
            and(databases[:datallowconn].eq(true)).
            and(roles[:rolname].in(account_names))
    ).project(
        roles[:rolname].as("db_username"),
        databases[:datname].as("database_name")
    ).to_sql
  end

  def account_owned_by(user)
    accounts.find_by_owner_id(user.id)
  end
end
