//##############################################################################
// src/steps/Step_SuckLiquid.js
//##############################################################################
ENJ.Step_SuckLiquid = (function() {
  var Step = ENJ.Step,
    Ease = CRE.Ease,
    Tween = CRE.Tween;

  var base = Step.prototype;
  
  return ENJ.defineClass({
    /**
     * 吸取液体
     * 所用：移液管、吸球、试剂瓶
     *
     * @constructor
     */
    constructor: function Step_SuckLiquid() {
      Step.apply(this, arguments);
    }, extend: Step,

    start: function() {
      base.start.call(this);
      var store = this.store, scene = this.scene,
        handlers = this.handlers = [], self = this,
        hand, pipet, bottle, suckBall;//, pipet, bottle, suckBall;
      // @todo 精简
      hand = this.hand = scene.hand;
      pipet = this.pipet = store.pipet ?  scene[store.pipet] : scene.pipet;
      bottle = this.bottle = scene[store.bottle];
      suckBall = this.suckBall = scene.suckBall;

      pipet.cursor = 'pointer';
      suckBall.cursor = 'pointer';

      handlers[0] = this.onClickPipet.bind(this);
      handlers[1] = this.onClickHand.bind(this);
      handlers[2] = this.onClickSuckBall.bind(this);

      this.flags = [];

      [/*suckBall, */pipet, bottle]
        .forEach(function(element) {
          scene.setToTop(element, 7);
          element.cursor = 'pointer';
        });
//      scene.setChildIndex(pipet, scene.getChildIndex(bottle)-1);

      bottle.start();
      Tween.get(bottle).to({
        //rotation: 30,
        x: 300,
        y: 400
      }, 500, Ease.sineInOut).call(function(){
        if (pipet.active) {
          self.insertPipet();
        }
      });

      hand.visible = false;

      pipet.addEventListener('click', handlers[0]);
      hand.addEventListener('mousedown', handlers[1]);
      hand.addEventListener('pressup', handlers[1]);
      suckBall.addEventListener('mousedown', handlers[2]);
      suckBall.addEventListener('pressup', handlers[2]);
    },

    stop: function() {
      var /*i, n, element, */elements = [], handlers = this.handlers, scene = this.scene,
        hand = this.hand, pipet = this.pipet, bottle = this.bottle, suckBall = this.suckBall;

      pipet.cursor = 'auto';
      suckBall.cursor = 'auto';

      if (!this.store.remain) {
        elements.push(pipet);
        elements.push(bottle);
        bottle.stop();
      }


      elements.sort(function(a, b) {
        return a.index - b.index;
      });


      elements.forEach(function(element) {
        element.cursor = 'auto';
        scene.setChildIndex(element, element.index);
      });

      pipet.removeEventListener('click', handlers[0]);
      hand.removeEventListener('click', handlers[1]);
      suckBall.removeEventListener('mousedown', handlers[2]);
      suckBall.removeEventListener('pressup', handlers[2]);

      base.stop.call(this);
    },

    update: function(event) {
      //console.log(event);
      //var body = event.params[0];
      var volume, delta, stage = this.scene.stage, store = this.store,
        hand = this.hand, pipet = this.pipet, bottle = this.bottle;

      bottle.refresh();
      if (!this.flags[2]){
        hand.set({x: stage.mouseX -50, y: stage.mouseY - 50 });
      }
      if (this.flags[0] && !this.flags[1]) {
        volume = pipet.store('volume');
        delta = event.delta / 200;
        if (volume >= store.volume) {
          volume = store.volume;
          //this.stop();
          this.flags[1] = true;
          hand.visible = true;
          hand.gotoAndPlay('up');
          /*Tween.get(bottle)
           .to({rotation:0})
           .call(function() {

           });*/
        } else {
          volume += delta;
        }

        pipet.store('volume', volume);
        bottle.store('volume', bottle.store('volume') - delta);
      }

    },

    onClickPipet: function() {
      var pipet = this.pipet, bottle = this.bottle;//, rect = bottle.getBounds();
      if (pipet.active) {
        pipet.stop();
        Tween.get(pipet).to({
          x: pipet.location.x,
          y: pipet.location.y,
          rotation: -90
        }, 500, Ease.sineInOut);
      } else {
        this.insertPipet();
//            Tween.get(pipet)
//                .to({
//                    x: bottle.x + rect.width * 0.5 - 5,
//                    y: bottle.y - 300,
//                    rotation: 0
//                }, 500, Ease.sineInOut)
//                .to({
//                    y: bottle.y - 150
//                }, 500, Ease.sineInOut)
//                .call(function() {
//                    pipet.start();
//                });
      }
    },

    insertPipet: function() {
      var self = this, pipet = this.pipet, bottle = this.bottle,
        rect = bottle.getBounds();
      Tween.get(pipet)
        .to({
          x: bottle.x + rect.width * 0.5 - 5,
          y: bottle.y - 300,
          rotation: 0
        }, 500, Ease.sineInOut)
        .to({
          y: bottle.y - 150
        }, 500, Ease.sineInOut)
        .call(function() {
          self.flags[3] = true;
          pipet.start();
        });
    },

    onClickHand: function(event) {
      var hand = this.hand, ball = this.suckBall,
        bottle = this.bottle, pipet = this.pipet;

      if (!hand.visible || this.flags[2]) { return; }

      switch (event.type) {
        case 'mousedown':
          hand.gotoAndStop('down');
          if (hand.x > pipet.x - 40 && hand.x < pipet.x + 20 &&
            hand.y > pipet.y - 40 && hand.y < pipet.y + 20) {
            this.flags[2] = true;
            hand.set({x: pipet.x - 10, y: pipet.y - 20});
            //this.stop();
            if (!this.store.remain) {
              Tween.get(bottle).wait(500).to({
                //rotation: 0,
                x: bottle.location.x,
                y: bottle.location.y
              }, 500, Ease.sineInOut).call(function() {
                bottle.stop();
              });
            }

            ball.stop();
            this.scene.setChildIndex(ball, ball.index);
            Tween.get(ball).to({
              x: ball.location.x, y: ball.location.y, rotation: 0
            }, 500, Ease.sineInOut)
              .wait(500)
              .call(this.stop.bind(this));

            Tween.get(hand).to({y:bottle.y-320},500);

            Tween.get(pipet).to({y:bottle.y-300},500);
          }
          break;
        case 'pressup':
          hand.gotoAndStop('up');
          break;
      }
    },

    onClickSuckBall: function(event) {
      var suckBall = this.suckBall, pipet = this.pipet;
      if(!this.flags[3]){ return; }
      switch (event.type) {
        case 'mousedown':
          if (suckBall.active) {
            suckBall.scale();
          }
          break;
        case 'pressup':
          if (suckBall.active) {
            suckBall.suck();

            if (this.bottle.active && pipet.active) {
              this.flags[0] =true;
            }
          } else if (pipet.active) {
            suckBall.start();
            var scene = this.scene;
            scene.setChildIndex(suckBall, scene.getChildIndex(this.pipet)-1);
            Tween.get(suckBall).to({
              x: pipet.x + 8, y: pipet.y, rotation: 180
            }, 500, Ease.sineInOut);
          }

          break;
      }
    }
  });
})();
