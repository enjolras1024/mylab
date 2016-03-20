//##############################################################################
// src/elements/Element.js
//##############################################################################
ENJ.Element = (function() {
  var Container = CRE.Container,
    Point = CRE.Point;

  return ENJ.defineClass({
    /**
     * Container with some easy APIs.
     *
     * @class Element
     * @extends Container
     *
     * @constructor
     * @param {Object} store
     */
    constructor: function Element(store) {
      Container.apply(this, arguments);

      this.register();

      if (typeof store === 'object') {
        this._store = store ;
      }

      this.ready();//this.addEventListener('added', this.ready.bind(this));//
    }, extend: Container,
    /**
     * @property active
     * @type {Boolean}
     */
    get active() {
      return this._active;
    },
    /**
     * Register somethings.
     * @method register
     */
    register: function() {
      this._store = {};
      this._active = false;
      this.index = -1;
      this.location = null;
    },
    /**
     * @method ready
     * @abstract
     */
    ready: function() {},
    /**
     * @method refresh
     * @abstract
     */
    refresh: function() {},
    /**
     * @method release
     */
    release: function() {
      this.removeAllEventListeners();
    },
    /**
     * Start interacting.
     *
     * @method start
     */
    start: function() {
      this._active = true;
    },
    /**
     * Stop interacting.
     *
     * @method stop
     */
    stop: function() {
      this._active = false;
    },
    /**
     * Locate this element in scene.
     *
     * @method locate
     * @param {Scene} scene
     * @param {Point} location
     * @param {undefined|Number} index
     */
    locate: function(scene, location, index) {
      var self = this;
      //scene.addChild(this);
      if (location) {
        //this.x = location.x;
        //this.y = location.y;
        self.set(location);
        self.location = location;
      } else {
        self.location = new Point(self.x, self.y);
      }

      if (index === undefined) {
        self.index = scene.getChildIndex(self);
      } else {
        self.index = index;
        if (index !== scene.getChildIndex(self)){
          scene.setChildIndex(self, index);
        }
      }
    },
    /**
     * Get or store key/value.
     * If key is string and value is undefined, get the value by key.
     * Else store value by key.
     *
     * @method store
     * @param {String|Object} key
     * @param {*|undefined} value
     * @returns {*|self}
     */
    store: function(key, value) {
      var props, self = this;

      if (typeof key === 'object') {
        props = key;
        for(key in props) {
          if (props.hasOwnProperty(key)) {
            self.store(key, props[key]);
          }
        }
      }

      if (typeof key !== 'string'){
        return self;
      }

      if (value !== undefined && value !== self._store[key]) {
        self._store[key] = value;
        self.storeChanged(key);
        return self;
      }

      return self._store[key];
    },
    /**
     * @method storeChanged
     * *param {String} key
     * @abstract
     */
    storeChanged: function(key) {}
  });
})();