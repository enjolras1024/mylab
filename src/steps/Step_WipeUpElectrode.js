//##############################################################################
// src/steps/Step_WipeUpElectrode.js
//##############################################################################
ENJ.Step_WipeUpElectrode = (function() {
  var Step = ENJ.Step,
    Tween = CRE.Tween;

  

  var base = Step.prototype;
  
  return ENJ.defineClass({
    /**
     * 擦干电极
     * 所用：纸巾、电极
     *
     * @constructor
     */
    constructor: function Step_WipeUpElectrode() {
      Step.apply(this, arguments);
    }, extend: Step,

    start: function() {
      base.start.call(this);
      var scene = this.scene, paper, electrode;

      paper = this.paper = scene.paper;
      electrode = this.electrode = scene.phElectrode;

      Tween.get(electrode)
        .to({ rotation: 0 }, 500);

      this.flags = [];
      var handlers = this.handlers = [];
      handlers[0] = this.onClick.bind(this);

      paper.visible = true;
      paper.addEventListener('click', handlers[0]);
    },

    stop: function() {
      var electrode = this.electrode;

      Tween.get(electrode)
        .to({ x: electrode.location.x, y: electrode.location.y/*, rotation: 0*/ }, 500);

      this.paper.visible = false;
      this.paper.removeEventListener('click', this.handlers[0]);
      base.stop.call(this);
    },

    update: function() {
      var stage = this.scene.stage;

      if (!this.flags[0]) {
        this.paper.set({ x: stage.mouseX - 60, y: stage.mouseY - 28 });
      }
    },

    onClick: function() {
      if (this.flags[0]) { return; }

      var paper = this.paper, electrode = this.electrode, scene = this.scene;
      if (paper.x > electrode.x - 50 && paper.x < electrode.x + 50 &&
        paper.y > electrode.y + 60 && paper.y < electrode.y + 200) {
        this.flags[0] = true;

        //scene.setChildIndex(paper, scene.getChildIndex(electrode) + 1);
        paper.set({ x: electrode.x - 60, y: electrode.y + 100 });
        Tween.get(paper)
          .to({ y: electrode.y + 200 }, 500)
          .to({ y: electrode.y + 100 }, 500)
          /*.call(function() {
           scene.setChildIndex(paper, scene.getChildIndex(electrode) - 1);
           })*/
          .to({ y: electrode.y + 200 }, 500)
          .to({ y: electrode.y + 100 }, 500)
          .call(this.stop.bind(this));
      }
    }
  });
})();
