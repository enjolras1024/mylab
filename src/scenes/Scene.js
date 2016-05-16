//##############################################################################
// src/scenes/Scene.js
//##############################################################################
ENJ.Scene = (function() {
  var Container = CRE.Container;

  return ENJ.defineClass({
    /**
     * Scene that contains elements.
     *
     * @class Scene
     * @extends Container
     *
     * @constructor
     */
    constructor: function Scene() {
      Container.apply(this, arguments);
      this.register();
      this.ready();//this.addEventListener('added', this.ready.bind(this));//
    }, extend: Container,
    /**
     * Register somethings.
     *
     * @abstract
     */
    register: function() {},

//    onadded = function() {
//        this.ready();
//        this._initialized = true;
//    };


    /**
     * @abstract
     */
    ready: function() {},

    /**
     * Place child at given location and index
     *
     * @param {DisplayObject} child
     * @param {Point} location
     * @param {Number} index
     */
    place: function(child, location,index) {
      if (location) {
        //this.x = location.x;
        //this.y = location.y;
        child.set(location);
        child.location = location;
      } else {
        child.location = new Point(child.x, child.y);
      }

      if (index === undefined) {
        child.index = this.getChildIndex(child);
      } else {
        child.index = index;
        if (index !== this.getChildIndex(child)) {
          this.setChildIndex(child, index);
        }
      }
    },

    /**
     * Set child to top.
     *
     * @param {DisplayObject} child
     * @param {number} top
     */
    setToTop: function(child, top) {
      top = top || 1;
      this.setChildIndex(child, this.numChildren - top);
    },

    getLocalMouse: function() {
      return this.globalToLocal(this.stage.mouseX, this.stage.mouseY);
    }
  });
})();
