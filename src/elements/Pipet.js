//##############################################################################
// src/elements/Pipet.js
//##############################################################################
ENJ.Pipet = (function() {
  var LiquidContainer = ENJ.LiquidContainer,
    Shape = CRE.Shape,
    Bitmap = CRE.Bitmap,
    Graphics = CRE.Graphics;

  return ENJ.defineClass({
    /**
     *
     * @class Pipet
     * @extends LiquidContainer
     *
     * @constructor
     * @param {Object} store
     */
    constructor: function Pipet(store) {
      LiquidContainer.apply(this, arguments);
    }, extend: LiquidContainer,
    /**
     * @override
     */
    ready: function() {
      var self = this, graphics, shape, label, liquid, pipe;

      graphics = new Graphics();
      graphics.beginFill('#0f0').drawRect(-200, 0, 400, 240);

      shape = new Shape(graphics);
      shape.x = 8;

      label = new ENJ.NumLabel({ unit: 'ml' });
      label.visible = false;
      label.x = 10;

      liquid = LiquidContainer.createLiquid("移液管液体", self.store('color'), shape);

      pipe = new Bitmap(RES.getRes("移液管"));

      self.addChild(liquid, pipe, label);

      self.set({
        label: label,
        shape: shape,
        rotation: -90,
        ratio: this.store('ratio') || 1
      });

      //this.store('volume', 5);
      self.storeChanged('volume');
    },

    /**
     * @override
     */
    storeChanged: function(key) {
      var value = this.store(key), label = this.label, shape = this.shape;
      switch (key) {
        case 'volume':
          //this.shape.y = 240 - value * 240 / 8 + 16;
          shape.set({
            y: 240 - value * 240 / 8 + 60,
            scaleY: value / 8
          });

          label.store('num', value * this.ratio);
          label.y = shape.y - 10;
          break;
      }
    }
  });
})();

