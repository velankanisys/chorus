(function(ns) {
    ns.Workspace = chorus.models.Base.extend({
        urlTemplate : "workspace/{{id}}",
        showUrlTemplate : "workspaces/{{id}}",

        customIconUrl: function(options) {
            options = (options || {});
            return "/edc/workspace/" + this.get("id") + "/image?size=" + (options.size || "original");
        },

        defaultIconUrl: function() {
            if (this.get("active")) {
                return "/images/workspace-icon-large.png";
            } else {
                return "/images/workspace-archived-icon-large.png";
            }
        },

        owner: function() {
            return new ns.User({
                fullName: this.get("ownerFullName"),
                userName: this.get("owner")
            });
        },

        declareValidations : function(){
            this.require("name")
        },

        displayName : function() {
            return this.get("name");
        },

        imageUrl : function(options){
            options = (options || {});
            return "/edc/workspace/" + this.get("id") + "/image?size=" + (options.size || "original");
        },

        picklistImageUrl : function(){
          return "/images/workspace-icon-small.png";
        },

        attrToLabel : {
            "name" : "workspace.validation.name"
        }
    });
})(chorus.models);
