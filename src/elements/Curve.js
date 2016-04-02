//##############################################################################
// src/elements/Curve.js
//##############################################################################
ENJ.Curve = (function() {
  var Shape = CRE.Shape,
    Graphics = CRE.Graphics;
  return ENJ.defineClass({
    constructor: function(graphics) {
      Shape.call(this, graphics || new Graphics());
    },

    extend: Shape,

    update: function(p0, p6) {
      var p = [], dist;

      p[0] = p0;
      p[6] = p6;

      //angle = 90;// - Math.atan2((p[4].x-p[0].x), (p[4].y-p[0].y)) * 180 / Math.PI;
      dist = Math.sqrt(
          (p[6].x-p[0].x) * (p[6].x-p[0].x) + (p[6].y-p[0].y) * (p[6].y-p[0].y)
      );

      p[1] = new CRE.Point(2/12 * dist, -100);
      p[2] = new CRE.Point(4/12 * dist, 0);
      p[3] = new CRE.Point(6/12 * dist, 100);
      p[4] = new CRE.Point(8/12 * dist, 50);
      p[5] = new CRE.Point(10/12 * dist, 0);
      p[6].x = p[6].x - p[0].x;
      p[6].y = p[6].y - p[0].y;

      this.graphics
        .clear()
        .setStrokeStyle(4,1,1)
        .beginStroke('#000')
        .moveTo(0,0)
        .quadraticCurveTo(p[1].x,p[1].y,p[2].x,p[2].y)
        .quadraticCurveTo(p[3].x,p[3].y,p[4].x,p[4].y)
        .quadraticCurveTo(p[5].x,p[5].y,p[6].x,p[6].y)
        .endStroke();

      this.x = p[0].x + 9;
      this.y = p[0].y + 5;
    }
  });
})();