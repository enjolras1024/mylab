//##############################################################################
// src/steps/Step_CutBag.js
//##############################################################################
ENJ.Step_CutBag = (function() {
  var Step = ENJ.Step,
    Tween = CRE.Tween;

  var base = Step.prototype;
  
  return ENJ.defineClass({
    /**
     * 剪开袋子
     * 所用：剪刀、袋子
     *
     * @constructor
     */
    constructor: function Step_CutBag() {
      Step.apply(this, arguments);
    }, extend: Step,

    start: function() {
      base.start.call(this);

      var store = this.store, scene = this.scene, bag, scissors,
        handlers = this.handlers = [];//, pipet, bottle, suckBall;
      // @todo 精简
      bag = this.bag = scene.bags[store['bag']];
      scissors = this.scissors = scene.scissors;

      bag.cursor = 'pointer';
      scissors.cursor = 'pointer';
      scissors.visible = false;
      /*scene.setToTop(this.suckBall);
       scene.setToTop(this.pipet);
       scene.setToTop(this.bottle);

       this.suckBall.cursor = 'pointer';
       this.pipet.cursor = 'pointer';
       this.bottle.cursor = 'pointer';*/

      this.flags = [];

      handlers[0] = this.onClickBag.bind(this);
      handlers[1] = this.onMouseScissors.bind(this);

      scene.setChildIndex(bag, scene.getChildIndex(scissors) - 1);

      //this.bag.addEventListener('click', handlers[0]);
      Tween.get(bag).wait(1000).to({
        x: 320, y: 450, scaleY: 1.0, skewX: 0, rotation: -45
      }, 500).call(function() {
        scissors.visible = true;
        scissors.gotoAndStop('open');
        scissors.addEventListener('mousedown', handlers[1]);
        scissors.addEventListener('pressup', handlers[1]);
        //stage.addEventListener('stagemousemove', handlers[2]);
      });
    },

    stop: function() {
      base.stop.call(this);

      var handlers = this.handlers, bag = this.bag, scissors = this.scissors;

      bag.cursor = 'auto';
      scissors.cursor = 'auto';

      //this.scene.setChildIndex(bag, bag.index);
      //handlers[0] = this.onClickBag.bind(this);

      //this.bag.removeEventListener('click', handlers[0]);
      scissors.removeEventListener('pressup', handlers[1]);
      scissors.removeEventListener('mousedown', handlers[1]);
      //this.scene.stage.removeEventListener('stagemousemove', handlers[2]);
      handlers.splice(0);

    },

    onClickBag: function() {
      var bag = this.bag, scissors = this.scissors, handlers = this.handlers;// stage = this.scene.stage;
      if (this.flags[0]) { return; }
      //bag.start();
      this.flags[0] = true;
      Tween.get(bag).to({
        x: 320, y: 450, scaleY: 1.0, skewX: 0, rotation: -45
      }, 500).call(function() {
        scissors.visible = true;
        scissors.gotoAndStop('open');
        scissors.addEventListener('mousedown', handlers[1]);
        scissors.addEventListener('pressup', handlers[1]);
        //stage.addEventListener('stagemousemove', handlers[2]);
      });
    },

    onMouseScissors: function(event) {
      var bag = this.bag, scissors = this.scissors;
      switch (event.type) {
        case 'mousedown':
          this.flags[1] = true;
          scissors.gotoAndStop('close');
          break;
        case 'pressup':
          scissors.gotoAndStop('open');
          if (this.flags[1]
            && scissors.x > bag.x + 20 && scissors.x < bag.x + 80
            && scissors.y > bag.y - 50 && scissors.y < bag.y) {
            scissors.visible = false;
            bag.gotoAndStop('open');
            this.stop();
          }
          this.flags[1] = false;
          break;
      }
    },

    /*onStageMouseMove = function(event) {
     this.scissors.set({ x: event.stageX, y: event.stageY });
     };*/

    update: function() {
      this.scissors.set(this.scene.getLocalMouse());
    }
  });
})();
