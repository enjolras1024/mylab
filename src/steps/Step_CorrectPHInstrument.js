//##############################################################################
// src/steps/Step_CorrectPHInstrument.js
//##############################################################################
ENJ.Step_CorrectPHInstrument = (function() {
  var Step = ENJ.Step,
    Tween = CRE.Tween;

  var base = Step.prototype;
  
  return ENJ.defineClass({
    /**
     * 校准PH仪
     * 所用：PH仪
     *
     * @constructor
     */
    constructor: function Step_CorrectPHInstrument() {
      Step.apply(this, arguments);
    }, extend: Step,

    start: function() {
      base.start.call(this);
      var scene = this.scene, store = this.store, handlers = this.handlers = [];

      var phInstrument = this.phInstrument = scene.phInstrument;

      handlers[0] = this.onCorrect.bind(this);
      phInstrument.addEventListener('correct', handlers[0]);
      phInstrument.start();
      phInstrument.willCorrect();
    },

    stop: function() {
      var phInstrument = this.phInstrument;
      phInstrument.removeEventListener('correct', this.handlers[0]);
      phInstrument.stop();
      base.stop.call(this);
    },

    onCorrect: function() {
      var phInstrument = this.phInstrument;
      phInstrument.store('number','CAXXXX');
      Tween.get(phInstrument)
        .wait(2000)
        .call(this.stop.bind(this));
      //this.stop();
    }
  });
})();
