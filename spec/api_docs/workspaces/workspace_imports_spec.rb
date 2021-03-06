require 'spec_helper'

resource "Workspaces: imports" do
  let(:workspace) { workspaces(:public) }
  let(:workspace_id) { workspace.to_param }
  let(:id) { workspace_id }
  let(:user) { workspace.owner }

  let(:dataset_id) { datasets(:table).id }

  before do
    log_in user
    stub(File).readlines.with_any_args { ["The river was there."] }
  end

  post "/workspaces/:workspace_id/datasets/:dataset_id/imports" do
    parameter :dataset_id, "Id of the source dataset"
    parameter :to_table, "Table name of the destination table"
    parameter :truncate, "True/false: truncate into existing table (only if new_table is false)"
    parameter :new_table, "True/false: if true, import into new table. Otherwise, import into existing table."
    parameter :sample_count, "Maximum number of rows to import"

    required_parameters :dataset_id, :to_table, :new_table

    let(:to_table) { "fancyTable" }
    let(:truncate) { "false" }
    let(:new_table) { "true" }
    let(:sample_count) { "500" }

    example_request "Import an existing dataset into a workspace, or create an import for a dataset" do
      status.should == 201
    end
  end

  post "/workspaces/:workspace_id/datasets/:dataset_id/import_schedules" do
    parameter :dataset_id, "Id of the source dataset"
    parameter :to_table, "Table name of the destination table"
    parameter :truncate, "True/false: truncate into existing table (only if new_table is false)"
    parameter :new_table, "True/false: if true, import into new table. Otherwise, import into existing table."
    parameter :sample_count, "Maximum number of rows to import"
    parameter :start_datetime, "Time of day and first date to import"
    parameter :end_date, "Date to end importing"
    parameter :frequency, "How often to import"

    required_parameters :dataset_id, :to_table, :new_table

    let(:to_table) { "fancyTable" }
    let(:truncate) { "false" }
    let(:new_table) { "true" }
    let(:sample_count) { "500" }
    let(:start_datetime) { '2012-09-04 23:00:00-07' }
    let(:end_date) { '2012-12-04' }
    let(:frequency) { 'weekly' }

    example_request "create an import schedule for a dataset" do
      status.should == 201
    end
  end

  put "/workspaces/:workspace_id/datasets/:dataset_id/import_schedules/:id" do

    parameter :dataset_id, "Id of the source dataset"
    parameter :id, "id of the import schedule"
    parameter :to_table, "Table name of the destination table"
    parameter :truncate, "True/false: truncate into existing table (only if new_table is false)"
    parameter :new_table, "True/false: if true, import into new table. Otherwise, import into existing table."
    parameter :sample_count, "Maximum number of rows to import"

    required_parameters :dataset_id, :to_table, :new_table


    let(:to_table) { "fancyTable" }
    let(:truncate) { "false" }
    let(:new_table) { "true" }
    let(:sample_count) { "500" }
    let(:id) { import_schedules(:default).id }


    example_request "Update an import for a dataset" do
      status.should == 200
    end
  end

  get "/workspaces/:workspace_id/datasets/:dataset_id/imports" do
    parameter :workspace_id, "Id of the workspace that the dataset belongs to"
    parameter :dataset_id, "Id of the dataset"

    required_parameters :dataset_id, :workspace_id

    example_request "Get the last import for a dataset" do
      status.should == 200
    end
  end

  get "/workspaces/:workspace_id/datasets/:dataset_id/import_schedules" do
    parameter :workspace_id, "Id of the workspace that the dataset belongs to"
    parameter :dataset_id, "Id of the dataset"

    required_parameters :dataset_id, :workspace_id

    example_request "Get the import schedule for a dataset" do
      status.should == 200
    end
  end

  delete "/workspaces/:workspace_id/datasets/:dataset_id/import_schedules/:id" do
    parameter :workspace_id, "Id of the workspace that the dataset belongs to"
    parameter :dataset_id, "Id of the dataset"
    parameter :id, "id of the import schedule"

    required_parameters :dataset_id, :id, :workspace_id
    let(:id) { import_schedules(:default).id }

    example_request "Delete the import schedule for a dataset" do
      status.should == 200
    end
  end


  post "/workspaces/:workspace_id/csv" do
    parameter :workspace_id, "ID of the workspace"
    parameter :file_name, "Name of the csv file to be imported"
    parameter :contents, "The csv file being imported"

    required_parameters :workspace_id, :file_name, :contents
    scope_parameters :csv, [:contents]

    let(:file_name) { "test.csv"}
    let(:contents) { Rack::Test::UploadedFile.new(File.expand_path("spec/fixtures/test.csv", Rails.root), "text/csv") }

    example_request "Upload a CSV file for import" do
      status.should == 200
    end
  end

  post "/workspaces/:workspace_id/csv/:csv_id/imports" do
    parameter :workspace_id, "Workspace Id"
    parameter :csv_id, "CSV File Id"
    parameter :type, "Table type ( existingTable, newTable )"
    parameter :columns_map, "Mapping of columns from CSV to table ( only for existing table )"
    parameter :to_table, "Target table name"
    parameter :file_contains_header, "Does the CSV file contain a header row? ( true, false )"

    required_parameters :workspace_id, :csv_id, :type, :to_table, :file_contains_header
    scope_parameters :csvimport, [:type, :columns_map, :to_table, :file_contains_header]

    let(:csv_file) { csv_files(:default) }

    let(:csv_id)       { csv_file.id }
    let(:type)         { "existingTable" }
    let(:to_table)     { "a_fine_table" }
    let(:file_contains_header) { "true" }
    let(:columns_map) { '[{"sourceOrder":"id","targetOrder":"id"},{"sourceOrder":"boarding_area","targetOrder":"boarding_area"},{"sourceOrder":"terminal","targetOrder":"terminal"}]' }

    example_request "Complete import of a CSV file" do
      status.should == 201
    end
  end
end
