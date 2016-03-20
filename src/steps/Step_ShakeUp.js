//##############################################################################
// src/steps/Step_ShakeUp.js
//##############################################################################
ENJ.Step_ShakeUp = (function() {
  var Step = ENJ.Step,
    Tween = CRE.Tween;

  var base = Step.prototype;
  
  return ENJ.defineClass({
    /**
     * 摇匀
     * 所用：容量瓶
     *
     * @constructor
     */
    constructor: function Step_ShakeUp() {
      Step.apply(this, arguments);
    }, extend: Step,

    start: function() {
      base.start.call(this);
      var flask, flags = this.flags = [], handlers = this.handlers = [];

      flask = this.flask = this.scene.volumetricFlasks[this.store.flask];

      handlers[0] = this.onClickFlask.bind(this);

      Tween.get(flask).to({
        regX: 62, regY: 120, x: 300, y: 400, rotation: 30
      }, 250).call(function() {
        flags[0] = true;
      });

      flask.addEventListener('click', handlers[0]);
    },

    stop: function() {
      var flask = this.flask;

      Tween.get(flask).to({
        x: flask.location.x, y: flask.location.y, regX: 0, regY: 0
      }, 250).call(function() {
        flask.rotation = 0;
        flask.refresh();
      });

      flask.removeEventListener('click', this.handlers[0]);
      base.stop.call(this);
    },

    update: function() {
      this.flask.refresh();
    },

    onClickFlask: function() {
      if (!this.flags[0]) { return; }
      var flask = this.flask, stop = this.stop.bind(this);
      Tween.get(flask)
        .to({ rotation: 180 }, 500)
        .to({ rotation: 0 }, 500)
        .to({ rotation: 180 }, 500)
        .to({ rotation: 0 }, 500)
        .call(function() {
          stop();
        });
    }
  });
})();
