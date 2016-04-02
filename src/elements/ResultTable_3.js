//##############################################################################
// src/elements/ResultTable_3.js
//##############################################################################
ENJ.ResultTable_3 = (function() {
  var Element = ENJ.Element,
    Bitmap = CRE.Bitmap,
    Text = CRE.Text;

  return ENJ.defineClass({
    /**
     *
     * @class ResultTable_3
     * @extends Element
     *
     * @constructor
     */
    constructor: function ResultTable_3(store) {
      Element.call(this, store);
    }, extend: Element,
    /**
     * @override
     */
    ready: function() {
      var self = this, bg, btn, label, i, names = ['v0_1', 'v0_2', 'v1_1', 'v1_2', 'v2_1', 'v2_2', 'v1_m', 'v2_m', 'xx'];

      bg = new Bitmap(RES.getRes("结果报告3"));

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

      self.v0_1.set({ x: 620 , y: 125  });
      self.v0_2.set({ x: 620 , y: 155  });
      self.v1_1.set({ x: 270 , y: 125  });
      self.v1_2.set({ x: 385 , y: 125  });
      self.v2_1.set({ x: 270 , y: 155  });
      self.v2_2.set({ x: 385 , y: 155  });
      self.v1_m.set({ x: 500 , y: 125  });
      self.v2_m.set({ x: 500 , y: 155  });

      self.xx.set({ x: 435 , y: 185 });

      //self.storeChanged('title');
      btn.addEventListener('mousedown', function() {
        btn.set({ scaleX: 0.8, scaleY: 0.8 });
      });
      btn.addEventListener('pressup', function() {
        btn.set({ scaleX: 1.0, scaleY: 1.0 });
        self.dispatchEvent('close');
      });
      btn.cursor = 'pointer';
    },
    /**
     * @override
     */
    storeChanged: function(key) {
      var self = this, value = self.store(key);

      if (self[key] ) {
        self[key].text = '' + value;
      }
    }

  });
})();
