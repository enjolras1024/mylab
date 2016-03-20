//##############################################################################
// src/elements/ReagenBottle.js
//##############################################################################
ENJ.ReagenBottle = (function() {
  var LiquidContainer = ENJ.LiquidContainer,
    Shape = CRE.Shape,
    Bitmap = CRE.Bitmap,
    Graphics = CRE.Graphics;

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
      var self = this, label, shape, liquid, bottle, icon, graphics;

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

      var container = new CRE.Container();
      var bounds = bottle.getBounds();
      container.addChild(bottle, icon);
      container.cache(0, 0, bounds.width, bounds.height);

      //
      self.addChild(liquid, container/*, label*/);
      //this.addChild(icon);


      //self.label = label;
      self.shape = shape;
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

    }
  });
})();

