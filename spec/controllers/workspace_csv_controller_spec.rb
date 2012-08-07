require 'spec_helper'

describe WorkspaceCsvController do
  ignore_authorization!

  let(:user) { users(:bob) }
  let(:non_auth_user) { users(:alice)}
  let(:file) { test_file("test.csv", "text/csv") }
  let(:workspace) { workspaces(:bob_public) }
  let(:csv_file_params) do
    {
        :workspace_id => workspace.to_param,
        :csv => {
            :contents => file,
            :truncate => truncate
        }
    }
  end
  let(:truncate) { false }

  before do
    log_in user
  end

  describe "#create" do
    it "saves the user and workspace onto the csv file" do
      post :create, csv_file_params
      csv_file = CsvFile.last
      csv_file.user.should == user
      csv_file.workspace.should == workspace
    end

    context "when truncate is set to true" do
      let(:truncate) { true }
      it "saves the setting onto the csv file" do
        post :create, csv_file_params
        csv_file = CsvFile.last
        csv_file.truncate.should be_true
      end
    end

    it "returns 100 rows" do
      post :create, csv_file_params

      decoded_response['contents'].should have(100).lines
      decoded_response['contents'].should include('99,99,99')
      decoded_response['contents'].should_not include('100,100,100')

    end

    it "uses authentication" do
      mock(subject).authorize! :can_edit_sub_objects, workspace
      post :create, csv_file_params
    end

    generate_fixture "csvImport.json" do
      post :create, csv_file_params
    end
  end

  describe "#import" do
    before do
      post :create, csv_file_params
      @csv_file = CsvFile.last
      mock(QC).enqueue.with("CsvImporter.import_file", @csv_file.id)
    end

    let(:csv_import_params) do
      {
          :delimiter => ',',
          :column_names => ['id', 'name'],
          :types => ['integer', 'varchar'],
          :to_table => "table_importing_into",
          :has_header => has_header,
          :type => csv_import_type,
          :columns_map => columns_map
      }
    end

    let(:csv_import_type) { "newTable" }
    let(:has_header) { false }
    let(:columns_map) { nil }

    it "updates the necessary import fields on the csv file model" do
      put :import, :workspace_id => workspace.id, :id => @csv_file.id, :csvimport => csv_import_params
      @csv_file.reload
      @csv_file.delimiter.should == ','
      @csv_file.column_names.should == ['id', 'name']
      @csv_file.types.should == ['integer', 'varchar']
      @csv_file.to_table.should == "table_importing_into"
      @csv_file.file_contains_header.should == false
      @csv_file.workspace.should == workspace
    end

    it "uses authentication" do
      mock(subject).authorize! :import, @csv_file
      put :import, :workspace_id => workspace.id, :id => @csv_file.id, :csvimport => csv_import_params
    end

    context "when has_header is true" do
      let(:has_header) { true }
      it "changes the has_header field to file_contains_header FIXME" do
        put :import, :workspace_id => workspace.id, :id => @csv_file.id, :csvimport => csv_import_params
        @csv_file.reload
        @csv_file.file_contains_header.should be_true
      end
    end

    context "new or existing table" do
      context "new table" do
        it "sets the new_table field to true" do
          put :import, :workspace_id => workspace.id, :id => @csv_file.id, :csvimport => csv_import_params
          @csv_file.reload.new_table.should be_true
        end
      end

      context "existing table" do
        let(:csv_import_type) { "existingTable" }
        let(:columns_map) { [{:targetOrder => 'name'}, {:targetOrder => 'id'}].to_json }

        it "sets the new_table field to false" do
          put :import, :workspace_id => workspace.id, :id => @csv_file.id, :csvimport => csv_import_params
          @csv_file.reload.new_table.should be_false
        end

        it "sets the column names based on the columns_map" do
          put :import, :workspace_id => workspace.id, :id => @csv_file.id, :csvimport => csv_import_params
          @csv_file.reload.column_names.should == ['name', 'id']
        end
      end
    end
  end
end