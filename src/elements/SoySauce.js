///##############################################################################
// src/elements/SoySauce.js
//###############################################################################
ENJ.SoySauce = (function() {
  var LiquidContainer = ENJ.LiquidContainer,
    Tween = CRE.Tween,
    Shape = CRE.Shape,
    Bitmap = CRE.Bitmap,
    Graphics = CRE.Graphics;

  return ENJ.defineClass({
    /**
     *
     * @class SoySauce
     * @extends LiquidContainer
     *
     * @constructor
     */
    constructor: function SoySauce(store) {
      LiquidContainer.call(this, store);
    }, extend: LiquidContainer,
    /**
     * @override
     */
    ready: function() {
      var self = this, graphics, shape, label, liquid, bottle, cap;

      graphics = new Graphics();
      graphics.beginFill('#0f0').drawRect(-200, 0, 400, 400);

      shape = new Shape(graphics);
      shape.x = 63;
      //shape.y = 50;

      //label = new ENJ.NumLabel({ unit: 'ml' });
      //label.x = 75;

      liquid = LiquidContainer.createLiquid("酱油", self.store('color'), shape);

      bottle = new Bitmap(RES.getRes("酱油瓶"));

      cap = new Bitmap(RES.getRes("酱油瓶盖"));
      cap.set({ x: 26, y: -15 });


      self.addChild(liquid, bottle, cap);
      //this.addChild(label);

      self.cap = cap;
      //self.label = label;
      self.shape = shape;

      //this.store('volume', 5);
      self.storeChanged('volume');
    },

    /**
     * @override
     */
    storeChanged: function(key) {
      var value = this.store(key);//, label = this.label, shape = this.shape;
      switch (key) {
        case 'volume':
          this.shape.y = 260 - value * 260 / 250;
          //label.store('num', value);
          //label.y = shape.y - 10;
          break;
      }
    },

    /**
     * @override
     */
    start: function() {
      LiquidContainer.prototype.start.call(this);
      Tween.get(this.cap).to({
        x: 0, y: -50, rotation: -30, alpha: 0
      }, 300);
    },

    /**
     * @override
     */
    stop: function() {
      LiquidContainer.prototype.stop.call(this);
      Tween.get(this.cap).to({
        x: 26, y: -15, rotation: 0, alpha: 1.0
      }, 300);
    }
  });
})();
