//##############################################################################
// src/steps/Step_DumpToCylinder.js
//##############################################################################
ENJ.Step_DumpToCylinder = (function() {
  var Step = ENJ.Step,
    Tween = CRE.Tween;

  var base = Step.prototype;
  
  return ENJ.defineClass({
    /**
     * 向量筒中加水
     * 所用：蒸馏水、量筒
     *
     * @constructor
     */
    constructor: function Step_DumpToCylinder() {
      Step.apply(this, arguments);
    }, extend: Step,

    start: function() {
      base.start.call(this);
      var self = this, scene = self.scene,
        handlers = self.handlers = [];

      self.cylinder = scene.cylinder;
      self.bottle = scene.waterBottle;

      self.flags = [];

      handlers[0] = self.onClick.bind(self);
      self.bottle.addEventListener('click', handlers[0]);
      self.bottle.cursor = 'pointer';

      scene.setChildIndex(self.cylinder, scene.getChildIndex(self.bottle) + 1);

      Tween.get(self.bottle)
        .to({x: 400, y: 360}, 500);
      Tween.get(self.cylinder)
        .to({x: 300, y: 300}, 500)
        .call(function() {
          self.cylinder.start();
        });
    },

    stop: function() {
      var self = this;
      self.bottle.stop();
      self.bottle.cursor = 'auto';
      self.bottle.removeEventListener('click', self.handlers[0]);
      base.stop.call(this);
    },

    update: function(event) {
      var self = this, cylinder = self.cylinder, bottle = self.bottle,
        target = self.store.volume, volume;
      if (self.flags[0] && !self.flags[1]) {
        volume = cylinder.store('volume');
        if (volume >= target) {
          self.flags[1] = true;
          volume = target;
          Tween.get(bottle)
            .to({
              x: bottle.location.x,
              y: bottle.location.y,
              rotation: 0
            }, 500)
            .call(function() {
              self.stop();
            });
        } else {
          volume += event.delta/100;
        }
        cylinder.store('volume', volume);
      }
    },

    onClick: function() {
      var self = this;//, cylinder = self.cylinder;
      if (!self.cylinder.active || self.bottle.active) {return;}

      self.bottle.start();
      Tween.get(self.bottle)
        .to({x: 340, y: 270, rotation: -30}, 500)
        .call(function() {
          self.flags[0] = true;
        })
        .wait(2000);
    }
  });
})();
