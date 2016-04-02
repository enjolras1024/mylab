//##############################################################################
// src/steps/Step_TransferLiquid.js
//##############################################################################
ENJ.Step_TransferLiquid = (function() {
  var Step = ENJ.Step,
    Tween = CRE.Tween;

  var base = Step.prototype;
  
  return ENJ.defineClass({
    /**
     * 将烧杯中的液体转移到容量瓶中
     * 所用：容量瓶、烧杯、引流棒
     *
     * @constructor
     */
    constructor: function Step_TransferLiquid() {
      Step.apply(this, arguments);
    }, extend: Step,

    start: function() {
      base.start.call(this);

      var scene = this.scene, store = this.store,
        handlers = this.handlers = [], bar, beaker, flask;

      this.flags = [];

      bar = this.bar = scene.drainageBar;
      beaker = this.beaker = scene.beakers[store.beaker];
      flask = this.flask = scene.volumetricFlasks[store.flask];

      beaker.cursor = 'pointer';

      flask.start();
      Tween.get(flask).to({
        x: 250, y: 300
      }, 250);

      Tween.get(bar).to({
        x: 350, y: 100
      }, 250);

      beaker.fix();
      //this.beaker.regX = 100;
      //this.beaker.scaleX = -1;
      Tween.get(beaker).to({
        x: 330, y: 250, rotation: 30
      }, 250);

      handlers[0] = this.onClickBeaker.bind(this);
      beaker.addEventListener('click', handlers[0]);
    },

    stop: function() {
      var beaker = this.beaker;

      /*beaker.unfix();
       //this.beaker.regX = 0;
       Tween.get(beaker).to({
       x: 300, y: 500, rotation: 0
       }, 250);

       Tween.get(this.bar).to({
       x: 410, y: 300*//*, rotation: 10*//*
       }, 500);*/

      beaker.cursor = 'auto';
      beaker.removeEventListener('click', this.handlers[0]);

      base.stop.call(this);
    },

    update: function(event) {
      var bar = this.bar, beaker = this.beaker, flask = this.flask, volume, delta;

      beaker.refresh();
      if(this.flags[0]) {
        delta = event.delta / 5000 * 20;
        volume = beaker.store('volume') - delta;
        if (volume <= 0) {
          this.flags[0] = false;
          volume = 0;
          //this.stop();

          beaker.unfix();

          if (this.store.remain) {
            //this.beaker.regX = 0;
            Tween.get(beaker).to({
              x: 300, y: 500, rotation: 0
            }, 250);

            Tween.get(bar).to({
              x: 410, y: 300/*, rotation: 10*/
            }, 500).call(this.stop.bind(this));
          } else {
            //this.beaker.regX = 0;
            Tween.get(beaker).to({
              x: -500, y: 0, rotation: 0
            }, 250).call(function() {
              beaker.visible = false;
            });

            Tween.get(bar).to({
              x: bar.location.x, y: bar.location.y, rotation: -90
            }, 500).call(this.stop.bind(this));
          }

        }

        beaker.store('volume',  volume);
        flask.store('volume', flask.store('volume')+delta);
      }
    },

    onClickBeaker: function() {
      if(!this.flags[0]) {
        this.flags[0] = true;
        Tween.get(this.beaker)
          .to({ rotation: 75 }, 1000)
          .to({ rotation: 85 }, 4000);
      }
    }
  });
})();
