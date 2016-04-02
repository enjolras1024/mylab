//##############################################################################
// src/steps/Step_Record_2.js
//##############################################################################
ENJ.Step_Record_2 = (function() {
  var Step = ENJ.Step,
    Tween = CRE.Tween;

  var base = Step.prototype;

  return ENJ.defineClass({
    /**
     * 记录实验数据
     * 所用：结果报告
     *
     * @constructor
     */
    constructor: function Step_Record_2() {
      Step.apply(this, arguments);
    }, extend: Step,

    start: function() {
      base.start.call(this);
      var self = this, scene = this.scene, store = this.store, table = scene.table;


      if (!('canClose' in store) || store.canClose) {
        table.addEventListener('close', function() {
          table.removeAllEventListeners('close');
          table.visible = false;
          self.stop();
        })
      }

      delete store.canClose;

      table.store(store);
      table.visible = true;

    },

    stop: function() {
      base.stop.call(this);
    }
  })

})();
