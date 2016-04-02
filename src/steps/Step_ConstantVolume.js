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
        handlers = this.handlers = [], bottle, flask;

      flask = this.flask = scene.volumetricFlasks[store.flask];
      bottle = this.bottle = scene.waterBottle;

      this.flags = [];

      if (!flask.active) {
        flask.start();
      }

      if (!bottle.active/*this.store.keeping*/) {
        //bottle.active = true;
        bottle.start();
        Tween.get(bottle).to({
          x: flask.x + 100, y: flask.y - 100
        }, 250);
      }

      handlers[0] = this.onClickBottle.bind(this);
      bottle.addEventListener('click', handlers[0]);

      bottle.cursor = 'pointer';
    },

    stop: function() {
      var bottle = this.bottle, flask = this.flask;

//      flask.stop();
//
//      bottle.stop();
//      //bottle.active = false;
//      Tween.get(bottle).to(
//        {x:bottle.location.x,y:bottle.location.y,rotation:0}
//        , 250);
      bottle.cursor = 'auto';
      bottle.removeEventListener('click', this.handlers[0]);

      base.stop.call(this);
    },

    update: function(event) {
      var volume, flask = this.flask, bottle = this.bottle;
      if (/*this.active && */this.flags[0] && !this.flags[1]) {
        volume = flask.store('volume') + event.delta/100;
        if (volume >= this.store.volume) {
          volume = this.store.volume;
          this.flags[1] = true;
          flask.stop();

          bottle.stop();
          //bottle.active = false;
          Tween.get(bottle).to(
            {x:bottle.location.x,y:bottle.location.y,rotation:0}
            , 250).call(this.stop.bind(this));
        }
        flask.store('volume', volume);
      }
    },

    onClickBottle: function() {
      if (!this.flags[0]) {
        this.flags[0] = true;
        Tween.get(this.bottle).to({x:this.flask.x + 50,y: this.flask.y - 20,rotation:-30},250);
      }
    }
  });
})();
