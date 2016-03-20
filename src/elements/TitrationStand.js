///##############################################################################
// src/elements/TitrationStand.js
//###############################################################################
ENJ.TitrationStand = (function() {
  var Element = ENJ.Element,
    Bitmap = CRE.Bitmap,
    Sprite = CRE.Sprite;

  var base = Element.prototype;

  return ENJ.defineClass({
    /**
     *
     * @class TitrationStand
     * @extends Element
     *
     * @constructor
     */
    constructor: function TitrationStand() {
      Element.apply(this, arguments);
    }, extend: Element,
    /**
     * @override
     */
    ready: function() {
      var stand, clip, data;

      stand = new Bitmap(RES.getRes("滴定架"));

      data = {
        images: [ RES.getRes("蝴蝶夹") ],
        frames: { width: 82, height: 111 }/*,
         animations: { open: 0, close: 1 }*/
      };

      clip = new Sprite(new CRE.SpriteSheet(data));
      clip.set({ x: 5, y: 20 });
      clip.gotoAndStop(0);

      this.addChild(clip, stand);


      this.clip = clip;
      this.regX = 131;
    },

    /**
     * @override
     */
    start: function() {
      base.start.call(this);
      this.clip.gotoAndStop(0);
    },

    /**
     * @override
     */
    stop: function() {
      this.clip.gotoAndStop(1);
      base.stop.call(this);
    }
  });
})();
