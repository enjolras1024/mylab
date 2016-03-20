///##############################################################################
// src/elements/MagneticStirrer.js
//###############################################################################
ENJ.MagneticStirrer = (function() {
  var Element = ENJ.Element,
    Tween = CRE.Tween,
    Bitmap = CRE.Bitmap;

  return ENJ.defineClass({
    /**
     *
     * @class MagneticStirrer
     * @extends Element
     *
     * @constructor
     */
    constructor: function MagneticStirrer() {
      Element.apply(this, arguments);
    }, extend: Element,
    /**
     * @override
     */
    ready: function () {
      var stirrer, button;

      stirrer = new Bitmap(RES.getRes("磁力搅拌器"));
      button = new Bitmap(RES.getRes("磁力搅拌器旋钮"));
      button.set({ x: 98.5, y: 109, regX: 12.5, regY: 13 });

      this.addChild(stirrer, button);

      this.button = button;
    },

    /**
     * @override
     */
    start: function () {
      Element.prototype.start.call(this);
      Tween.get(this.button).to({ rotation: 120 }, 250);

    },

    /**
     * @override
     */
    stop: function () {
      Tween.get(this.button).to({ rotation: 0 }, 250);
      Element.prototype.stop.call(this);
    }
  });
})();
