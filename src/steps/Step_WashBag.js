//##############################################################################
// src/steps/Step_WashBag.js
//##############################################################################
ENJ.Step_WashBag = (function() {
  var Step = ENJ.Step,
    Tween = CRE.Tween;

  var base = Step.prototype;
  
  return ENJ.defineClass({
    /**
     * 清洗袋子内部残留粉末
     * 所用：蒸馏水、袋子、烧杯、粉末
     *
     * @constructor
     */
    constructor: function Step_WashBag() {
      Step.apply(this, arguments);
    }, extend: Step,

    start: function() {
      base.start.call(this);

      var store = this.store, scene = this.scene,
        handlers = this.handlers = [], bottle;

      this.time = 0;
      this.flags = [];

      this.bag = scene.bags[store.bag];
      this.beaker = scene.beakers[store.beaker];
      this.powder = scene.powder;
      bottle = this.bottle = scene.waterBottle;

      bottle.cursor = 'pointer';

      if(!bottle.active/*this.store.remain*/) {
        bottle.start();
        //bottle.active = true;
        Tween.get(bottle).to({
          x: 400, y: 400
        }, 250);
      }

      handlers[0] = this.onClickBottle.bind(this);
      bottle.addEventListener('click', handlers[0]);
    },

    stop: function() {
      var handlers = this.handlers;

      if(!this.store.remain) {
        Tween.get(this.bag).to({
          alpha: 0.0
        }, 250);
      } else {
        Tween.get(this.bag).to({
          rotation: 30
        }, 250);
      }

      /*if(!this.store.remain) {
       //this.bottle.stop();
       this.bottle.active = false;
       }*/

      this.bottle.cursor = 'auto';
      this.bottle.removeEventListener('click', handlers[0]);

      base.stop.call(this);
    },

    onClickBottle: function() {
      var self = this, bag = this.bag, beaker = this.beaker, bottle =  this.bottle;
      if (this.flags[0]) { return; }
      this.flags[0] = true;
      Tween.get(bottle).to({
        rotation: -30, x: 320, y: 430
      }, 250).call(function() {
        self.flags[1] = true;

        //var onComplete;


        Tween.get(bottle).wait(1000).to({
          rotation: 0, x: 400, y: 400
        }, 250);
        Tween.get(bag).wait(1000).to({
          rotation: 120
        }, 1000);//.call(onComplete);
      });
    },

    update: function(event) {
      var powder = this.powder, beaker = this.beaker, time, volume;
      if (this.flags[1]) {
        time = this.time += event.delta;
        volume = beaker.store('volume');
        if (volume >= this.store.volume) {
          //volume = this.store.volume;
          beaker.store('volume', this.store.volume);
          //this.flags[1] = false;
          this.stop();
        }

        if (time > 1000) {
          //volume += event.delta / 1000;
          beaker.store('volume', volume + event.delta / 200);
          if (powder.alpha > 0) {
            powder.alpha -= event.delta / 2000;
          } else {
            powder.visible = false;
          }
        }
      }
    }
  });
})();
