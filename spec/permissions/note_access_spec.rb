require "spec_helper"

describe Events::NoteAccess do
  let(:fake_controller) { ApplicationController.new }
  let(:access) { Events::NoteAccess.new(fake_controller) }
  let(:note) { events(:note_on_greenplum) }

  describe "#show?" do
    context " when the current user is the note's actor" do
      it "returns true" do
        stub(fake_controller).current_user { users(:owner) }
        access.show?(note).should be_true
      end
    end

    context "when the current user is an admin" do
      it "returns true" do
        admin = users(:admin)
        stub(fake_controller).current_user { admin }
        access.show?(note).should be_true
      end
    end

    context "when the note is on a workspace and the current user is the workspace owner" do
      let!(:note) do
        Events::NoteOnWorkspace.by(users(:no_collaborators)).create(
            :workspace => workspaces(:public),
            :body => "hi"
        )
      end

      it "returns true" do
        stub(fake_controller).current_user { note.workspace.owner }
        access.show?(note).should be_true
      end
    end

    context "when the note is on a model not visible to the user" do
      let!(:note) do
        Events::NoteOnWorkspace.by(users(:owner)).create(
            :workspace => workspaces(:private),
            :body => "You can't see me"
        )
      end

      it "fails" do
        other_user = FactoryGirl.build(:user)
        stub(fake_controller).current_user { other_user }

        access.show?(note).should be_false
      end
    end
  end


  describe "#destroy?" do
    context " when the current user is the note's actor" do
      it "returns true" do
        stub(fake_controller).current_user { users(:owner) }
        access.destroy?(note).should be_true
      end
    end

    context "when the current user is an admin" do
      it "returns true" do
        admin = users(:admin)
        stub(fake_controller).current_user { admin }
        access.destroy?(note).should be_true
      end
    end

    context "when the note is on a workspace and the current user is the workspace owner" do
      let(:note) do
        Events::NoteOnWorkspace.by(users(:no_collaborators)).create(
            :workspace => workspaces(:public),
            :body => "hi"
        )
      end

      it "returns true" do
        stub(fake_controller).current_user { note.workspace.owner }
        access.destroy?(note).should be_true
      end
    end

    it "returns false otherwise" do
      other_user = FactoryGirl.build(:user)
      stub(fake_controller).current_user { other_user }
      access.destroy?(note).should be_false
    end
  end

  describe "#update?" do
    context " when the current user is the note's actor" do
      it "returns true" do
        stub(fake_controller).current_user { users(:owner) }
        access.update?(note).should be_true
      end
    end

    it "returns false otherwise" do
      other_user = FactoryGirl.build(:user)
      stub(fake_controller).current_user { other_user }
      access.update?(note).should be_false
    end
  end

  describe "#create?(params)" do
    before do
      stub(fake_controller).current_user { users(:the_collaborator) }
    end

    context "when there is an access class for the specified model" do
      it "delegates to that access class's :create_note_on? method" do
        workspace = workspaces(:public)
        any_instance_of(WorkspaceAccess) do |workspace_access|
          mock(workspace_access).create_note_on?(workspace) { "delegated_return_value" }
        end
        access.create?(Events::Note, "workspace", workspace.id).should == "delegated_return_value"
      end
    end

    context "when there is no access class for the model" do
      it "delegates to the default access for creating notes" do
        user = users(:owner)
        any_instance_of(DefaultAccess) do |workspace_access|
          mock(workspace_access).create_note_on?(user) { "delegated_return_value" }
        end
        access.create?(Events::Note, "user", user.id).should == "delegated_return_value"
      end
    end
  end

  describe "classes for individual note types" do
    it "has a class for each type of note" do
      Events::NoteOnWorkspaceAccess.new(fake_controller).should be_a Events::NoteAccess
      Events::NoteOnGreenplumInstanceAccess.new(fake_controller).should be_a Events::NoteAccess
      Events::NoteOnHadoopInstanceAccess.new(fake_controller).should be_a Events::NoteAccess
    end
  end
end
