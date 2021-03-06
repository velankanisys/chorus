require 'dataset'

class GpdbTable < Dataset

  def analyze(account)
    table_name = '"' + schema.name + '"."'  + name + '"';
    query_string = "analyze #{table_name}"
    schema.with_gpdb_connection(account) do |conn|
      conn.exec_query(query_string)
    end
    []
  end
end
