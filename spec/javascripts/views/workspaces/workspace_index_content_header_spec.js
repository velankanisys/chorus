describe("WorkspaceIndexContentHeader", function() {
    beforeEach(function() {
        this.loadTemplate("workspace_index_content_header");
        this.loadTemplate("link_menu");
        this.view = new chorus.views.WorkspaceIndexContentHeader();
    });

    describe("#render", function() {
        beforeEach(function() {
            this.view.render();
        });

        it("contains the title", function() {
            expect(this.view.$("h1").text()).toContain("Workspaces");
        });

        it("contains a filter menu", function() {
            expect(this.view.$(".menu.popup_filter")).toExist();
            expect(this.view.$(".link_menu .title")).toHaveText("Show");
        });

        it("defaults to the active filter", function() {
            var activeCheck = this.view.$(".menu li[data-type=active] .check");
            var allCheck = this.view.$(".menu li[data-type=all] .check");
            expect(activeCheck).not.toHaveClass('hidden');
            expect(allCheck).toHaveClass('hidden');
        });

        describe("clicking on the filter link", function() {
            var activeCheckSelector = ".menu li[data-type=active] .check";
            var allCheckSelector = ".menu li[data-type=all] .check";
            beforeEach(function() {
                this.view.render();
                this.view.$(".link_menu > a").click();
            });

            describe("clicking on the 'all workspaces' link", function() {
                beforeEach(function() {
                    this.filterSpy = jasmine.createSpy("filter:all");
                    this.view.bind("filter:all", this.filterSpy);

                    this.view.$(".menu li[data-type=all] a").click();
                });

                it("triggers the filter:all", function() {
                    expect(this.filterSpy).toHaveBeenCalled();
                });

                it("dismisses the popup", function() {
                    expect(this.view.$(".menu")).toHaveClass("hidden");
                });

                it("Sets the text of the filter link", function() {
                    expect(this.view.$(".link_menu > a span").text()).toBe(t("filter.all_workspaces"));
                });


            });

            describe("clicking on the 'active workspaces' link", function() {
                beforeEach(function() {
                    this.filterSpy = jasmine.createSpy("filter:active");
                    this.view.bind("filter:active", this.filterSpy);

                    this.view.$(".menu li[data-type=active] a").click();
                });

                it("triggers the filter:active", function() {
                    expect(this.filterSpy).toHaveBeenCalled();
                });

                it("dismisses the popup", function() {
                    expect(this.view.$(".menu")).toHaveClass("hidden");
                });

                it("Sets the text of the filter link", function() {
                    expect(this.view.$(".link_menu > a span").text()).toBe(t("filter.active_workspaces"));
                });

                it("shows only the check for the 'active' link", function() {
                    this.view.$(".menu li[data-type=all] a").click();

                    expect(this.view.$(activeCheckSelector)).toHaveClass('hidden')
                    expect(this.view.$(allCheckSelector)).not.toHaveClass('hidden')

                    this.view.$(".menu li[data-type=active] a").click();

                    expect(this.view.$(activeCheckSelector)).not.toHaveClass('hidden')
                    expect(this.view.$(allCheckSelector)).toHaveClass('hidden')
                });
            });
        });
    });
});
