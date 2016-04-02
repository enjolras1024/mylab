//##############################################################################
// src/steps/Step_DumpPowder.js
//##############################################################################
ENJ.Step_DumpPowder = (function() {
  var Step = ENJ.Step,
    Tween = CRE.Tween;

  var base = Step.prototype;
  
  return ENJ.defineClass({
    /**
     * 将袋中粉末倒入烧杯中
     * 所用：袋子、粉末（动画）、烧杯
     *
     * @constructor
     */
    constructor: function Step_DumpPowder() {
      Step.apply(this, arguments);
    }, extend: Step,

    start: function() {
      base.start.call(this);

      var store = this.store, scene = this.scene,
        handlers = this.handlers = [], flags = this.flags = [],
        bag, beaker;//, pipet, bottle, suckBall;
      // @todo 精简
      bag = this.bag = scene.bags[store.bag];
      beaker = this.beaker = scene.beakers[store.beaker];
      this.powder = scene.powder;

      bag.cursor = 'pointer';
      //this.beaker.cursor = 'pointer';

      var g = new CRE.Graphics();
      g.beginFill('#0f0').drawEllipse(0, 0, 80, 40);

      this.rect = new CRE.Shape(g);


      Tween.get(beaker).to({
        x: 300, y: 500
      }, 500);

      Tween.get(bag).to({
        rotation: 30
      }, 500).call(function() {
        flags[0] = true;
      });

      handlers[0] = this.onClickBag.bind(this);
      bag.addEventListener('click', handlers[0]);
      bag.cursor = 'pointer';
    },

    stop: function() {
      var handlers = this.handlers;

      this.bag.removeEventListener('click', handlers[0]);
      this.bag.cursor = 'auto';
      base.stop.call(this);
    },

    onClickBag: function() {
      if (!this.flags[0] || this.flags[1]) { return; }
      //bag.start();
      this.flags[1] = true;

      var powder = this.powder, beaker = this.beaker, bag = this.bag, rect = this.rect, self = this;
      //powder.visible = true;
      powder.set({ alpha: 1.0, visible: true, x: beaker.x + 15, y: beaker.y + 75 });

      rect.x = powder.x - 10;
      rect.y = powder.y - 12;
      powder.mask = rect;

      powder.y += 20;

      //bag.rotation = 30;
      Tween.get(bag)
        .to({ rotation: 120 }, 250)
        .wait(1500)
        .to({ rotation: 30 }, 250)
        .call(function() {
          //bag.rotation = 30;
          /*Tween.get(bag).wait(1500).to({
           rotation: 30
           }, 250);*/
          self.stop();
        });

      Tween.get(powder).to({
        y: beaker.y + 75
      }, 2000);
    }
  });
})();
