//##############################################################################
// src/elements/PHInstrument.js
//##############################################################################
ENJ.PHInstrument = (function() {
  var Element = ENJ.Element,
    Tween = CRE.Tween,
    Text = CRE.Text,
    Bitmap = CRE.Bitmap,
    Shape = CRE.Shape;

  return ENJ.defineClass({
    /**
     *
     * @class PHElectrode
     * @extends Element
     *
     * @constructor
     */
    constructor: function PHInstrument() {
      Element.apply(this, arguments);
    }, extend: Element,
    /**
     * @override
     */
    ready: function() {
      var instrument, plane, label, btn1, btn2;

      instrument = new Bitmap(RES.getRes ("PH仪"));

      plane = new Bitmap(RES.getRes ("PH仪面板"));
      plane.set({
        x: 160, y: 160, visible: false,
        regX: 80, regY: 80
      });

      label = new Text();
      //label.setBounds(0,0,100,30);
      label.set({
        x: 100, y: 50, visible: false, color: "#fff", font: "bold 24px Arial"
      });



      btn1 = new Shape();
      btn1.graphics
        .beginFill('#000')
        .drawCircle(0,0,20);
      btn1.set({
        x: 210, y: 115, alpha: 0.01
      });

      btn2 = new Shape();
      btn2.graphics
        .beginFill('#000')
        .drawCircle(0,0,23);
      btn2.set({
        x: 163, y: 135, alpha: 0.01
      });


      this.addChild(instrument, plane, label, btn1, btn2);

      this.plane = plane;
      this.label = label;
      this.btn1 = btn1;
      this.btn2 = btn2;


      btn1.cursor = 'pointer';
      btn2.cursor = 'pointer';
      //this.addEventListener('click',this.start.bind(this));

      //this.store('number',100000000);

    },

    /**
     * @override
     */
    start: function() {
      Element.prototype.start.call(this);
      var self = this, plane = this.plane;

      plane.set({
        visible: true,
        scaleX: 0.6,
        scaleY: 0.1,
        alpha: 0.5
      });

      Tween.get(plane).to({
        scaleX: 1.0, scaleY: 1.0, x: 160, y: 80, alpha: 1.0
      }, 500).call(function() {
        self.label.visible = true;
      });
      //this.willCorrect();
    },

    /**
     * @override
     */
    stop: function() {
      var self = this;
      self.label.visible = false;
      Tween.get(self.plane).to({
        alpha: 0.0
      }, 500).call(function() {
        self.plane.visible= true;
      });
      Element.prototype.stop.call(self);
    },

    willCorrect: function() {
      if (!this.active) {return;}
      this.btn1.addEventListener('click', this.onCorrect.bind(this));
    },

    willRead: function() {
      if (!this.active) {return;}
      this.btn2.addEventListener('click', this.onRead.bind(this));

    },

    onCorrect: function () {
      this.btn1.removeAllEventListeners();
      this.dispatchEvent('correct');
//      console.log('correct')
    },

    onRead: function() {
      this.btn2.removeAllEventListeners();
      this.dispatchEvent('read');
    },

    /**
     * @override
     * @param key
     */
    storeChanged: function(key) {
      switch (key) {
        case 'number':
            this.label.text = ''+ this.store(key);
          break;
      }
    }
  });
})();