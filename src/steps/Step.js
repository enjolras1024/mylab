//##############################################################################
// src/steps/Step.js
//##############################################################################
ENJ.Step = (function() {
  var EventDispatcher = CRE.EventDispatcher;

  return ENJ.defineClass({
    /**
     *
     * @class Step
     * @extends EventDispatcher
     *
     * @param {Object} paras
     * @constructor
     */
    constructor: function Step(paras) {
      EventDispatcher.apply(this, arguments);
      //this.register();

      this.scene = paras.scene;
      this.store = paras.store;

      //this.ready();
    }, extend: EventDispatcher,
    /**
     * @property active
     * @type {Boolean}
     */
    get active() {
      return this._active;
    },
    /**
     * @method update
     */
    update: function() {},

    /**
     * Start interacting.
     *
     * @method start
     */
    start: function() {
      this._active = true;
      //this.dispatchEvent('stepstart');
    },

    /**
     * Stop interacting.
     *
     * @method stop
     */
    stop: function() {
      this._active = false;
      this.dispatchEvent('complete');
    }
  });
})();
