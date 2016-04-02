//##############################################################################
// src/steps/Step_AddRotor.js
//##############################################################################
ENJ.Step_AddRotor = (function() {
  var Step = ENJ.Step,
    Tween = CRE.Tween;

  var base = Step.prototype;

  return ENJ.defineClass({
    /**
     * 加入转子
     * 所用：烧杯、转子
     *
     * @constructor
     */
    constructor: function Step_AddRotor() {
      Step.apply(this, arguments);
    }, extend: Step,

    start: function() {
      base.start.call(this);

      var scene = this.scene, store = this.store,
        handlers = this.handlers = [], rotor;

      rotor =  this.rotor = scene.rotors[store.rotor];
      this.beaker = scene.beakers[store.beaker];

      Tween.get(rotor).to({
        x: 450, y: 550
      }, 250);

      handlers[0] = this.onClickRotor.bind(this);
      rotor.addEventListener('click', handlers[0]);
      rotor.cursor = 'pointer';
    },

    stop: function() {
      this.rotor.removeEventListener('click', this.handlers[0]);
      base.stop.call(this);
    },

    onClickRotor: function() {
      var rotor = this.rotor, beaker = this.beaker,
        stop = this.stop.bind(this);

      rotor.cursor = 'auto';
      Tween.get(rotor)
        .to({x: beaker.x + 10, y: beaker.y - 50}, 250)
        .call(function(){
          rotor.set({x:10,y:-50});
          beaker.addChild(rotor);
          beaker.setChildIndex(rotor, 0);

          Tween.get(rotor)
            .to({y: 80 }, 500)
            .call(stop)
        });
    }
  });
})();
