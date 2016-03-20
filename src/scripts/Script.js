//##############################################################################
// src/scripts/Script.js
//##############################################################################
ENJ.Script = (function() {
  var EventDispatcher = CRE.EventDispatcher;

  return ENJ.defineClass({
    /**
     * @class Script
     * @extends EventDispatcher
     * @constructor
     */
    constructor: function Script() {
      EventDispatcher.apply(this, arguments);
      this.register();
      this.ready();
    }, extend: EventDispatcher,
    /**
     * @property numSteps
     * @type {Number}
     */
    get numSteps() {
      return this.currentIndex + 1;
    },
    /**
     * Register somethings.
     *
     * @method register
     */
    register: function() {
      this.scene = null;

      this.steps = null;
      this.stores = null;

      this.currentStep = null;
      this.currentIndex = 0;

      this.listener = null;
    },

    /**
     * @method ready
     * @abstract
     */
    ready: function() {},

    /**
     * @method update
     * @param event
     */
    update: function(event) {
      if (this.currentStep && this.currentStep.active) {
        this.currentStep.update(event);
      }
    },

    /**
     * @method start
     */
    start: function() {
      this.listener = this.update.bind(this);

      this.step(0);
      this.scene.addEventListener('tick', this.listener);
    },

    /**
     * @method stop
     */
    stop: function() {
      this.scene.removeEventListener('tick', this.listener);
      this.steps.splice(0);
    },

    /**
     * @method step
     * @param {Number} offset
     */
    step: function(offset) {
      var currentIndex = this.currentIndex, currentStep = this.currentStep;
      //console.log(currentIndex);
      if (currentIndex + offset < 0 || currentIndex + offset > this.steps.length - 1) {
        return;
      }

      if (currentStep) {
        currentStep.removeAllEventListeners();
        if (currentStep.active) {
          currentStep.stop();
        }
      }

      currentIndex = currentIndex + offset;
      //console.log(currentIndex);
      var StepClass = this.steps[currentIndex];
      currentStep = new StepClass({
        scene: this.scene,
        store: this.stores[currentIndex]
      });

      var tip = this.tips[currentIndex];
      if (tip) {
        this.scene.tip.text = '提示：' + tip;
      } else {
        this.scene.tip.text = '';
      }

      currentStep.addEventListener('complete', this.onStepComplete.bind(this));
      currentStep.start();


      this.currentIndex = currentIndex;
      this.currentStep = currentStep;
    },

    /**
     * Go to the next step.
     *
     * @method next
     */
    next: function() {
      if (this.currentIndex < this.steps.length -1) {
        this.step(1);
      }
    },

    /**
     * Go to the previous step.
     *
     * @method prev
     */
    prev: function() {
      if (this.currentIndex > 0) {
        this.step(-1);
      }
    },

    /**
     * Restart from the first step
     * @method restart
     */
    restart: function() {
      //this.scene.addEventListener('tick', this.refresh.bind(this));
      this.skip(0);
    },

    /**
     * Skip to the step at index.
     *
     * @method skip
     * @param {Number} index
     */
    skip: function(index) {
      this.step(index - this.currentIndex);
    },

    /**
     * Auto go to the next step.
     *
     * @method onStepComplete
     */
    onStepComplete: function() {
      this.next();
      this.dispatchEvent('stepComplete');
    }
  });
})();
