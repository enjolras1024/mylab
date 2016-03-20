//##############################################################################
// src/elements/Buret.js
//##############################################################################
ENJ.Buret = (function() {
  var LiquidContainer = ENJ.LiquidContainer,
    Shape = CRE.Shape,
    Bitmap = CRE.Bitmap,
    Graphics = CRE.Graphics;

  return ENJ.defineClass({
    /**
     *
     * @class Buret
     * @extends LiquidContainer
     *
     * @constructor
     */
    constructor: function Buret(store) {
      LiquidContainer.call(this, store);
    }, extend: LiquidContainer,
    /**
     * @override
     */
    ready: function() {
      var self = this, graphics, shape, liquid, pipe;

      graphics = new Graphics();
      graphics.beginFill('#0f0').drawRect(-200, 0, 400, 640);

      shape = new Shape(graphics);
      shape.x = 20;

      liquid = LiquidContainer.createLiquid("滴定管液体", self.store('color'), shape);

      pipe = new Bitmap(RES.getRes("滴定管"));

      self.addChild(liquid/*, shape*/, pipe);


      self.total = 100;
      //this.label = label;
      self.shape = shape;

      //this.store('volume', 5);
      self.storeChanged('volume');
    },
    /**
     * @override
     */
    refresh: function() {
      var self = this;
      if (self.scaleX < 0) {
        self.shape.rotation = -2 * self.rotation + 90;
      } else {
        self.shape.rotation = -self.rotation;
      }
    },
    /**
     * @override
     */
    storeChanged: function(key) {
      var value = this.store(key);
      switch (key) {
        case 'volume':
          this.shape.set({
            y: 450 - value * 450 / 80 + 50
            //y: 300 - (value + 50) * 300 / 100 + 60
          });
          //label.num = 50 - value;
          //label.y = shape.y - 10;
          break;
      }
    }
  });
})();
