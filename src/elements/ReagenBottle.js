//##############################################################################
// src/elements/ReagenBottle.js
//##############################################################################
ENJ.ReagenBottle = (function() {
  var LiquidContainer = ENJ.LiquidContainer,
    Tween = CRE.Tween,
    Shape = CRE.Shape,
    Bitmap = CRE.Bitmap,
    Graphics = CRE.Graphics;

  var base = LiquidContainer.prototype;

  return ENJ.defineClass({
    /**
     *
     * @class ReagenBottle
     * @extends LiquidContainer
     *
     * @constructor
     * @param {Object} store
     */
    constructor: function ReagenBottle(store) {
      LiquidContainer.apply(this, arguments);
    }, extend: LiquidContainer,
    /**
     * @override
     */
    ready: function() {
      var self = this, label, shape, liquid, bottle, icon, cap, graphics;

      //label = new ENJ.NumLabel({ unit: 'ml' });
      //label.x = 90;

      graphics = new Graphics();
      graphics.beginFill('#0f0').drawRect(-100, 0, 300, 300);

      shape = new Shape(graphics);
      shape.x = 50;
      //shape.y = 50;

      liquid = LiquidContainer.createLiquid("试剂瓶液体", self.store('color'), shape);

      bottle = new Bitmap(RES.getRes("试剂瓶"));

      icon = new Bitmap(RES.getRes(self.store('icon')));
      icon.set({ x: 10, y: 80 });

      cap = new Bitmap(RES.getRes(self.store('cap')));
      cap.set({ x: 13, y: -8 });

      var container = new CRE.Container();
      var bounds = bottle.getBounds();
      container.addChild(bottle, icon);
      container.cache(0, 0, bounds.width, bounds.height);

      //
      self.addChild(liquid, cap, container/*, label*/);
      //this.addChild(icon);


      //self.label = label;
      self.shape = shape;
      self.cap = cap;
      //this.liquid = liquid;

      //this.shape =
      //this.store('volume', 50);
      self.storeChanged('volume');

      self.setBounds(0,0,90,169)
    },

    /**
     * @override
     */
    storeChanged: function(key) {
      var value = this.store(key), label = this.label, shape = this.shape;
      switch (key) {
        case 'volume':
          shape.y = 120 - value * 120 / 500 + 49;

          //label.store('num', value);
          //label.y = shape.y - 10;
          break;
      }

    },

    start: function() {
      base.start.call(this);
      Tween.get(this.cap).to({
        x: 0, y: -60, rotation: -30, alpha: 0
      }, 250);
    },

    stop: function() {
      base.stop.call(this);
      Tween.get(this.cap).to({
        x: 13, y: -8, rotation: 0, alpha: 1.0
      }, 250);
    }
  });
})();

