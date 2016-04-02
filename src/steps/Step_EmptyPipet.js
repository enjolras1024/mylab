//##############################################################################
// src/steps/Step_EmptyPipet.js
//##############################################################################
ENJ.Step_EmptyPipet = (function() {
  var Step = ENJ.Step,
    Tween = CRE.Tween;

  var base = Step.prototype;
  
  return ENJ.defineClass({
    /**
     * 排空移液管
     * 所用：移液管、吸球、大烧杯
     *
     * @constructor
     */
    constructor: function Step_EmptyPipet() {
      Step.apply(this, arguments);
    }, extend: Step,

    start: function() {
      base.start.call(this);
      var scene = this.scene, store = this.store,
        handlers = this.handlers = [],
        pipet, hand, ball, beaker;

//      pipet = this.pipet = scene.pipet;
      pipet = this.pipet = store.pipet ?  scene[store.pipet] : scene.pipet;
      //hand = this.hand = scene.hand;
      ball = this.ball = scene.suckBall;
      beaker = this.beaker = scene.bigBeaker;

      scene.setChildIndex(ball, scene.getChildIndex(pipet) - 1);

      this.flags = [];

      handlers[0] = this.onClickBall.bind(this);
      ball.addEventListener('mousedown', handlers[0]);
      ball.addEventListener('pressup', handlers[0]);
      ball.cursor = 'pointer';
      /*Tween.get(hand)
       .to({x:0,y:0,rotation:90},500)
       .call(function(){hand.visible=false;});*/

      //hand.visible = false;

      /*Tween.get(pipet)
       .to({x:400,y:400,regX:7,regY:150,rotation:90},500)
       .to({rotation:95},300)
       .to({rotation:85},300)
       .to({rotation:95},300)
       .to({rotation:85},300)
       .to({x:335,y:200,regX:0,regY:0,rotation:0},500)
       .call(function() {
       ball.start();
       Tween.get(ball)
       .wait(200)
       .to({x:pipet.x+7,y:pipet.y,rotation:180},500);
       });*/


      Tween.get(ball)
        .wait(200)
        .to({x:pipet.x+7,y:pipet.y,rotation:180},500)
        .call(function() {
          ball.start();
        });

      Tween.get(beaker)
        .to({x:300,y:500}, 500);


    },

    stop: function() {
      var ball = this.ball, handlers = this.handlers;

      this.scene.setChildIndex(ball, ball.index);
      ball.removeEventListener('mousedown', handlers[0]);
      ball.removeEventListener('pressup', handlers[0]);
      ball.cursor = 'auto';

      base.stop.call(this);
    },

    update: function(event) {
      var pipet = this.pipet, beaker = this.beaker, volume, stop;
      pipet.refresh();
      if (this.flags[0] && !this.flags[1]) {
        volume = pipet.store('volume');
        if (volume <= 0) {
          volume = 0;
          this.flags[1] = true;
          //stop = this.stop.bind(this);
          if (this.store.remain) {
            //Tween.get(hand).wait(500).to({y:bottle.y-320},500);
            Tween.get(pipet).wait(500)
              .to({y:beaker.y-400},500);
          } else {
            Tween.get(pipet)
              .to({
                x: pipet.location.x,
                y: pipet.location.y,
                rotation: -90
              },500);
          }

          Tween.get(beaker)
            .wait(500)
            .to({ x: beaker.location.x, y: beaker.location.y }, 500)
            .call(this.stop.bind(this));

        } else {
          volume -= event.delta/200;
        }
        pipet.store('volume', volume);
      }
    },

    onClickBall: function(event) {
      var ball = this.ball;
      if (!ball.active) { return; }
      switch (event.type) {
        case 'mousedown':
          ball.scale();
          this.flags[0] = true;
          break;
        case 'pressup':
          ball.stop();
          ball.suck();
          Tween.get(ball)
            .to({x:ball.location.x, y:ball.location.y, rotation:0},500);
          /*if (ball.active) {
           ball.suck();
           flags[1] = true;
           } else if (pipet.active) {
           ball.start();
           Tween.get(ball).to({
           x: pipet.x + 8, y: pipet.y, rotation: 180
           }, 500, Ease.sineInOut);
           }*/

          break;
      }
    }
  });
})();
