describe("chorus.PageEvents", function() {
    describe("#subscribe, #broadcast, and #reset", function() {
        beforeEach(function() {
            chorus.PageEvents.reset();
            this.subscriber1 = new chorus.models.Base();
            this.subscriber1.method = jasmine.createSpy("method1");

            this.subscriber2 = new chorus.models.Base();
            this.subscriber2.method = jasmine.createSpy("method2");
        });

        it("removes all subscriptions", function() {
            chorus.PageEvents.subscribe("foo", this.subscriber1.method, this.subscriber1);
            chorus.PageEvents.subscribe("foo", this.subscriber2.method, this.subscriber2);

            chorus.PageEvents.reset();
            chorus.PageEvents.broadcast("foo");
            expect(this.subscriber1.method).not.toHaveBeenCalled();
            expect(this.subscriber2.method).not.toHaveBeenCalled();
        });

        it("properly binds and triggers one event", function() {
            chorus.PageEvents.subscribe("foo", this.subscriber1.method, this.subscriber1);
            chorus.PageEvents.broadcast("foo");
            expect(this.subscriber1.method).toHaveBeenCalled();
            expect(this.subscriber1.method.mostRecentCall.object).toBe(this.subscriber1);
        });

        it("properly binds and trigger multiple events", function() {
            chorus.PageEvents.subscribe("foo", this.subscriber1.method, this.subscriber1);
            chorus.PageEvents.subscribe("foo", this.subscriber2.method, this.subscriber2);
            chorus.PageEvents.broadcast("foo");
            expect(this.subscriber1.method).toHaveBeenCalled();
            expect(this.subscriber2.method).toHaveBeenCalled();
            expect(this.subscriber1.method.mostRecentCall.object).toBe(this.subscriber1);
            expect(this.subscriber2.method.mostRecentCall.object).toBe(this.subscriber2);
        });

        it("won't bind the same callback twice if given an id", function() {
            chorus.PageEvents.subscribe("foo", this.subscriber1.method, this.subscriber1, "fooSubscribe");
            chorus.PageEvents.subscribe("foo", this.subscriber1.method, this.subscriber1, "fooSubscribe");
            chorus.PageEvents.broadcast("foo");
            expect(this.subscriber1.method.callCount).toBe(1);
        });

        context("#unsubscribe", function() {
            beforeEach(function() {
                chorus.PageEvents.subscribe("foo", this.subscriber1.method, this.subscriber1, "otherId");
                this.handle = chorus.PageEvents.subscribe("foo", this.subscriber2.method, this.subscriber2, "fooSubscribe");
            });
            it("works correctly on passing an id", function() {
                chorus.PageEvents.unsubscribe("fooSubscribe");

                chorus.PageEvents.broadcast("foo");
                expect(this.subscriber1.method).toHaveBeenCalled();
                expect(this.subscriber2.method).not.toHaveBeenCalled();

                // subscriptionHandles and Ids are not intended for public consumption
                expect(_.keys(chorus.PageEvents.subscriptionIds).length).toBe(1);
                expect(_.keys(chorus.PageEvents.subscriptionHandles).length).toBe(1);
            });

            it("works when passing a handle", function() {
                chorus.PageEvents.unsubscribe(this.handle);

                chorus.PageEvents.broadcast("foo");
                expect(this.subscriber1.method).toHaveBeenCalled();
                expect(this.subscriber2.method).not.toHaveBeenCalled();
                expect(this.subscriber1.method.mostRecentCall.object).toBe(this.subscriber1);

                // subscriptionHandles and Ids are not intended for public consumption
                expect(_.keys(chorus.PageEvents.subscriptionIds).length).toBe(1);
                expect(_.keys(chorus.PageEvents.subscriptionHandles).length).toBe(1);
            });
        });

        it("handles resubscribing to an event", function() {
            var handle = chorus.PageEvents.subscribe("foo", this.subscriber1.method, this.subscriber1);
            chorus.PageEvents.broadcast("foo");
            expect(this.subscriber1.method).toHaveBeenCalled();
            expect(chorus.PageEvents.subscriptions.foo.length).toBe(1);

            this.subscriber1.method.reset();
            chorus.PageEvents.unsubscribe(handle);
            chorus.PageEvents.broadcast("foo");
            expect(this.subscriber1.method).not.toHaveBeenCalled();
            expect(chorus.PageEvents.subscriptions.foo.length).toBe(0);

            this.subscriber1.method.reset();
            chorus.PageEvents.subscribe("foo", this.subscriber1.method, this.subscriber1);
            chorus.PageEvents.broadcast("foo");
            expect(this.subscriber1.method).toHaveBeenCalled();
            expect(chorus.PageEvents.subscriptions.foo.length).toBe(1);
        });

        it("passes arguments when broadcast", function() {
            chorus.PageEvents.subscribe("foo", this.subscriber1.method, this.subscriber1);
            chorus.PageEvents.broadcast("foo", "Foo", "Bar");
            expect(this.subscriber1.method).toHaveBeenCalled();
            expect(this.subscriber1.method.mostRecentCall.object).toBe(this.subscriber1);
            expect(this.subscriber1.method.mostRecentCall.args).toEqual(["Foo", "Bar"]);
        });

        it("properly executes callbacks without a context", function() {
            var spy = jasmine.createSpy();
            chorus.PageEvents.subscribe("foo", spy);

            chorus.PageEvents.broadcast("foo");

            expect(spy).toHaveBeenCalled();
        });
    });

    describe("#hasSubscription", function() {
        beforeEach(function() {
            chorus.PageEvents.reset();
            this.subscriber = new chorus.models.Base();
            this.subscriber.method = jasmine.createSpy();
        });

        it("returns false when the binding does not exist", function() {
            expect(chorus.PageEvents.hasSubscription("foo", this.subscriber.method, this.subscriber)).toBeFalsy();
        });

        it("returns true when the binding exists", function() {
            chorus.PageEvents.subscribe("foo", this.subscriber.method, this.subscriber);
            expect(chorus.PageEvents.hasSubscription("foo", this.subscriber.method, this.subscriber)).toBeTruthy();
        });

        it("returns false when the context doesn't match", function() {
            chorus.PageEvents.subscribe("foo", this.subscriber.method, this.subscriber);
            expect(chorus.PageEvents.hasSubscription("foo", this.subscriber.method, {})).toBeFalsy();
        });

        it("returns false when the callback doesn't match", function() {
            this.subscriber.otherMethod = function() {
            }
            chorus.PageEvents.subscribe("foo", this.subscriber.method, this.subscriber);
            expect(chorus.PageEvents.hasSubscription("foo", this.subscriber.otherMethod, this.subscriber)).toBeFalsy();
        });
    })
});