var FinalScene = (function() {
    var my = {};
    var objects = [];
    var listeneres = [];
    var context;
    var width = 0;
    var height = 0;
    my.start = function() {
        var canvas = $('FinalScene');
        context = canvas.getContext("2d");
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        var mouse = {x : 0, y : 0};
        var villain = { 
                controller : new VillainController(mouse),
                view : new VillainView(context)
        };
        var swarm = { 
                controller : new SwarmController(villain.controller),
                view : new SwarmView(context)
        };
        objects.push(villain);
        objects.push(swarm);
        canvas.addEvent('mousemove', function(event) {
            mouse.x = event.client.x;
            mouse.y = event.client.y;
        });

        /* swarm = new SwarmView(context); */
        update();
    };
    function updateView () {
        context.clearRect(0, 0, width, height);
        objects.each(function(value) {
            value.view.update(value.controller);
        });
    };
    function update () {
        updateView.periodical(10);
        updateState.periodical(30);
    };
    function updateState () {
        objects.each(function(value) {
            value.controller.update();
        });
    }
    return my;
})();
window.addEvent('domready', function() {FinalScene.start();});

