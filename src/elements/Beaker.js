//##############################################################################
// src/elements/Beaker.js
//##############################################################################
ENJ.Beaker = (function() {
  var LiquidContainer = ENJ.LiquidContainer,
    Shape = CRE.Shape,
    Bitmap = CRE.Bitmap,
    Graphics = CRE.Graphics;

  return ENJ.defineClass({
    /**
     *
     * @class Beaker
     * @extends LiquidContainer
     *
     * @constructor
     */
    constructor: function Beaker(store) {
      LiquidContainer.call(this, store);
    }, extend: LiquidContainer,
    /**
     * @override
     */
    ready: function() {
      var self = this, graphics, shape, label, level, liquid, bottle;

      graphics = new Graphics();
      graphics.beginFill('#0f0')
        .drawRect(-200, 0, 400, 200)
        .drawEllipse(-38, -7.5, 76, 15);

      shape = new Shape(graphics);
      shape.x = 50;

      graphics = new Graphics();
      graphics.beginFill('#fff').drawCircle(0,0,38);

      level = new Shape(graphics);
      level.set({
        x: shape.x - 4,
        scaleY: 0.2,
        alpha: 0.2
      });

      label = new ENJ.NumLabel({ unit: 'ml' });
      label.x = 10;

      liquid = LiquidContainer.createLiquid("烧杯液体", self.store('color'), shape);

      bottle = new Bitmap(RES.getRes("烧杯"));

      self.addChild(liquid, level, bottle);

      self.set({
        label: label,
        level: level,
        shape: shape
      });
      //this.store('volume', 5);
      self.storeChanged('volume');
    },
    /**
     * @override
     */
    refresh: function() {
      var self = this, ratio = Math.sin(self.rotation / 180 * Math.PI);

      self.shape.rotation = -self.rotation;
      self.shape.x = 50 + 36 * ratio;
    },
    /**
     * @override
     */
    storeChanged: function(key) {
      var self = this, value = self.store(key),
        label = self.label, shape = self.shape;
      switch (key) {
        case 'volume':
          if (value <= 0) {
            self.level.visible = false;
            self.level.y = shape.y = 500;
          } else {
            if(!this.fixing){
              self.level.visible = true;
            }
            self.level.y = shape.y = 100 - value * 100 /100 - 0;
          }

          label.store('num', value);
          label.y = shape.y - 10;
          break;
      }
    },
    /**
     * Have to fix.
     *
     * @method fix
     */
    fix: function() {
      var self = this;
      self.fixing = true;
      self.level.visible = false;
      self.shape.scaleX = 2;
      //this.shape.x = 100;
      self.regX = 100;
    },
    /**
     *
     * @method unfix
     */
    unfix: function() {
      var self = this;
      self.fixing = false;
      self.level.visible = true;
      self.shape.scaleX = 1;
      //this.shape.x = 50;
      self.regX = 0;
    }
  });
})();
