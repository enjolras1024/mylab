//##############################################################################
// src/steps/Step_DumpToBuret.js
//##############################################################################
ENJ.Step_DumpToBuret = (function() {
  var Step = ENJ.Step,
    Tween = CRE.Tween;

  return ENJ.defineClass({
    /**
     * 向滴定管中注入试剂
     * 所用：滴定管、试剂瓶、盖子
     *
     * @constructor
     */
    constructor: function Step_DumpToBuret() {
      Step.apply(this, arguments);
    }, extend: Step,

    start: function() {
      Step.prototype.start.call(this);
      var self = this, scene = self.scene;

      //self.cap = scene.cap;
      self.buret = scene.buret;
      self.bottle = scene.reagenBottle;

      scene.setChildIndex(self.bottle, scene.getChildIndex(self.buret) - 1);

      self.flags = [];
      self.handlers = [];
      self.handlers[0] = self.onClick.bind(self);
      self.bottle.addEventListener('click', self.handlers[0]);
      self.bottle.cursor = 'pointer';

//      Tween.get(self.cap)
//        .to({rotation: -90}, 500)
//        .to({x: 650, y: 450, rotation: -180}, 500);

      Tween.get(self.buret)
        .to({x: 400, y: 400, rotation: 30}, 500);

      self.bottle.start();
      Tween.get(self.bottle)
        .to({x: 400, y: 415, rotation: -30}, 500)
        /*.call(function() {
          self.bottle.start();
        })*/;
    },
    stop: function() {
      var self = this, scene = self.scene, bottle = self.bottle;
      scene.setChildIndex(bottle, bottle.index);
      bottle.removeEventListener('click', self.handlers[0]);
      bottle.cursor = 'auto';
      bottle.refresh();
      bottle.stop();

      Step.prototype.stop.call(this);
    },
    update: function(event) {
      var self = this,
        buret = self.buret, bottle = self.bottle,
        target = self.store.volume, volume, delta;
      buret.refresh();
      bottle.refresh();
      if (self.flags[0] && !self.flags[1]) {
        delta = event.delta / 100;
        volume = buret.store('volume');

        if (volume >= target) {
          volume = target;
          self.flags[1] = true;
          Tween.get(bottle)
            .to({
              x: bottle.location.x,
              y: bottle.location.y,
              rotation: 0
            }, 500)
            .call(function() {
              self.stop();
            });
//          Tween.get(cap)
//            .to({
//              x: cap.location.x,
//              y: cap.location.y,
//              rotation: -90
//            }, 500)
//            .to({rotation: 0}, 500);
        } else {
          volume += delta;
        }
        bottle.store('volume', bottle.store('volume') - delta);
        buret.store('volume', volume);
      }
    },
    onClick: function() {
      var self = this;
      if (self.flags[0]) { return; }
      self.flags[0] = true;
      Tween.get(self.bottle)
        .to({rotation: -45}, 250)
        .to({rotation: -56}, 600);
    }
  });
})();
