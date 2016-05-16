//##############################################################################
// src/steps/Step_DumpFromCylinder.js
//##############################################################################
ENJ.Step_DumpFromCylinder = (function() {
  var Step = ENJ.Step,
    Tween = CRE.Tween;

  var base = Step.prototype;
    
  return ENJ.defineClass({
    /**
     * 倒出量筒中液体
     * 所用：量筒、烧杯
     * 
     * @constructor
     */
    constructor: function Step_DumpFromCylinder() {
      Step.apply(this, arguments);
    }, extend: Step,

    start: function() {
      base.start.call(this);
      var self = this, scene = self.scene, store = self.store,
        handlers = this.handlers = [];

      var cylinder = self.cylinder = scene.cylinder;
      var beaker = self.beaker = scene.beakers[store.beaker];


      Tween.get(beaker)
        .to({x: 200, y: 500}, 500)
        .call(function() {
          beaker.start();
        });

//    Tween.get(cylinder)
//      .to({x: 240, y: 450}, 500);

      this.flags = [];
      handlers[0] = self.onClick.bind(self);
      cylinder.addEventListener('click', handlers[0]);

      cylinder.cursor = 'pointer';
    },

    stop: function() {
      var self = this, cylinder = self.cylinder;

      //self.beaker.stop();
      cylinder.stop();
      cylinder.removeEventListener('click', self.handlers[0]);
      cylinder.cursor = 'auto';
      self.scene.setChildIndex(cylinder, cylinder.index);

      base.stop.call(this);
    },

    update: function(event) {
      var self = this, cylinder = self.cylinder, beaker = self.beaker, volume, delta;
      cylinder.refresh();
      if (self.flags[0] && !self.flags[1]) {
        delta = event.delta / 50;
        volume = cylinder.store('volume');
        if (volume<=0){
          volume = 0;
          self.flags[1] = true;
          Tween.get(cylinder)
            .to({
              x: cylinder.location.x,
              y: cylinder.location.y,
              rotation: 0
            }, 500)
            .call(function() {
              self.stop();
            });

        } else {
          volume -= delta;
        }
        cylinder.store('volume', volume);
        beaker.store('volume', beaker.store('volume') + delta);
      }
    },

    onClick: function() {
      var self = this;
      if (!self.beaker.active) { return; }
      Tween.get(self.cylinder)
        .to({x: 240, y: 500, rotation: -85}, 500)
        .call(function() {
          self.flags[0] = true;
        })
        .to({rotation: -90}, 1000);

    }
  });
})();
