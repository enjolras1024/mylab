//##############################################################################
// src/steps/Step_DumpWater.js
//##############################################################################
ENJ.Step_DumpWater = (function() {
  var Step = ENJ.Step,
    Tween = CRE.Tween;

  var base = Step.prototype;
  
  return ENJ.defineClass({
    /**
     * 将蒸馏水倒入烧杯，（清洗引流棒）
     * 所用：蒸馏水、烧杯、（引流棒）、水流动画
     *
     * @constructor
     */
    constructor: function Step_DumpWater () {
      Step.apply(this, arguments);
    }, extend: Step,

    start: function() {
      base.start.call(this);
      var scene = this.scene, handlers = this.handlers = [], bottle;

      bottle = this.bottle = scene.waterBottle;
      this.beaker = scene.beakers[this.store.beaker];

      this.flags =[];

      if(!bottle.active/*this.store.keeping*/) {
        //bottle.active = true;
        bottle.start();
        Tween.get(bottle).to({
          x: 400, y: 400
        }, 250);
      }

      handlers[0] = this.onClickBottle.bind(this);
      bottle.addEventListener('click', handlers[0]);
      bottle.cursor = 'pointer';
    },

    stop: function() {

      this.bottle.removeEventListener('click', this.handlers[0]);
      this.bottle.cursor = 'auto';
      //this.bottle.active = false;
      this.bottle.stop();


      base.stop.call(this);
    },

    update: function(event) {
      var beaker = this.beaker, volume;
      if (this.flags[1]) {
        volume = beaker.store('volume');

        if (volume > this.store.volume) {
          this.stop();
        }

        beaker.store('volume', volume + event.delta / 100);
      }
    },

    onClickBottle: function() {
      var bottle = this.bottle, self = this, ratio;
      if (!this.flags[0]) {
        this.flags[0] = true;
        //ratio = (this.store.volume - this.beaker.store('volume')) / 10;

        if(this.store.washing) {
          Tween.get(bottle)
            .to({ rotation: -30, x: 360, y: 450 }, 250)
            .call(function() {
              self.flags[1] = true;
              bottle.dump(true, 0);
            })
            .to({ x: 370, y: 400 }, 500)
            .to({ x: 360, y: 450 }, 500)
            .to({ x: 370, y: 400 }, 500)
            .to({ x: 360, y: 450 }, 500)
            .call(function() {
              bottle.dump(false, 0);
            })
            //.wait(1000 * ratio)
            .to({ rotation: 0, x: bottle.location.x, y: bottle.location.y }, 250);
        } else {
          Tween.get(bottle)
            .to({ rotation: -30, x: 340, y: 430 }, 250)
            .call(function() {
              self.flags[1] = true;
              bottle.dump(true, 0);
            })
            .wait(1000)
            .call(function() {
              bottle.dump(false, 0);
            })
            .to({ rotation: 0, x: bottle.location.x, y: bottle.location.y }, 250);
        }
        /*Tween.get(bottle)
         .to({ rotation: -30, x: 340, y: 430 }, 250)
         .call(function() {
         self.flags[1] = true;
         })
         .wait(1000 * ratio)
         .to({ rotation: 0, x: bottle.location.x, y: bottle.location.y }, 250);*/
      }
      /*var bottle = this.bottle;
       if (bottle.active) {

       } else {

       }*/
    }
  });
})();
