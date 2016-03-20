///##############################################################################
// src/elements/VolumetricFlask.js
//##############################################################################
ENJ.VolumetricFlask = (function() {
  var LiquidContainer = ENJ.LiquidContainer,
    Tween = CRE.Tween,
    Shape = CRE.Shape,
    Bitmap = CRE.Bitmap,
    Graphics = CRE.Graphics;
  
  var base = LiquidContainer.prototype;

  return ENJ.defineClass({
    /**
     *
     * @class VolumetricFlask
     * @extends LiquidContainer
     *
     * @constructor
     */
    constructor: function VolumetricFlask(store) {
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

      label = new ENJ.NumLabel({ unit: 'ml' });
      label.visible = false;
      label.x = 75;

      liquid = LiquidContainer.createLiquid("容量瓶液体", self.store('color'), shape);

      bottle = new Bitmap(RES.getRes("容量瓶"));

      cap = new Bitmap(RES.getRes("容量瓶盖"));
      cap.set({ x: 45, y: -40 });

      self.addChild(liquid, bottle, cap, label);

      self.set({
        cap: cap,
        label: label,
        shape: shape
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
          if (value < 80) {
            shape.y = 256 - value * value / 6400 * 100;
          } else {
            shape.y = 156 - (value - 80) * 60 / 20;
          }
          //shape.y = 260 - value * 260 / 250;

          label.store('num', value);
          label.y = shape.y - 10;
          break;
      }
    },

    /**
     * @override
     */
    start: function() {
      base.start.call(this);
      Tween.get(this.cap).to({
        x: 0, y: -60, rotation: -30, alpha: 0
      }, 250);
    },

    /**
     * @override
     */
    stop: function() {
      base.stop.call(this);
      Tween.get(this.cap).to({
        x: 45, y: -40, rotation: 0, alpha: 1.0
      }, 250);
    },

    /**
     * @override
     */
    refresh: function() {
      var volume = this.store('volume'), shape = this.shape;

      shape.rotation = -this.rotation;
      if (this.rotation > 90) {
        shape.y = 180;
      } else {
        this.storeChanged('volume');
        //shape.y = 156 - (volume - 80) * 60 / 20;
      }
    }
  });
})();
