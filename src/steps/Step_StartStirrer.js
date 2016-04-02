//##############################################################################
// src/steps/Step_StartStirrer.js
//##############################################################################
ENJ.Step_StartStirrer = (function() {
  var Step = ENJ.Step,
    Tween = CRE.Tween;

  var base = Step.prototype;
  
  return ENJ.defineClass({
    /**
     * 开启磁力搅拌器
     * 所用：烧杯、电极、转子、磁力搅拌器
     *
     * @constructor
     */
    constructor: function Step_StartStirrer() {
      Step.apply(this, arguments);
    }, extend: Step,

    start: function() {
      base.start.call(this);
      var self = this, scene = self.scene, store = self.store,
        handlers = self.handlers = [], stirrer, beaker, electrode;

      stirrer = this.stirrer = scene.stirrer;
      electrode = this.electrode = scene.phElectrode;
      beaker = this.beaker = scene.beakers[store.beaker];
      this.rotor = scene.rotors[store.rotor];
      this.curve = scene.curve;

      this.flag = false;

      handlers[0] = this.onClickStirrer.bind(this);
      stirrer.addEventListener('click', handlers[0]);

      stirrer.cursor = 'pointer';

      Tween.get(beaker)
        .to({x:630,y:450},500)
        .call(function() {
          self.flag = true;
        });
      Tween.get(electrode)
        .to({y:electrode.location.y-150},500)
        .to({y:electrode.location.y},500);
    },

    stop: function() {
      this.curve.update(this.electrode, new CRE.Point(800,480));
      this.stirrer.cursor = 'auto';
      this.stirrer.removeEventListener('click', this.handlers[0]);
      base.stop.call(this);
    },

    update: function() {
      this.curve.update(this.electrode, new CRE.Point(800,480));
    },

    onClickStirrer: function() {
      if (!this.flag) { return; }
      this.stirrer.start();
      this.rotor.gotoAndPlay(0);
      this.stop();
    }
  });
})();
