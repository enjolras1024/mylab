//##############################################################################
// src/steps/Step_DropFromBuret.js
//##############################################################################
ENJ.Step_DropFromBuret = (function() {
  var Step = ENJ.Step,
    Tween = CRE.Tween;

  function Step_DropFromBuret() {
    Step.apply(this, arguments);
  }

  var base = Step.prototype,
    pt = Step_DropFromBuret.prototype = Object.create(base);

  pt.constructor = Step_DropFromBuret;

  pt.start = function() {
    base.start.call(this);
    var self = this, scene = self.scene;

    self.stand = scene.titrationStand;
    var buret = self.buret = scene.buret;
    var hand = self.hand = scene.hand;
    //var stand = self.stand = scene.titrationStand;
    var drop = self.drop = scene.drop;
    var phInstrument = self.phInstrument = scene.phInstrument;

    drop.set({x: buret.x + 40, y: buret.y + 500});
    scene.setChildIndex(drop, scene.getChildIndex(scene.beaker)-1);
    self.tween = Tween.get(drop, { loop: true, paused: true }).to({y: drop.y + 80}, 500);
    //self.tween.pause();

    self.flags = [];
    var handlers = self.handlers = [];
    handlers[0] = self.onClick.bind(self);
    hand.addEventListener('mousedown', handlers[0]);
    hand.addEventListener('pressup', handlers[0]);

    hand.set({
      visible: true,
      scaleX: -1,
      x: buret.x + 30,
      y: buret.y + 400
    });

    //handlers[0] = this.onCorrect.bind(this);
    //phInstrument.addEventListener('read', handlers[0]);
    phInstrument.start();
    //phInstrument.willRead();

    this.originVolume = buret.store('volume');
  };

  pt.stop = function() {
    var hand = this.hand, handlers = this.handlers;
    hand.removeEventListener('mousedown', handlers[0]);
    hand.removeEventListener('pressup', handlers[0]);
    //this.phInstrument.stop();
    this.drop.visible = false;
    this.tween.setPaused(true);

    base.stop.call(this);
  };

  pt.update = function(event) {
    var self = this, buret = self.buret, stand = self.stand,
      target = self.store.volume, pHs = self.store.pHs, volume, delta;
    buret.refresh();
    if (self.drop.visible && !self.flags[1]) {
      delta = event.delta / 1000;
      volume = buret.store('volume');

      var num =  (this.originVolume - volume) / (this.originVolume - target);// * 100;

//      self.phInstrument.store('number', '' + num.toFixed(2) + '%');
      self.phInstrument.store('number', (pHs[0] + num * (pHs[1] - pHs[0])).toFixed(1));

      if (volume <= target){
        volume = target;
        self.flags[1] = true;
        self.drop.visible = false;
        self.hand.set({
          visible: false,
          scaleX: 1
        });

        if (!self.store.remain) {
          Tween.get(buret)
            .to({
              x: buret.location.x,
              y: buret.location.y,
              rotation: 0
            }, 500)
            .call(function() {
              self.phInstrument.stop();
              self.stop();
            });
          Tween.get(stand)
            .to({
              x: stand.location.x,
              y: stand.location.y,
            }, 500)
        } else {
          self.phInstrument.store('number', pHs[1].toFixed(1));
          self.stop();
        }

      } else {
        volume -= delta;
      }
      buret.store('volume', volume);
      //beaker.store('volume', beaker.store('volume') + delta);
    }

    /*if (self.flags[0]) {
      if (!self.drop.visible) {
        self.drop.visible = true;
        self.tween.setPaused(false);
        self.tween.setPosition(0);
      }
    } else {
      if (self.tween.position<200) {
        self.drop.visible = false;
        self.tween.setPaused(true);
      }
    }*/
  };

  pt.onClick = function(event) {
    var self = this, hand = self.hand;
    switch (event.type) {
      case 'mousedown':
        hand.gotoAndStop('down');
        //self.flags[0] = true;
        self.drop.visible = true;
        self.tween.setPaused(false);
        break;
      case 'pressup':
        hand.gotoAndStop('up');
        //self.flags[0] = false;
        self.drop.visible = false;
        self.tween.setPaused(true);
        break;
    }
  };

  return Step_DropFromBuret;
})();
