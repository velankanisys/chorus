describe("chorus.models.Schema", function() {
    describe("#showUrl", function() {
        beforeEach(function() {
            this.model = rspecFixtures.schema({id: 1234, name: "b/a/r", database: {id: "42", instance: {id: 10000}}});
        })
        it("should encode the url", function() {
            expect(this.model.showUrl()).toContain("schemas/1234");
        });
    });

    context("from a sandbox", function() {
        beforeEach(function() {
            this.sandbox = rspecFixtures.workspace().sandbox();
            this.model = this.sandbox.schema();
        });

        describe("#datasets", function() {
            it("should return a DataaseObjectSet", function() {
                expect(this.model.datasets()).toBeA(chorus.collections.DatasetSet);
            });

            it("should memoize the result", function() {
                expect(this.model.datasets()).toBe(this.model.datasets());
            });

            it("should pass its id", function() {
                var objects = this.model.datasets();
                expect(objects.attributes.schemaId).toBe(this.model.id);
            });
        });

        describe("functions", function() {
            it("should return a SchemaFunctionSet", function() {
                var functionSet = this.model.functions();
                expect(functionSet).toBeA(chorus.collections.SchemaFunctionSet);
            });

            it("should memoize the result", function() {
                expect(this.model.functions()).toBe(this.model.functions());
            });

            it("should pass the instanceId, databaseId, and schemaId", function() {
                expect(this.model.functions().attributes.id).toBe(this.model.get('id'));
            });
        });
    });

    describe("#canonicalName", function() {
        beforeEach(function() {
            this.model = rspecFixtures.schema({name: "schema", database: {name: "database", instance: {name: "instance"}}});
        });

        it("should create the canonical name", function() {
            expect(this.model.canonicalName()).toBe("instance.database.schema");
        });

        it("memoizes", function() {
            expect(this.model.database()).toBe(this.model.database());
        });
    });

    describe("#isEqualToSchema", function() {
        beforeEach(function() {
            this.model = rspecFixtures.schema({ id: '3' });
        });

        it("checks that the ids of the schemas are equal", function() {
            var other = rspecFixtures.schema({ id: '3' });

            expect(this.model.isEqualToSchema(other)).toBeTruthy();

            other.set({ id: '5' });

            expect(this.model.isEqualToSchema(other)).toBeFalsy();
        });
    });

    describe("#database", function() {
        beforeEach(function() {
            this.model = rspecFixtures.schema({name: "schema", database: {name: "database", instance: {name: "instance"}}});
            this.database = this.model.database();
        });

        it("returns a database with the right id and instanceId", function() {
            expect(this.database).toBeA(chorus.models.Database);
            expect(this.database.get("id")).toBe(this.model.database().id);
            expect(this.database.instance().id).toBe(this.model.get("database").instance.id);
        });
    });
});
