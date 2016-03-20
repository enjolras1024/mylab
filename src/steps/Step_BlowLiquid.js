//##############################################################################
// src/steps/Step_BlowLiquid.js
//##############################################################################
ENJ.Step_BlowLiquid = (function() {
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
    constructor: function Step_BlowLiquid() {
      Step.apply(this, arguments);
    }, extend: Step,

    start: function() {
      base.start.call(this);
      var scene = this.scene, store = this.store, point,
        handlers = this.handlers = [], hand, pipet, bottle;

      this.flags = [];

      hand = this.hand = scene.hand;
      pipet = this.pipet = scene.pipet;

      if ('bottle' in store) {
        bottle = this.bottle = scene[store.bottle];
      } else if ('beaker' in store){
        bottle = this.bottle = scene.beakers[store.beaker];
      }


      scene.setChildIndex(pipet, scene.getChildIndex(bottle) - 1);

      handlers[0] = this.onClick.bind(this);
      hand.addEventListener('click', handlers[0]);

      this.flags[0] = store.rightNow;


      bottle.visible = true;
      hand.set({visible:true, y:pipet.y - 20});

      var self = this,
        change = function() {
          self.flags[2] = true;
          if(store.rightNow){
            hand.gotoAndStop('up');
          }
        };
      if (store.rotation) {
        if (store.point) {
          point = store.point;
        } else {
          point = {x: 305, y: 400};
        }

        var offsetX = store.offsetX || 0, offsetY = store.offsetY || 0;

        Tween.get(bottle).to({
          x: point.x + offsetX,
          y: point.y + offsetY,
          rotation: store.rotation
        }, 500).call(change);

        Tween.get(hand).to({y:point.y-210},500);
        Tween.get(pipet).to({y:point.y-190},500);
      } else {
        point = {x: 300, y: 500};
        Tween.get(bottle).to({
          x: point.x,
          y: point.y
        }, 500).call(change);

        Tween.get(hand).to({y:point.y-270},500);
        Tween.get(pipet).to({y:point.y-250},500);
      }
    },

    stop: function() {
      var bottle = this.bottle, hand = this.hand;
      bottle.stop();
      hand.visible = false;
      hand.gotoAndStop('down');
      this.scene.setChildIndex(bottle, bottle.index);
      hand.removeEventListener('click', this.handlers[0]);
      base.stop.call(this);
    },

    update: function(event) {
      var volume, delta, self = this, hand = this.hand, bottle = this.bottle, pipet = this.pipet,
        target = this.store.volume, remain = this.store.remain, showLabel = this.store.showLabel;

      bottle.refresh();
      if (this.flags[0] && !this.flags[1] && this.flags[2]) {
        volume = pipet.store('volume');
        delta = event.delta / 1000;
        if (volume <= target) {
          volume = target;
          this.flags[1] = true;
          hand.gotoAndStop('down');

//                if (remain) {

          if (remain > 1) {
            this.stop();
          } else {
            Tween.get(bottle)
              .wait(1000)
              .to({ x: bottle.location.x, y: bottle.location.y, rotation: 0 }, 500)
              .call(function(){
                self.scene.setChildIndex(bottle, bottle.index);
                self.stop();
              });
          }

          if (showLabel) {
            pipet.hideLabel();
          }

        } else {
          volume -= delta;
        }
        if (showLabel) {
          pipet.showLabel();
        }
        pipet.store('volume', volume);
        bottle.store('volume', bottle.store('volume') + delta);
      }
    },

    onClick: function() {
      if (!this.flags[2] || this.flags[0] ) { return; }
      this.flags[0] = true;
      this.hand.gotoAndStop('up');
    }
  });
})();
