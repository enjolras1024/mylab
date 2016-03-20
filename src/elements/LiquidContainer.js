//##############################################################################
// src/elements/LiquidContainer.js
//##############################################################################
ENJ.LiquidContainer = (function() {
  var Element = ENJ.Element,
    Bitmap = CRE.Bitmap,
    Tween = CRE.Tween;

  return ENJ.defineClass({
    /**
     * Container that contains liquid. You may change its volume.
     *
     * @class
     * @extends ENJ.Element
     *
     * @constructor
     * @param {Object} store
     */
    constructor: function LiquidContainer(store) {
      Element.apply(this, arguments);
    }, extend: Element,
    /**
     * @override
     */
    register: function () {
      Element.prototype.register.call(this);
      this.shape = null;
      this.label = null;
      //this._data = null;
    },

    /**
     * @override
     */
    refresh: function () {
      //base.refresh.call(this);
      //this.rotation += 0.1;
      this.shape.rotation = -this.rotation;
    },

    /**
     * @method showLabel
     */
    showLabel: function () {
      var label = this.label;
      if (label) {
        label.alpha = 1.0;
        label.visible = true;
      }
    },

    /**
     * @method hideLabel
     */
    hideLabel: function () {
      var label = this.label;
      if (label) {
        Tween.get(label)
          .to({alpha: 0.0}, 1000)
          .call(function() {
            label.visible = false;
          });

      }
    }
  }, {
    /**
     * Create liquid bitmap.
     *
     * @method createLiquid
     * @param {String} resId - resource id
     * @param {Number} color - ARGB
     * @param {CRE.Shape} mask
     * @returns {CRE.Bitmap}
     * @static
     */
    createLiquid: function (resId, color, mask) {
      var liquid = new Bitmap(RES.getRes(resId));

      var a, r, g, b, bounds = liquid.getBounds().clone();

      a = ((color >> 24) & 0xff) / 255;
      r = (color >> 16) & 0xff;
      g = (color >> 8) & 0xff;
      b = color & 0xff;

      liquid.filters = [new CRE.ColorFilter(0, 0, 0, a, r, g, b, 0)];
      liquid.cache(0, 0, bounds.width, bounds.height);
      liquid.setBounds(0, 0, bounds.width, bounds.height);

      liquid.mask = mask;

      //mask.compositeOperation = 'destination-in';

      return liquid;
    }
  });
})();
