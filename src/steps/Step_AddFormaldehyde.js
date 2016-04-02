//##############################################################################
// src/steps/Step_AddFormaldehyde.js
//##############################################################################
ENJ.Step_AddFormaldehyde = (function() {
  var Step = ENJ.Step,
    Tween = CRE.Tween;

  var base = Step.prototype;

  return ENJ.defineClass({
    /**
     * 添加甲醛
     * 所用：甲醛、烧杯、手、移液管
     *
     * @constructor
     */
    constructor: function Step_AddFormaldehyde() {
      Step.apply(this, arguments);
    }, extend: Step,

    start: function() {
      base.start.call(this);
      var scene = this.scene, store = this.store,
        handlers = this.handlers = [], hand, pipet, bottle;

      this.flags = [];

      hand = this.hand = scene.hand;
      pipet = this.pipet = store.pipet ?  scene[store.pipet] : scene.pipet;

      bottle = this.bottle = scene.beakers[store.beaker];
      //bottle.fix();
      bottle.start();


      //scene.setChildIndex(pipet, scene.getChildIndex(bottle) - 1);

      handlers[0] = this.onClick.bind(this);
      hand.addEventListener('click', handlers[0]);

      //this.flags[0] = store.rightNow;


      bottle.visible = true;
      hand.set({visible:true, y:pipet.y - 20});


      Tween.get(hand).to({y:bottle.y-270, x: bottle.x},500);
      Tween.get(pipet).to({y:bottle.y-250, x: bottle.x+10},500);
    },

    stop: function() {
      var bottle = this.bottle, hand = this.hand;
      bottle.stop();
      hand.visible = false;
      hand.gotoAndStop('down');
      //this.scene.setChildIndex(bottle, bottle.index);
      hand.removeEventListener('click', this.handlers[0]);
      base.stop.call(this);
    },

    update: function(event) {
      var volume, delta, hand = this.hand, bottle = this.bottle, pipet = this.pipet,
        target = 0, showLabel = this.store.showLabel;

      bottle.refresh();
      if (this.flags[0] && !this.flags[1]) {
        volume = pipet.store('volume');
        delta = event.delta / 1000;
        if (volume <= target) {
          volume = target;
          this.flags[1] = true;
          hand.gotoAndStop('down');

//                if (remain) {



          if (showLabel) {
            pipet.hideLabel();
          }
          //if (volume<=0) {
//          Tween.get(bottle)
//            .to({
//              x: bottle.location.x,
//              y: bottle.location.y
//            },500);

            Tween.get(pipet)
              .to({
                x: pipet.location.x,
                y: pipet.location.y,
                rotation: -90
              },500).call(this.stop.bind(this));
          //}

        } else {
          volume -= delta;
        }
        if (showLabel) {
          pipet.showLabel();
        }
        pipet.store('volume', volume);
        bottle.store('volume', bottle.store('volume') + delta );
      }
    },

    onClick: function() {
      if (this.flags[0] ) { return; }
      this.flags[0] = true;
      this.hand.gotoAndStop('up');
    }
  });
})();
