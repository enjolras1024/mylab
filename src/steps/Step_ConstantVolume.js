//##############################################################################
// src/steps/Step_ConstantVolume.js
//##############################################################################
ENJ.Step_ConstantVolume = (function() {
  var Step = ENJ.Step,
    Tween = CRE.Tween;

  var base = Step.prototype;
  
  return ENJ.defineClass({
    /**
     * 定容
     * 所用：蒸馏水、容量瓶
     *
     * @constructor
     */
    constructor: function Step_ConstantVolume() {
      Step.apply(this, arguments);
    }, extend: Step,

    start: function() {
      base.start.call(this);

      var scene = this.scene, store = this.store,
        handlers = this.handlers = [], bottle;

      this.flask = scene.volumetricFlasks[store.flask];
      bottle =this.bottle = scene.waterBottle;

      this.flags = [];

      if(!bottle.active/*this.store.keeping*/) {
        //bottle.active = true;
        bottle.start();
        Tween.get(bottle).to({
          x: 400, y: 400
        }, 250);
      }

      handlers[0] = this.onClickBottle.bind(this);
      bottle.addEventListener('click', handlers[0]);
    },

    stop: function() {
      var bottle = this.bottle, flask = this.flask;

      flask.stop();

      bottle.stop();
      //bottle.active = false;
      Tween.get(bottle).to(
        {x:bottle.location.x,y:bottle.location.y,rotation:0}
        , 250);

      bottle.removeEventListener('click', this.handlers[0]);

      base.stop.call(this);
    },

    update: function(event) {
      var volume, flask = this.flask;
      if (/*this.active && */this.flags[0]) {
        volume = flask.store('volume') + event.delta/100;
        if (volume >= this.store.volume) {
          volume = this.store.volume;
          this.stop();
        }
        flask.store('volume', volume);
      }
    },

    onClickBottle: function() {
      if (!this.flags[0]) {
        this.flags[0] = true;
        Tween.get(this.bottle).to({x:300,y:280,rotation:-30},250);
      }
    }
  });
})();
