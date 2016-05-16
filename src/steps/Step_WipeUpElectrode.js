//##############################################################################
// src/steps/Step_WipeUpElectrode.js
//##############################################################################
ENJ.Step_WipeUpElectrode = (function() {
  var Step = ENJ.Step,
    Tween = CRE.Tween;

  

  var base = Step.prototype;
  
  return ENJ.defineClass({
    /**
     * 擦干电极
     * 所用：纸巾、电极
     *
     * @constructor
     */
    constructor: function Step_WipeUpElectrode() {
      Step.apply(this, arguments);
    }, extend: Step,

    start: function() {
      base.start.call(this);
      var scene = this.scene, paper, electrode;

      paper = this.paper = scene.paper;
      electrode = this.electrode = scene.phElectrode;
      this.curve = scene.curve;

      Tween.get(electrode)
        .to({ rotation: 0 }, 500);

      this.flags = [];
      var handlers = this.handlers = [];
      handlers[0] = this.onClick.bind(this);

      paper.visible = true;
      paper.cursor = 'pointer';
      paper.addEventListener('click', handlers[0]);
    },

    stop: function() {
      var electrode = this.electrode, paper = this.paper;

      this.curve.update(electrode, new CRE.Point(800,480));

      paper.visible = false;
      paper.cursor = 'auto';
      paper.removeEventListener('click', this.handlers[0]);
      base.stop.call(this);
    },

    update: function() {
      var localMouse = this.scene.getLocalMouse();

      if (!this.flags[0]) {
        this.paper.set({ x: localMouse.x - 60, y: localMouse.y - 28 });
      }

      this.curve.update(this.electrode, new CRE.Point(800,480));

//      var p = [], dist;
//
//      p[0] = this.electrode;
//      p[6] = new CRE.Point(800,480);
//
//      //angle = 90;// - Math.atan2((p[4].x-p[0].x), (p[4].y-p[0].y)) * 180 / Math.PI;
//      dist = Math.sqrt(
//          (p[6].x-p[0].x) * (p[6].x-p[0].x) + (p[6].y-p[0].y) * (p[6].y-p[0].y)
//      );
//
//      p[1] = new CRE.Point(2/12 * dist, -100);
//      p[2] = new CRE.Point(4/12 * dist, 0);
//      p[3] = new CRE.Point(6/12 * dist, 100);
//      p[4] = new CRE.Point(8/12 * dist, 50);
//      p[5] = new CRE.Point(10/12 * dist, 0);
//      p[6].x = p[6].x - p[0].x;
//      p[6].y = p[6].y - p[0].y;
//
//      this.curve.graphics
//        .clear()
//        .setStrokeStyle(4,1,1)
//        .beginStroke('#000')
//        .moveTo(0,0)
//        .quadraticCurveTo(p[1].x,p[1].y,p[2].x,p[2].y)
//        .quadraticCurveTo(p[3].x,p[3].y,p[4].x,p[4].y)
//        .quadraticCurveTo(p[5].x,p[5].y,p[6].x,p[6].y)
//        .endStroke();
//
//      this.curve.set(
//        { x: p[0].x+9, y: p[0].y+5}
//      );
    },

    onClick: function() {
      if (this.flags[0]) { return; }

      var paper = this.paper, electrode = this.electrode, self = this;
      if (paper.x > electrode.x - 50 && paper.x < electrode.x + 50 &&
        paper.y > electrode.y + 60 && paper.y < electrode.y + 200) {
        this.flags[0] = true;

        //scene.setChildIndex(paper, scene.getChildIndex(electrode) + 1);
        paper.set({ x: electrode.x - 60, y: electrode.y + 100 });
        Tween.get(paper)
          .to({ y: electrode.y + 200 }, 500)
          .to({ y: electrode.y + 100 }, 500)
          /*.call(function() {
           scene.setChildIndex(paper, scene.getChildIndex(electrode) - 1);
           })*/
          .to({ y: electrode.y + 200 }, 500)
          .to({ y: electrode.y + 100 }, 500)
          .call(function(){
            Tween.get(electrode)
              .to({ x: electrode.location.x, y: electrode.location.y/*, rotation: 0*/ }, 500)
              .call(self.stop.bind(self));
          });

      }
    }
  });
})();
