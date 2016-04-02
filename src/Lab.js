//##############################################################################
// src/Lab.js
//##############################################################################
ENJ.Lab = (function() {
  var Stage = CRE.Stage,
    Shape = CRE.Shape,
  //var Bitmap = CRE.Bitmap,
    Graphics = CRE.Graphics;

  /**
   * @class Lab
   * @extends Stage
   *
   * @param {String|HTMLCanvasElement} canvas
   * @constructor
   */
  function Lab(canvas) {
    Stage.apply(this,  arguments);
    this.register();
    this.ready();
  }

  var pt = Lab.prototype = Object.create(Stage.prototype);

  pt.constructor = Lab;

  /**
   * Register somethings.
   *
   * @method register
   */
  pt.register = function() {
    //this._renderers = [];
    this.progressBar = null;
  };

  /**
   * @method ready
   */
  pt.ready = function() {
    this.enableMouseOver();
    //var scene = new ENJ.Scene_4();
    //scene.app = this;
    //this.addChild(scene);
    var graphics = new Graphics();
    graphics.beginFill('#0f0').drawRect(0,  0,  600,  5);
    var progressBar = new Shape(graphics);

    graphics = new Graphics();
    graphics.beginFill('#0f0').drawRect(0,  0,  600,  1);
    var line = new Shape(graphics);

    this.addChild(line);
    line.set({ x:180,  y: 305 });
    this.addChild(progressBar);
    progressBar.set({ x:180,  y: 300 });

    this.progressBar = progressBar;
  };

  /**
   * Update the progressBar.
   *
   * @method progress
   * @param {Number} value - from 0 to 1.0
   */
  pt.progress = function(value) {
    this.progressBar.scaleX =  value;
  };

  /**
   * Put a new scene.
   *
   * @method method
   * @param {Scene} scene
   */
  pt.put = function(scene) {
    this.removeAllChildren();
    this.progressBar = null;

    /*scene.alpha = 0;
     CRE.Tween.get(scene).to({
     alpha: 1.0
     },  500);*/
    //scene.app = this;
    this.addChild(scene);

//    var container = new CRE.Container();
//
//    var text = new CRE.Text();
//    text.set({ x:820,  y:20 });
//    text.color='#fff';
//    text.text = 'x: \n\ny: ';
//    this.text = text;
//    container.addChild(text);
//
//    var self = this;
//    //this.addEventListener('tick',  this.refresh.bind(this));
//    this.addEventListener('stagemousemove',  function(evt){
//      self.text.text='x: '+ evt.stageX + '\n\ny: ' +evt.stageY;
//    });
//
//    var i,  g,  line;
//
//    g = new Graphics();
//    g.beginStroke('#ffffff').moveTo(0, 0).lineTo(0, 640);
//    for(i = 0; i < 10; ++ i) {
//      line = new Shape(g);
//      line.x = i * 100;
//      container.addChild(line);
//    }
//
//    g = new Graphics();
//    g.beginStroke('#ffffff', 1).moveTo(0, 0).lineTo(960, 0);
//    for(i = 0; i < 7; ++ i) {
//      line = new Shape(g);
//      line.y = i * 100;
//      container.addChild(line);
//    }
//
//    this.addChild(container);

    /*g = new Graphics();
     g.beginFill('#0f0').drawRect(0, 0, 100, 100);
     var mask = new Shape(g);

     g = new Graphics();
     g.beginFill('#0f0').drawCircle(50, 50, 50);
     var circle = new Shape(g);

     circle.mask = mask;

     circle.y=100;
     CRE.Tween.get(circle).to({y:-50}, 2000);
     this.addChild(circle);*/

  };

  return Lab;
})();
