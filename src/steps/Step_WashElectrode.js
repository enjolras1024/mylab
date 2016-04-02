//##############################################################################
// src/steps/Step_WashElectrode.js
//##############################################################################
ENJ.Step_WashElectrode = (function() {
  var Step = ENJ.Step,
    Tween = CRE.Tween;

  var base = Step.prototype;
  
  return ENJ.defineClass({
    /**
     * 清洗电极
     * 所用：蒸馏水、烧杯、电极
     *
     * @constructor
     */
    constructor: function Step_WashElectrode() {
      Step.apply(this, arguments);
    }, extend: Step,

    start: function() {
      base.start.call(this);
      var scene = this.scene, electrode, beaker, bottle;

      this.flags = [];

      this.curve = scene.curve;
      bottle =this.bottle = scene.waterBottle;
      beaker = this.beaker = scene.bigBeaker;
      electrode = this.electrode = scene.phElectrode;

      bottle.cursor = 'pointer';
      electrode.cursor = 'pointer';

      Tween.get(beaker).to({ x: 420, y: 500 }, 250);
      Tween.get(electrode).to({ x: 520,y: 300, rotation: 30 }, 250);

      var handlers = this.handlers = [];

      handlers[0] = this.onClickElectrode.bind(this);
      handlers[1] = this.onClickBottle.bind(this);
      electrode.addEventListener('click', handlers[0]);
      bottle.addEventListener('click', handlers[1]);
    },

    stop: function() {
      var electrode = this.electrode, beaker = this.beaker, bottle = this.bottle;

      bottle.cursor = 'auto';
      electrode.cursor = 'auto';

      this.curve.update(electrode, new CRE.Point(800,480));
      //Tween.get(beaker).to({ x: beaker.location.x, y: beaker.location.y }, 250);
      //Tween.get(bottle).to({ x: bottle.location.x, y: bottle.location.y, rotation: 0 }, 250);
      //Tween.get(electrode).to({ x: electrode.location.x, y: electrode.location.y, rotation: 0 }, 500);

      electrode.removeEventListener('click', this.handlers[0]);
      bottle.removeEventListener('click', this.handlers[1]);

      base.stop.call(this);
    },

    onClickElectrode: function() {
      var electrode = this.electrode;
      if (this.flags[0]) { return; }
      this.flags[0] = true;
      electrode.start();
      Tween.get(electrode).to({ y: 350, rotation: 15 }, 250);
    },

    onClickBottle: function() {
      var electrode = this.electrode, beaker = this.beaker, bottle = this.bottle;
      if (this.flags[0] && !this.flags[1]) {
        this.flags[1] = true;
        var stop = this.stop.bind(this);

        bottle.scaleX = -1;
        Tween.get(bottle)
          .to({ x: 500, y: 450, rotation: 30 }, 250)
          .call(function() {
            bottle.dump(true, 0);
          })
          .to({ x: 480, y: 500 }, 800)
          .to({ x: 500, y: 450 }, 800)
          .to({ x: 480, y: 500 }, 800)
          //.to({ x: 400, y: 300 }, 500)
          .call(function() {
            Tween.get(beaker)
              .to({ x: beaker.location.x, y: beaker.location.y }, 300);
            bottle.scaleX = 1;
            bottle.dump(false, 0);
            Tween.get(bottle)
              .to({ x: bottle.location.x, y: bottle.location.y, rotation: 0 }, 500)
              .call(stop);
            /*Tween.get(electrode)
             .to({ x: electrode.location.x, y: electrode.location.y, rotation: 0 }, 500)
             .call(stop);*/
          });
      }
    },

    update: function(event) {

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




    }
  });
})();
