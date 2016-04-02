//##############################################################################
// src/elements/WaterBottle.js
//##############################################################################
ENJ.WaterBottle = (function() {
  return ENJ.defineClass({
    constructor: function WaterBottle() {
      ENJ.Element.apply(this, arguments);
    }, extend: ENJ.Element,

    ready: function() {
      var bottle, flow;

      bottle = new CRE.Bitmap(RES.getRes("蒸馏水瓶"));

      var data = {
        images: [RES.getRes("水流")],
        frames: { width: 200, height: 200 }
      };
      var sheet = new CRE.SpriteSheet(data);

      this.flow = flow = new CRE.Sprite(sheet);
      flow.set({y: 25, scaleX: -0.5, scaleY: 0.5, visible: false});
      flow.framerate = 30;
      //flow.gotoAndPlay(0);

      this.addChild(bottle, flow);
    },

    dump: function(flag, rotation) {
      var flow = this.flow;
      if (flag) {
        flow.visible = true;
        flow.rotation = rotation;
        flow.gotoAndPlay(0);
      } else {
        flow.visible = false;
        flow.rotation = 0;
        flow.gotoAndStop(0);
      }
    }
  })
})();
