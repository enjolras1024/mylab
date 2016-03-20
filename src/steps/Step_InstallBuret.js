//##############################################################################
// src/steps/Step_InstallBuret.js
//##############################################################################
ENJ.Step_InstallBuret = (function() {
  var Step = ENJ.Step,
    Tween = CRE.Tween;

  return ENJ.defineClass({
    constructor: function Step_InstallBuret() {
      Step.apply(this, arguments);
    }, extend: Step,

    start: function() {
      Step.prototype.start.call(this);
      var self = this, scene = self.scene, store = self.store;

      var stand = scene.titrationStand;
      var buret = scene.buret;

      Tween.get(stand)
        .to({x: 518, y: 50}, 500)
        /*.call(function() {
          stand.start();
        })*/;

      Tween.get(buret)
        .wait(500)
        .to({x: 600, y: -50}, 500)
        .call(function() {
          stand.start();
          self.stop();
        });
    }/*,

    stop: function() {

      Step.prototype.stop.call(this);
    }*/
  });
})();
