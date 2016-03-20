//##############################################################################
// src/steps/Step_BlowBuret.js
//##############################################################################
ENJ.Step_BlowBuret = (function() {
  var Step = ENJ.Step,
    Tween = CRE.Tween;

  var base = Step.prototype;
  
  return ENJ.defineClass({
    /**
     * 将移液管中液体慢慢注入容器
     * 所用：手、移液管、容器
     *
     * @constructor
     */
    constructor: function Step_BlowBuret() {
      Step.apply(this, arguments);
    }, extend: Step,

    start: function() {
      base.start.call(this);
      var self = this, scene = self.scene, store = self.store, drop,
        handlers = self.handlers = [], hand, buret, bottle;

      self.flags = [];

      hand = self.hand = scene.hand;
      buret = self.buret = scene.buret;
      bottle = self.bottle = scene[store.bottle];

      //scene.setChildIndex(buret, scene.getChildIndex(bottle) - 1);

      handlers[0] = self.onClick.bind(self);
      hand.addEventListener('mousedown', handlers[0]);
      hand.addEventListener('pressup', handlers[0]);

      Tween.get(buret)
        .to({x: 335, y: 10, rotation: 0}, 500);

      if ( !store.remain ) {
        Tween.get(bottle)
          .to({
            x: 335 ,
            y: 10 + 500
          }, 500);
      }

      hand.set({
        visible: true,
        scaleX: -1,
        x: 335 + 30,
        y: 10 + 400
      });
      hand.gotoAndStop('up');
    },

    stop: function() {
      var self = this, bottle = self.bottle, hand = self.hand;
      bottle.stop();
      hand.set({visible: false, scaleX: 1});

      hand.removeEventListener('mousedown', self.handlers[0]);
      hand.removeEventListener('pressup', self.handlers[0]);
      //hand.gotoAndStop('down');
      //this.scene.setChildIndex(bottle, bottle.index);
      //hand.removeEventListener('click', this.handlers[0]);
      base.stop.call(this);
    },

    update: function(event) {
      var self = this, volume, delta,
        bottle = self.bottle, buret = self.buret,
        target = self.store.volume;

      buret.refresh();
      if (this.flags[0] && !this.flags[1]) {
        volume = buret.store('volume');
        delta = event.delta / 100;
        if (volume <= target) {
          volume = target;
          this.flags[1] = true;
          if (!self.store.remain){
            Tween.get(bottle)
              .to({
                x: bottle.location.x,
                y: bottle.location.y
              }, 500)
              .call(function() {
                self.stop();
              });
          } else {
            self.stop();
          }

        } else {
          volume -= delta;
        }

        buret.store('volume', volume);
        if (!self.store.remain){
          bottle.store('volume', bottle.store('volume') + delta * 0.1);
        } else {
          //TODO
        }

      }
    },

    onClick: function(event) {
      var self = this, hand = self.hand;
      switch (event.type) {
        case 'mousedown':
          self.flags[0] = true;
          hand.gotoAndStop('down');
          break;
        case 'pressup':
          self.flags[0] = false;
          hand.gotoAndStop('up');
          break;
      }
    }
  });
})();