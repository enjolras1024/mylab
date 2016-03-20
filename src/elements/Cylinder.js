//##############################################################################
// src/elements/Cylinder.js
//##############################################################################
ENJ.Cylinder = (function() {
  var LiquidContainer = ENJ.LiquidContainer,
    Shape = CRE.Shape,
    Bitmap = CRE.Bitmap,
    Graphics = CRE.Graphics;

  return ENJ.defineClass({
    /**
     *
     * @class Cylinder
     * @extends LiquidContainer
     *
     * @constructor
     */
    constructor: function Cylinder(store) {
      LiquidContainer.call(this, store);
    }, extend: LiquidContainer,
    /**
     * @override
     */
    ready: function() {
      var self = this, graphics, shape, liquid, barrel;

      graphics = new Graphics();
      graphics.beginFill('#0f0').drawRect(-300, 0, 600, 400);

      shape = new Shape(graphics);
      shape.x = 35;

      liquid = LiquidContainer.createLiquid("量筒液体", self.store('color'), shape);
      barrel = new Bitmap(RES.getRes("量筒"));

      self.addChild(liquid, barrel);

      //this.label = label;
      self.shape = shape;

      //this.store('volume', 5);
      self.storeChanged('volume');
    },
    /**
     * @override
     */
    storeChanged: function(key) {
      var value = this.store(key);
      switch (key) {
        case 'volume':
          this.shape.y = 290 - value * 2.15 - 25;
          //label.num = value;
          //label.y = shape.y - 10;
          break;
      }
    }
  });
})();