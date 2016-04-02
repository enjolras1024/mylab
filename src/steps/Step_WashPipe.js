//##############################################################################
// src/steps/Step_WashPipe.js
//##############################################################################
ENJ.Step_WashPipe = (function() {
  var Step = ENJ.Step,
    Tween = CRE.Tween;

  var base = Step.prototype;
  
  return ENJ.defineClass({
    /**
     * 润洗移液管
     * 所用：移液管、手
     *
     * @constructor
     */
    constructor: function Step_WashPipe() {
      Step.apply(this, arguments);
    }, extend: Step,

    start: function() {
      base.start.call(this);
      var scene = this.scene, store = this.store,
      //handlers = this.handlers = [],
        pipe, hand;//, ball, beaker;

      pipe = this.pipe = scene[store.pipe];
      hand = this.hand = scene.hand;
      //ball = this.ball = scene.suckBall;
      //beaker = this.beaker = scene.bigBeaker;

      //scene.setChildIndex(ball, scene.getChildIndex(pipe) - 1);

      this.flags = [];

      //handlers[0] = this.onClickBall.bind(this);
      //ball.addEventListener('mousedown', handlers[0]);
      //ball.addEventListener('pressup', handlers[0]);

      /*Tween.get(hand)
       .to({x:0,y:0,rotation:90},500)
       .call(function(){hand.visible=false;});*/

      hand.visible=false;

      Tween.get(pipe)
        .to({x:400,y:500,regX:7,regY:150,rotation:90},500)
        .to({rotation:95},300)
        .to({rotation:85},300)
        .to({rotation:95},300)
        .to({rotation:85},300)
        .to({x:335,y:200,regX:0,regY:0,rotation:0},500)
        .call(this.stop.bind(this));

      /*Tween.get(beaker)
       .wait(2000)
       .to({x:300,y:500}, 500);*/


    },

    stop: function() {
      //var ball = this.ball, handlers = this.handlers;

      //this.scene.setChildIndex(ball, ball.index);
      //ball.removeEventListener('mousedown', handlers[0]);
      //ball.removeEventListener('pressup', handlers[0]);

      base.stop.call(this);
    },

    update: function(event) {
      //var pipe = this.pipe, beaker = this.beaker, volume, stop;
      this.pipe.refresh();
//        if (this.flags[0]) {
//            volume = pipe.store('volume');
//            if (volume <= 0) {
//                volume = 0;
//                //stop = this.stop.bind(this);
//                Tween.get(beaker)
//                    .wait(500)
//                    .to({ x: beaker.location.x, y: beaker.location.y }, 500)
//                    .call(this.stop.bind(this));
//
//            } else {
//                volume -= event.delta/200;
//            }
//            pipe.store('volume', volume);
//        }
    }
  });
//    onClickBall = function(event) {
//        var ball = this.ball;
//        if (!ball.active) { return; }
//        switch (event.type) {
//            case 'mousedown':
//                ball.scale();
//                this.flags[0] = true;
//                break;
//            case 'pressup':
//                ball.stop();
//                ball.suck();
//                Tween.get(ball)
//                    .to({x:ball.location.x, y:ball.location.y, rotation:0},500);
//                /*if (ball.active) {
//                    ball.suck();
//                    flags[1] = true;
//                } else if (pipe.active) {
//                    ball.start();
//                    Tween.get(ball).to({
//                        x: pipe.x + 8, y: pipe.y, rotation: 180
//                    }, 500, Ease.sineInOut);
//                }*/
//
//                break;
//        }
//    };

  //return Step_WashPipe;
})();
