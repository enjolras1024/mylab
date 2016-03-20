//##############################################################################
// src/elements/ResultTable_2.js
//##############################################################################
ENJ.ResultTable_2 = (function() {
  var Element = ENJ.Element,
    Bitmap = CRE.Bitmap,
    Text = CRE.Text;

  return ENJ.defineClass({
    /**
     *
     * @class ResultTable_2
     * @extends Element
     *
     * @constructor
     */
    constructor: function ResultTable_2(store) {
      Element.call(this, store);
    }, extend: Element,
    /**
     * @override
     */
    ready: function() {
      var self = this, bg, btn, label, i, names = ['v1_1', 'v1_2', 'v1', 'v2_1', 'v2_2', 'xx'];

      bg = new Bitmap(RES.getRes("结果报告2"));

      btn = new Bitmap(RES.getRes("关闭按钮"));
      btn.set({ regX: 24, regY: 24, cursor: 'pointer' });
      btn.set({ x: 700, y: 10 });

      self.btn = btn;

      self.addChild(bg, btn);

      for (i = 0; i < names.length; ++i) {
        label = new Text('');
        label.set({
          color: "#000", font: "bold 18px Arial", textAlign: 'center'
        });
        self[names[i]] = label;
        self.addChild(label);
      }

      self.v1_1.set({ x: 200 , y: 130  });
      self.v1_2.set({ x: 310 , y: 130  });
      self.v1.set({ x: 415 , y: 130  });
      self.v2_1.set({ x: 525 , y: 130  });
      self.v2_2.set({ x: 630 , y: 130  });

      self.xx.set({ x: 415 , y: 165 });

      //self.storeChanged('title');
      btn.addEventListener('mousedown', function() {
        btn.set({ scaleX: 0.8, scaleY: 0.8 });
      });
      btn.addEventListener('pressup', function() {
        btn.set({ scaleX: 1.0, scaleY: 1.0 });
        self.dispatchEvent('close');
      });

    },
    /**
     * @override
     */
    storeChanged: function(key) {
      var self = this, value = self.store(key), label = self.label;
      switch (key) {
        case 'v1_1':
          self.v1_1.text = '' + value;
          break;
        case 'v1_2':
          self.v1_2.text = '' + value;
          //self.v1.text = '' + 0.5 * (self.store('v1_1') + self.store('v1_2'));
          break;
        case 'v1':
          self.v1.text = '' + value;
          break;
        case 'v2_1':
          self.v2_1.text = '' + value;
          break;
        case 'v2_2':
          self.v2_2.text = '' + value;
          break;
        case 'xx':
          self.xx.text = '' + value;
          break;
      }
    }

  });
})();
