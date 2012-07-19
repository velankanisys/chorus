require 'spec_helper'

describe WorkfilePresenter, :type => :view do

  before(:each) do
    @user = FactoryGirl.build :user
    stub(view).current_user { @user }
    @workspace = FactoryGirl.build :workspace, :owner => @user
    @workfile = FactoryGirl.create :workfile, :workspace => @workspace, :owner => @workspace.owner, :file_name => 'work (space).sql'
    FactoryGirl.create(:workfile_version, :contents => test_file, :workfile => @workfile)
    @presenter = WorkfilePresenter.new(@workfile, view)
  end

  describe "#to_hash" do
    before do
      @hash = @presenter.to_hash
    end

    it "includes the right keys" do
      @hash.should have_key(:workspace)
      @hash.should have_key(:owner)

      @hash.should have_key(:file_name)
      @hash.should have_key(:file_type)
      @hash.should have_key(:latest_version_id)
      @hash.should have_key(:has_draft)
    end

    it "uses the workspace presenter to serialize the workspace" do
      @hash[:workspace].to_hash.should == (WorkspacePresenter.new(@workspace, view).to_hash)
    end

    it "uses the user presenter to serialize the owner" do
      @hash[:owner].to_hash.should == (UserPresenter.new(@user, view).to_hash)
    end

    it "uses the workfile file name" do
      @hash[:file_name].should == "work (space).sql"
    end

    context "workfile has a draft for that user" do
      it "has_draft value is true" do
        FactoryGirl.create(:workfile_draft, :workfile_id => @workfile.id, :owner_id => @user.id)
        @hash = @presenter.to_hash
        @hash[:has_draft].should == true
      end
    end

    context "No workfile draft for that user" do
      it "has_draft value is false" do
        @hash[:has_draft].should == false
      end
    end

    it "sanitizes file name" do
      bad_value = 'file_ending_in_invalid_quote"'
      workfile = FactoryGirl.create(:workfile)
      workfile_version = FactoryGirl.create(:workfile_version, :contents => test_file(bad_value), :workfile => workfile)
      json = WorkfilePresenter.new(workfile, view).to_hash

      json[:file_name].should_not include '"'
    end
  end
end