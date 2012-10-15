class GnipInstanceImportsController < ApplicationController

  def create
    workspace = Workspace.find(params['imports']['workspace_id'])

    authorize! :can_edit_sub_objects, workspace
    table_name = params['imports']['to_table']

    temp_csv_file = workspace.csv_files.new(
        :to_table => table_name,
    )
    temp_csv_file.user = current_user
    if temp_csv_file.table_already_exists(table_name)
      raise ApiValidationError.new(:base, :table_exists, { :table_name => table_name })
    end

    gnip_instance = GnipInstance.find(params['imports']['gnip_instance_id'])
    c = ChorusGnip.from_stream(gnip_instance.stream_url, gnip_instance.username, gnip_instance.password)
    result = c.to_result

    csv_file = workspace.csv_files.new(
      :contents => StringIO.new(result.contents),
      :column_names => result.column_names,
      :types => result.types,
      :delimiter => ',',
      :to_table => table_name,
      :new_table => true
    )
    csv_file.user = current_user

    if csv_file.save
      event = create_import_event(csv_file)
      GnipImporter.import_file(csv_file, event)
      render :json => [], :status => :ok
    end
  end

  private

  def create_import_event(csv_file)
    schema = csv_file.workspace.sandbox
    Events::FileImportCreated.by(csv_file.user).add(
        :workspace => csv_file.workspace,
        :dataset => schema.datasets.find_by_name(csv_file.to_table),
        :file_name => csv_file.contents_file_name,
        :import_type => 'file',
        :destination_table => csv_file.to_table
    )
  end
end