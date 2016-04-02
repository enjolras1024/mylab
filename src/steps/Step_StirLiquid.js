//##############################################################################
// src/steps/Step_StirLiquid.js
//##############################################################################
ENJ.Step_StirLiquid = (function() {
  var Step = ENJ.Step,
    Tween = CRE.Tween;

  var base = Step.prototype;
  
  return ENJ.defineClass({
    /**
     * 搅拌烧杯中的液体
     * 所用：烧杯、引流棒
     *
     * @constructor
     */
    constructor: function Step_StirLiquid() {
      Step.apply(this, arguments);
    }, extend: Step,

    start: function() {
      base.start.call(this);
      var store = this.store, scene = this.scene,
        handlers = this.handlers = [], bar;//, pipet, bottle, suckBall;

      this.flags = [];
      this.time = 0;

      this.beaker = scene.beakers[store.beaker];
      bar = this.bar = scene.drainageBar;
      bar.cursor = 'pointer';

      if(this.store.remain) {
        Tween.get(bar).to({
          x: 410, y: 300, rotation: 10
        }, 500);
      }

      handlers[0] = this.onClickDrainageBar.bind(this);
      bar.addEventListener('click', handlers[0]);
    },

    stop: function() {
      //var handles = this.handles;
      this.bar.cursor = 'auto';
      this.bar.removeEventListener('click', this.handlers[0]);

      base.stop.call(this);
    },

    update: function(event) {
      if (this.flags[0]) {
        this.time += event.delta;
        if (this.time > 5000) {
          this.tween.loop = false;
          this.stop();
        }
      }
    },

    onClickDrainageBar: function() {
      if (this.flags[0]) { return; }
      this.flags[0] = true;

      this.tween = Tween.get(this.bar, { loop: true }).to({
        x: 360
      }, 250).to({
        x: 410
      }, 250);
    }
  });
})();
