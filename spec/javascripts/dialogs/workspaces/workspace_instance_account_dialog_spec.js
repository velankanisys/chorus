describe("chorus.dialogs.WorkspaceInstanceAccount", function() {
    beforeEach(function() {
        this.workspace = rspecFixtures.workspace();
        this.account = rspecFixtures.instanceAccount();
        this.dialog = new chorus.dialogs.WorkspaceInstanceAccount({ model: this.account, pageModel: this.workspace});
        this.dialog.render();
    });

    describe("#render", function() {
        it("has the right title", function() {
            expect(this.dialog.title).toMatchTranslation("workspace.instance.account.title")
        });

        it("has the right cancel text", function() {
            expect(this.dialog.$('button.cancel')).toContainTranslation("workspace.instance.account.continue_without_credentials")
        });

        it("has the right body text", function() {
            expect(this.dialog.$('label')).toContainTranslation("workspace.instance.account.body", {instanceName: this.workspace.sandbox().database().instance().get("name")})
        });
    });
});
