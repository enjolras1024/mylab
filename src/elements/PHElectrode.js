//##############################################################################
// src/elements/PHElectrode.js
//##############################################################################
ENJ.PHElectrode = (function() {
  var Element = ENJ.Element,
    Tween = CRE.Tween,
    Bitmap = CRE.Bitmap;

  return ENJ.defineClass({
    /**
     *
     * @class PHElectrode
     * @extends Element
     *
     * @constructor
     */
    constructor: function PHElectrode() {
      Element.apply(this, arguments);
    }, extend: Element,
    /**
     * @override
     */
    ready: function() {
      var electrode, cap;

      cap = new Bitmap(RES.getRes("PH电极套"));
      cap.x = -2.5;
      cap.y = 150;
      electrode = new Bitmap(RES.getRes("PH电极"));

      this.addChild(electrode, cap);

      this.cap = cap;
    },

    /**
     * @override
     */
    start: function() {
      Element.prototype.start.call(this);
      Tween.get(this.cap).to({
        x:10, y: 250, rotation: -30, alpha: 0.0
      }, 250);
    },

    /**
     * @override
     */
    stop: function() {
      Element.prototype.stop.call(this);
      Tween.get(this.cap).to({
        x:0, y: 150, rotation: 0, alpha: 1.0
      }, 250);
    }
  });
})();
