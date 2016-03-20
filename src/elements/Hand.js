//##############################################################################
// src/elements/Hand.js
//##############################################################################
ENJ.Hand = (function() {
  var Sprite = CRE.Sprite;

  return ENJ.defineClass({
    /**
     *
     * @class Hand
     * @extends Sprite
     *
     * @constructor
     */
    constructor: function Hand() {
      var data = {
        images: [RES.getRes('手')],
        frames: { width: 100, height: 129 }
      };
      var sheet = new CRE.SpriteSheet(data);

      Sprite.call(this, sheet);
    }, extend: Sprite
  });
})();

