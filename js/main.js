var Spider = Backbone.Model.extend({
	defaults: {
		properties: {}, //the initial properties of the spider -> eg. every value of a property in the diagram
        dependencyMatrix: {}, // see how they are related
        numericalIds: {} // figure out how to match 1_1 => 0, 1_2 => basically numerical id of the properties
	},
    initialize: function(){
    	this.getMatrix();
    },
    focusItem: function(id) {
        var props = this.get("properties");
        var newProps = {}
        newProps[id] = 3;
        var matrix = this.get("dependencyMatrix");
        var relLign = matrix[id];

        var i = 0;
        console.log("--------------------------------")
        console.log(matrix)
        for (var item in props) {
            if (relLign[i] >= 0 && props[item] != 0 && props[item] != 3) {
                newProps[item] = parseInt(relLign[i]);
            }
            else if (newProps[item] != 3 && props[item] != 3) {
                console.log("item: " + item + " new: " + newProps[item] + " old: " + props[item] + " aus matrix: " + relLign[i])
                newProps[item] = 0;
            }
            else {
                
            }
            i++;
        }
        this.set({"properties": newProps});
    },
    getMatrix: function() {
    	var data = _matrix;
    	this.parse(data);
    },
    /**
     * Parsing the CSV File and then preparing the data as is needed
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    parse: function(data) {
    	var headerLines = 1;
    	var arLines = data.split("$");
    	var properties = {};
        var dependencyMatrix = {};
        var numericalIds = {};
        var k = 0;
    	for (var i = headerLines; i <= arLines.length; i++) {
    		var property = {};
    		if (arLines[i] !== undefined) {
	    		var cells = arLines[i].split(";");
	    		if (cells[0] != "") {
		    		property[cells[0]] = 2;
		    		properties[cells[0]] = 2;
                    numericalIds[cells[0]] = k;
                    k++;
                    dependencyMatrix[cells[0]] = cells.splice(2, cells.length);
	    		}
    		}
    	};
    	this.set({properties: properties});
        this.set({dependencyMatrix: dependencyMatrix});
        this.set({numericalIds: numericalIds});
    }
});

SpiderView = Backbone.View.extend({
	el: $('#mobidim'),
	events: {
      'click path[class=clickable]': 'focusItem'
    },
    initialize: function(){
        this.modifyTemplate();
        this.render();
    },
    modifyTemplate: function(){
        var self = this;        
        // Compile the template using underscore
        var tmpl = $($("#svg_template").html());
        //var tmpl = $("#svg_template").html();
        var props = this.model.get("properties");
        var id = 0;
        $(tmpl).find("*[class='clickable']").each(function(){
            id = $(this).attr('val');
            id = id.replace(".", "_");

            if (props[id] === 3) {
                $(this).css("fill", "red");    
            }
            if (props[id] === 2) {
                $(this).css("fill", "green");    
            }
            if (props[id] === 1) {
                $(this).css("fill", "grey");    
            }
            if (props[id] === 0) {
                $(this).hide(); 
            }
        });
        tmpl = tmpl[0].outerHTML;
                //console.log(template);
        // Load the compiled HTML into the Backbone "el"
        this.template = _.template(tmpl);
    },
    render: function() {
        this.$el.html( this.template() );
        return this;
    },
    focusItem: function(event ) {
    	var id = $(event.target).attr('val').replace(".", "_");
        this.model.focusItem(id);
        this.modifyTemplate();
        this.render();
    }
});
    
var spider = new Spider;
var spiderView = new SpiderView({model:spider});
