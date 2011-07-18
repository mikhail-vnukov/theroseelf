var Character = new Class({
    initialize : function (context) {
        this.context = context;  
    },
    draw : function(controller) {
//        console.debug("character.draw");
    }
});
var VillainView = new Class({
    Extends : Character,
    initialize : function (context) {
        this.parent(context);
    },
    update : function (controller) {
       
        this.context.save();
        this.context.beginPath();
        this.context.rect(controller.x, controller.y, 
                controller.width, controller.height);
        this.context.clip();
        this.context.fillStyle = "rgb(200,0,0)";
        this.context.fill();
        this.context.restore();
        
    }
});

var SwarmView = new Class({
    Extends : Character,
    initialize : function (context) {
        this.parent(context);
    },
    update : function (controller) {
        var that = this;
        that.context.save();
        that.context.fillStyle = "rgb(200,200,200)";
        controller.bees.each(function(value) {
            that.context.fillRect(value.x, value.y, 3, 3);
        });
        that.context.restore();
    }
});

var Controller = new Class({
    x : 0,
    y : 0,
    target : {},
    update : function() {
        
    },
    initialize : function (target) {
        this.target = target;
    }
});

var VillainController = new Class({
    Extends : Controller,
    health : 100,
    width : 100,
    height : 200,
    update : function() {
        var dx = this.target.x - this.x;
        var dy = this.target.y - this.y;
        dy += dy == 0 ? 1:0;
        dx += dx == 0 ? 1:0;
        this.x += (dx * 0.1 ) + (10 / (dx));
        this.y += (dy * 0.1 ) + (10 / (dy));

    },
    bite : function() {
        this.width -= this.width*0.1; 
        this.height -= this.height*0.1; 
    }
});

var BeeController = new Class({
    Extends : Controller,
    initialize : function (target) {
        this.parent(target);
        this.x = $random(1000, 1100);
        this.y = $random(1000, 1100);
    },
    update : function() {
        var dx = this.target.x - this.x;
        var dy = this.target.y - this.y;
        var vx = (dx > 1000) ? 0.05 : (dx > 100) ? 0.1 : (dx > 10) ? 0.15 : 0.2;
        var vy = (dy > 1000) ? 0.05 : (dy > 100) ? 0.1 : (dy > 10) ? 0.15 : 0.2; 
        this.x += (dx + $random(-dx, dx)) * vx;
        this.y += (dy + $random(-dy, dy)) * vy;
        if (dy < 0 && dy > -this.target.height && dx < 0 && dx > -this.target.width && ($random(0,10) > 8)) {
            this.target.bite();
        }
    }
});

var SwarmController = new Class({
    Extends : Controller,
    initialize : function (target) {
        this.parent (target);
        for (var i = 0; i < 10;  i++) {
            this.bees.push(new BeeController(target));
        }
    },
    bees : [],
    target : {},
    update : function() {
        this.bees.each(function(value) { 
            value.update();
        });
    }
});