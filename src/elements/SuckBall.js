//##############################################################################
// src/elements/SuckBall.js
//##############################################################################
ENJ.SuckBall = (function() {
  var Element = ENJ.Element,
    Bitmap = CRE.Bitmap,
    Tween = CRE.Tween;

  return ENJ.defineClass({
    /**
     *
     * @class SuckBall
     * @extends Element
     *
     * @constructor
     */
    constructor: function SuckBall() {
      Element.apply(this, arguments);
    }, extend: Element,
    /**
     * @override
     */
    ready: function() {
      var ball, mouth;

      ball = new Bitmap(RES.getRes("吸球"));
      ball.x = -22;

      mouth =  new Bitmap(RES.getRes("吸嘴"));
      mouth.x = -6;
      mouth.y = -48;

      this.addChild(mouth, ball);

      this.ball = ball;
      //this.mouth = mouth;
    },

    /**
     * @method scale
     */
    scale: function() {
      this.ball.scaleY = 0.5;
    },

    /**
     * @method suck
     */
    suck: function() {
      Tween.get(this.ball).to({ 'scaleY': 1.0 }, 500);
    }
  });
})();
