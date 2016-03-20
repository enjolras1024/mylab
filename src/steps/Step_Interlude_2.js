//##############################################################################
// src/steps/Step_Interlude_2.js
//##############################################################################
ENJ.Step_Interlude_2 = (function() {
  var Step = ENJ.Step,
    Tween = CRE.Tween;

  var base = Step.prototype;

  return ENJ.defineClass({
    /**
     * 过场
     * 所用：
     *
     * @constructor
     */
    constructor: function Step_Interlude_2() {
      Step.apply(this, arguments);
    }, extend: Step,

    start: function() {
      base.start.call(this);
      var self = this, scene = this.scene, rotors = scene.rotors, beakers = scene.beakers,
        store = this.store, board = scene.board;

      board.store('title', store.title);
      board.visible = true;
      Tween.get(board)
        .to({ alpha: 1.0 }, 500)
        .call( function() {
          scene.addChild(rotors[0]);
          scene.addChild(rotors[1]);
          scene.setChildIndex(rotors[0], rotors[0].index);
          scene.setChildIndex(rotors[1], rotors[1].index);

          rotors[0].set(rotors[0].location);
          rotors[1].set(rotors[1].location);

          var i, beaker;
          for (i = 0; i < beakers.length; i += 2) {
            beaker = beakers[i];
            beaker.visible = true;
            beaker.set(beaker.location);
            beaker.store('volume',0);
          }
        })
        .wait(1000)
        .to({ alpha: 0.0 }, 500)
        .call(function() {
          board.visible = false;
          self.stop();
        });
    },

    stop: function() {
      base.stop.call(this);
    }
  })

})();
