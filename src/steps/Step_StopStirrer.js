//##############################################################################
// src/steps/Step_StopStirrer.js
//##############################################################################
ENJ.Step_StopStirrer = (function() {
  var Step = ENJ.Step,
    Tween = CRE.Tween;

  var base = Step.prototype;
  
  return ENJ.defineClass({
    /**
     * 关闭磁力搅拌器
     * 所用：烧杯、电极、转子、磁力搅拌器
     *
     * @constructor
     */
    constructor: function Step_StopStirrer() {
      Step.apply(this, arguments);
    }, extend: Step,

    start: function() {
      base.start.call(this);
      var scene = this.scene, store = this.store,
        handlers = this.handlers = [];

      this.stirrer = scene.stirrer;
      this.phElectrode = scene.phElectrode;
      this.beaker = scene.beakers[store.beaker];
      this.rotor = scene.rotors[store.rotor];
      this.curve = scene.curve;

      this.stirrer.cursor = 'pointer';

      this.flag = false;


      handlers[0] = this.onClickStirrer.bind(this);
      this.stirrer.addEventListener('click', handlers[0]);
    },

    stop: function() {
      this.curve.update(this.phElectrode, new CRE.Point(800,480));
      this.stirrer.cursor = 'auto';
      this.stirrer.removeEventListener('click', this.handlers[0]);
      base.stop.call(this);
    },

    update: function() {
      this.curve.update(this.phElectrode, new CRE.Point(800,480));
    },

    onClickStirrer: function() {
      if (this.flag) { return; }

      this.flag = true;
      this.stirrer.stop();
      this.rotor.gotoAndStop(0);

      var beaker = this.beaker;

      Tween.get(this.phElectrode)
        .to({y:this.phElectrode.location.y-150},500)
        .call(function(){
          Tween.get(beaker)
            .to({x:400,y:1000},500)
            .call(function(){
              beaker.visible = false;
              //@todo remove this beaker from scene
            });
        })
        .wait(500)
        .to({y:this.phElectrode.location.y},500)
        .call(this.stop.bind(this));
    }
  });
})();
