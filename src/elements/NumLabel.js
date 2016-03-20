//##############################################################################
// src/elements/NumNumLabel.js
//##############################################################################
ENJ.NumLabel = (function() {
  var Element = ENJ.Element,
    Bitmap = CRE.Bitmap,
    Text = CRE.Text;

  return ENJ.defineClass({
      /**
       * Label showing number.
       *
       * @class NumLabel
       * @extends Element
       *
       * @constructor
       */
      constructor: function NumLabel(store) {
        Element.call(this, store);
      }, extend: Element,
      /**
       * @override
       */
      register: function() {
        Element.prototype.register.call(this);
        this.field = null;
      },

      /**
       * @override
       */
      ready: function() {
        var field, label;

        label = new Bitmap(RES.getRes('标签'));

        field = new Text();
        field.set({
          color: '#fff',
          font: '12px Arial',
          x: 15, y: 5
        });
        //field.color = '#fff';
        //field.font = '12px Arial';

        this.addChild(label, field);

        this.field = field;
      },

      /**
       * @override
       */
      storeChanged: function(key) {
        var self = this, value = self.store(key), a, b;
        switch (key) {
          case 'num':
            a = Math.floor(value);
            b = Math.floor((value - a) * 10);
            self.field.text = '' + a + '.' + b + self.store('unit');
            break;
        }
      }
    }
  );
})();
