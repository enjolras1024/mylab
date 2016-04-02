//##############################################################################
// src/steps/Step_DumpFromFlask.js
//##############################################################################
ENJ.Step_DumpFromFlask = (function() {
  var Step = ENJ.Step,
    Tween = CRE.Tween;

  var base = Step.prototype;
  
  return ENJ.defineClass({
    /**
     * 将容量瓶中液体倒入烧杯
     * 所用：容量瓶、烧杯
     *
     * @constructor
     */
    constructor: function Step_DumpFromFlask() {
      Step.apply(this, arguments);
    }, extend: Step,

    start: function() {
      base.start.call(this);

      var scene = this.scene, store = this.store,
        handlers = this.handlers = [], flask, beaker;

      flask = this.flask = scene.volumetricFlasks[store.flask];
      beaker = this.beaker = scene.beakers[store.beaker];

      this.flags = [];

      handlers[0] = this.onClickFlask.bind(this);
      flask.addEventListener('click', handlers[0]);
      flask.cursor = 'pointer';

      flask.start();
      Tween.get(flask).to({
        x: 350, y: 530, rotation: -60
      }, 250);

      beaker.start();
      Tween.get(beaker).to({
        x: 300, y: 500
      }, 250);
    },

    stop: function() {
      var flask =this.flask;
      flask.cursor = 'auto';
      flask.refresh();
      flask.stop();
      this.scene.setChildIndex(flask, 1);
      flask.removeEventListener('click', this.handlers[0]);

      base.stop.call(this);
    },

    update: function(event) {
      var volume, delta, beaker = this.beaker, flask = this.flask;
      flask.refresh();
      if (this.flags[0] && !this.flags[1]) {
        delta = event.delta / 100;
        volume = beaker.store('volume');

        if (volume >= this.store.volume) {
          this.flags[1] = true;
          volume = this.store.volume;
        } else {
          volume += delta;
        }

        flask.store('volume', flask.store('volume') - delta);
        beaker.store('volume', volume);
      }
    },

    onClickFlask: function() {
      if (this.flags[0]) { return; }
      var flask = this.flask;
      this.flags[0] = true;
      flask.rotation = -75;
      Tween.get(flask)
        .to({ rotation: -85 }, 3000)
        .to({
          x: flask.location.x, y: flask.location.y - 30, rotation: 0
        }, 250).call(
        this.stop.bind(this)
      );
    }
  });
})();
