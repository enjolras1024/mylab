//######################################################################################################################
// src/entry.js
//######################################################################################################################
(function() {
  'use strict';

  var CreateJS = createjs;

  var RES = new CreateJS.LoadQueue();
  RES.getRes = RES.getResult;

  var ENJ = {version: '0.0.3'};
  
//})();
//######################################################################################################################
// src/utils.js
//######################################################################################################################
(function() {

  function assign(target/*,..sources*/) {
    if (!(target instanceof Object)) {
      throw new TypeError('target must be object');
    }

    var source, prop, i, n = arguments.length;

    for (i = 1; i < n; i++) {
      source = arguments[i];
      for (prop in source) {
        if (source.hasOwnProperty(prop )) {
          Object.defineProperty(target, prop, Object.getOwnPropertyDescriptor(source, prop));
        }
      }
    }

    return target;
  }

  //function defineClass(props) {
  //  var subClass, superClass;
  //
  //  if (props.hasOwnProperty('extend')) {
  //    superClass = props.extend;
  //    if (typeof superClass !== 'function') {
  //      throw new TypeError("superClass must be a function");
  //    }
  //  } else {
  //    superClass = Object;
  //  }
  //
  //  if (props.hasOwnProperty('constructor')) {
  //    subClass = props.constructor;
  //    if (typeof subClass !== 'function') {
  //      throw new TypeError("subClass must be a function");
  //    }
  //  } else {
  //    subClass = function() {
  //      superClass.apply(this, arguments);
  //    }
  //  }
  //
  //  if (props.hasOwnProperty('statics')) {
  //    assign(subClass, superClass, props.statics);
  //  }
  //
  //  subClass.prototype = Object.create(superClass.prototype);
  //
  //  assign(subClass.prototype, props);
  //  Object.defineProperty(subClass.prototype, 'constructor', {
  //    value: subClass, enumerable: false, writable: true, configurable: true
  //  });
  //
  //  return subClass;
  //}

  function defineClass(props) {
    var subClass, superClass, mixins, statics, sources;//, ObjectUtil = Exact.ObjectUtil;

    // superClass
    if (props.hasOwnProperty('extend')) {
      superClass = props.extend;

      if (typeof superClass !== 'function') {
        throw new TypeError('superClass must be a function');
      }
    } else {
      superClass = Object;
    }

    // subClass
    if (props.hasOwnProperty('constructor')) {
      subClass = props.constructor;
      //delete props.constructor;
      if (typeof subClass !== 'function') {
        throw new TypeError('subClass must be a function');
      }
    } else {
      subClass = function() {
        superClass.apply(this, arguments);
      };
    }

    // props
    subClass.prototype = Object.create(superClass.prototype);//ObjectUtil.create(superClass.prototype);

    sources = [subClass.prototype];

    mixins = props.mixins;
    if (Array.isArray(mixins)) {
      //delete props.mixins;
      sources.push.apply(sources, mixins);
    }

    sources.push(props);

    defineProps(subClass.prototype, sources);

    Object.defineProperty(subClass.prototype, 'constructor', {
      value: subClass, enumerable: false, writable: true, configurable: true
    });

    // static
    sources = [subClass, superClass];

    statics = props.statics;

    if (statics) {
      mixins = statics.mixins;
      if (Array.isArray(mixins)) {
        //delete statics.mixins;
        sources.push.apply(sources, mixins);
      }

      sources.push(statics);
    }

    defineProps(subClass, sources);

    delete subClass.prototype.statics;
    delete subClass.prototype.entend;
    delete subClass.prototype.mixins;
    delete subClass.mixins;

    return subClass;
  }

  function defineProps(target, sources) {
    var i, n, source;
    for (i = 0, n = sources.length; i < n; ++i) {
      source = sources[i];
      for (var key in source) {
        if (source.hasOwnProperty(key)) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        }
      }
    }
  }

  ENJ.assign = assign;
  ENJ.defineClass = defineClass;

})();
//######################################################################################################################
// src/skins/Skin.js
//######################################################################################################################
(function() {
  var Container = CreateJS.Container;

  function Skin(props) {
    Container.call(this);

    this.register();

    props = props || {};

    this.ready(props);

    this.save(props);
  }

  ENJ.defineClass({
    constructor: Skin,
    extend: Container,

    //statics: {
    //  startDragging: function(skin, anchor) {
    //    skin.onMove = (function(event) {
    //      skin.x = event.stageX ;
    //      skin.y = event.stageY;
    //    });
    //    skin.addEventListener('mousemove', skin.onMove);
    //  },
    //  sopDragging: function(skin) {
    //    skin.removeEventListener('mousemove', skin.onMove);
    //    skin.onMove = null;
    //  }
    //},

    save: function(props) {
      var key, old, val;
      for (key in props) {
        if (props.hasOwnProperty(key)) {
          old = this[key];
          val = props[key];

          if (old === val) {
            continue;
          }

          this[key] = val;
          this.onChange(key, val, old);
        }
      }
    },

    start: function() {
      this.active = true;
    },

    stop: function() {
      this.active = false;
    },

    register: function() {
      this.index = -1;
      this.active = false;
      this.location = null;
    },

    ready: function() {},

    refresh: function() {},

    release: function() {
      this.removeAllEventListeners();
    },

    onChange: function(key, val, old) {}
  });

  ENJ.Skin = Skin;
})();

//##############################################################################
// src/skins/LiquidLayer.js
//##############################################################################
(function() {
  var Skin = ENJ.Skin;
  var Bitmap = CreateJS.Bitmap;
  var ColorFilter = CreateJS.ColorFilter;

  /**
   * 液体层
   * @param props
   * @constructor
   */
  function LiquidLayer(props) {
    Skin.call(this, props);
  }

  ENJ.defineClass({
    constructor: LiquidLayer, extend: Skin,

    ready: function(props) {
      this.addChild(new Bitmap(RES.getRes(props.resId)));
      this.mask = props.mask;
    },

    onChange: function(key, value) {
      switch (key) {
        case 'color':
          var a, r, g, b, color = value, bounds = this.getBounds().clone();

          a = ((color >> 24) & 0xff) / 255;
          r = (color >> 16) & 0xff;
          g = (color >> 8) & 0xff;
          b = color & 0xff;

          this.filters = [new ColorFilter(0, 0, 0, a, r, g, b, 0)];
          this.cache(0, 0, bounds.width, bounds.height);
          this.setBounds(0, 0, bounds.width, bounds.height);

          break;
      }
    }

  });


  ENJ.LiquidLayer = LiquidLayer;

})();
//##############################################################################
// src/skins/BlackBoard.js
//##############################################################################
(function() {
  var Bitmap = CreateJS.Bitmap;
  var ColorFilter = CreateJS.ColorFilter;

  function LiquidContainer() {
    throw new Error('LiquidContainer is static class and can not be instantiated');
  }

  LiquidContainer.createLiquidLayer = function (resId, color, mask) {
    var liquid = new Bitmap(RES.getRes(resId));

    var a, r, g, b, bounds = liquid.getBounds().clone();

    a = ((color >> 24) & 0xff) / 255;
    r = (color >> 16) & 0xff;
    g = (color >> 8) & 0xff;
    b = color & 0xff;

    liquid.filters = [new ColorFilter(0, 0, 0, a, r, g, b, 0)];
    liquid.cache(0, 0, bounds.width, bounds.height);
    liquid.setBounds(0, 0, bounds.width, bounds.height);

    liquid.mask = mask;

    //mask.compositeOperation = 'destination-in';

    return liquid;
  };

  ENJ.LiquidContainer = LiquidContainer;

})();
//##############################################################################
// src/skins/BlackBoard.js
//##############################################################################
(function() {
  var Skin = ENJ.Skin,
    Shape = CreateJS.Shape,
    Text = CreateJS.Text,
    Graphics = CreateJS.Graphics;

  function BlackBoard(store) {
    Skin.call(this, store);
  }

  ENJ.defineClass({
    /**
     *
     * @class BlackBoard
     * @extends Skin
     *
     * @constructor
     */
    constructor: BlackBoard, extend: Skin,
    /**
     * @override
     */
    ready: function(props) {
      var self = this, graphics, rect, label;

      graphics = new Graphics();
      graphics.beginFill('#000')
        .drawRect(0, 0, 951, 506);

      rect = new Shape(graphics);

      label = new Text();
      label.set({
        x: 951/2 , y: 200, color: "#fff", font: "bold 36px Arial", textAlign: 'center'
      });
      //label.setBounds(0, 0, 200, 40);
      //label.set({x: 480 - 100, y: 320 -20 });


      self.addChild(rect, label);


      self.set({
        label: label,
        rect: rect
      });

      //self.storeChanged('title');

    },
    /**
     * @override
     */
    onChange: function(key, value, old) {
      //var self = this, label = this.label;
      switch (key) {
        case 'title':
          this.label.text = value;
//          var bounds = label.getBounds();
//          console.log(bounds);
//          label.set({x: 480 , y: 320 });
          break;
      }
    }

  });

  ENJ.BlackBoard = BlackBoard;

})();

//######################################################################################################################
// src/skins/NumberLabel.js
//######################################################################################################################
(function() {
  var Skin = ENJ.Skin;
  var Text = CreateJS.Text;
  var Bitmap = CreateJS.Bitmap;

  var base = Skin.prototype;

  function NumberLabel(props) {
    Skin.call(this, props);
  }

  ENJ.defineClass({
    constructor: NumberLabel,
    extend: Skin,

    register: function() {
      base.register.call(this);
      this.digits = 2;
      this.number = 0;
      this.unit = '';
    },

    ready: function(props) {
      var field, label;

      label = new Bitmap(RES.getRes('数字标签'));

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
      //this.save({temperature: 'temperature' in props ? props.temperature : 0});
      this.onChange('number');
    },

    onChange: function(key, val, old) {
      if (key === 'number') {
        this.field.text = this.number.toFixed(this.digits) + this.unit;
      }
    }
  });

  ENJ.NumberLabel = NumberLabel;
})();

//##############################################################################
// src/skins/SugarBall.js
//##############################################################################
(function() {
  var Skin = ENJ.Skin;
  var Bitmap = CreateJS.Bitmap;
  var ColorFilter = CreateJS.ColorFilter;

  function SugarBall(props) {
    Skin.call(this, props);
  }

  ENJ.defineClass({
    constructor: SugarBall, extend: Skin,

    ready: function(props) {
      this.addChild(new Bitmap(RES.getRes('糖球')));
      this.set({regX: 6, regY: 6});
    },

    onChange: function(key, value) {
      switch (key) {
        case 'factors':
          var factors = value, bounds = this.getBounds().clone();

          this.filters = [new ColorFilter(1, factors[0], factors[1], factors[2])];
          this.cache(0, 0, bounds.width, bounds.height);
          this.setBounds(0, 0, bounds.width, bounds.height);

          break;
      }
    }

  });


  ENJ.SugarBall = SugarBall;

})();
//##############################################################################
// src/skins/Beaker.js
//##############################################################################
(function() {
  var Shape = CreateJS.Shape;
  var Bitmap = CreateJS.Bitmap;
  var Graphics = CreateJS.Graphics;

  var Skin = ENJ.Skin;
  var NumberLabel = ENJ.NumberLabel;
  var LiquidLayer = ENJ.LiquidLayer;
  var LiquidContainer = ENJ.LiquidContainer;

  /**
   * 烧杯
   * @param props
   * @constructor
   */
  function Beaker(props) {
    Skin.call(this, props);
  }

  ENJ.defineClass({
    constructor: Beaker, extend: Skin,

    register: function() {
      this.speed = 1;
    },

    ready: function(props) {
      var graphics, shape, label, liquid, bottle;

      graphics = new Graphics();
      graphics.beginFill('#0f0')
        .drawRect(-200, 0, 400, 200)
        /*.drawEllipse(-38, -7.5, 76, 15)*/;

      shape = new Shape(graphics);
      shape.x = 40;

      //label = new NumberLabel({ unit: 'ml' });
      //label.x = 10;

      //liquid = LiquidContainer.createLiquidLayer("烧杯液体", props.color, shape);
      liquid = new LiquidLayer({resId: '烧杯液体', mask: shape, color: props.color});// LiquidContainer.createLiquidLayer("烧杯液体", props.color, shape);

      bottle = new Bitmap(RES.getRes("烧杯"));

      this.addChild(liquid, bottle);

      this.set({
        liquid: liquid,
        //label: label,
        shape: shape
      });

      this.color = props.color;
    },

    //fix: function() {
    //
    //},

    refresh: function() {
      this.shape.rotation = -this.rotation * this.speed;
      this.shape.x = 40 + (this.fixed ? Math.sin(this.rotation/180*3.14)*25 : 0);
      //this.shape.x = 40;
      //if (this.shape.y > 40) {
      //  this.shape.x += Math.sin(this.rotation/180*3.14)*27;
      //}
    },

    onChange: function(key, value) {
      var label = this.label, shape = this.shape;

      switch (key) {
        case 'volume':

          shape.y = 80 - value * 78 /100 - 2;
          this.liquid.visible = value > 0;
          //if (!this.fixed) {
          //  shape.y = 80 - value * 78 /100 - 2;
          //} else {
          //  shape.y = 38 - value * 38 /100 + 40;
          //}


          //label.y = shape.y - 10;
          //label.save({number: value});

          break;
        case 'color':
          //this.liquid = LiquidContainer.createLiquidLayer("烧杯液体", value, shape);
          //this.removeChildAt(1);
          //this.addChildAt(this.liquid, 1);
          this.liquid.save({color: value});
          break;
      }
    }
  });

  ENJ.Beaker = Beaker;

})();

//##############################################################################
// src/skins/BigBeaker.js
//##############################################################################
(function() {
  var Shape = CreateJS.Shape;
  var Bitmap = CreateJS.Bitmap;
  var Graphics = CreateJS.Graphics;

  var Skin = ENJ.Skin;
  var NumberLabel = ENJ.NumberLabel;
  //var LiquidContainer = ENJ.LiquidContainer;
  var LiquidLayer = ENJ.LiquidLayer;

  function BigBeaker(props) {
    Skin.call(this, props);
  }

  ENJ.defineClass({
    constructor: BigBeaker, extend: Skin,

    ready: function(props) {
      var graphics, shape, label, liquid, bottle;

      graphics = new Graphics();
      graphics.beginFill('#0f0')
        .drawRect(-200, 0, 400, 200)
        /*.drawEllipse(-38, -7.5, 76, 15)*/;

      shape = new Shape(graphics);
      shape.x = 75;

      //label = new NumberLabel({ unit: 'ml' });
      //label.x = 10;

      liquid = new LiquidLayer({resId: '大烧杯液体', mask: shape, color: props.color});//LiquidContainer.createLiquidLayer("大烧杯液体", props.color, shape);

      bottle = new Bitmap(RES.getRes("大烧杯"));

      this.addChild(liquid, bottle);

      this.set({
        liquid: liquid,
        //label: label,
        shape: shape
      });
    },

    refresh: function() {
      this.shape.rotation = -this.rotation;
    },

    onChange: function(key, value) {
      var label = this.label, shape = this.shape;

      switch (key) {
        case 'volume':
          shape.y = 150 - value * 150 /300 - 2;

          //label.y = shape.y - 10;
          //label.save({number: value});

          break;
        //case 'color':
        //  this.liquid = LiquidContainer.createLiquidLayer("烧杯液体", value, shape);
        //  this.removeChildAt(0);
        //  this.addChildAt(this.liquid, 0);
        //  break;
      }
    }
  });

  ENJ.BigBeaker = BigBeaker;

})();

//##############################################################################
// src/elements/Cylinder.js
//##############################################################################
(function() {
  var Tween = CreateJS.Tween;
  var Shape = CreateJS.Shape;
  var Bitmap = CreateJS.Bitmap;
  var Graphics = CreateJS.Graphics;

  var Skin = ENJ.Skin;
  var NumberLabel = ENJ.NumberLabel;
  //var LiquidContainer = ENJ.LiquidContainer;
  var LiquidLayer = ENJ.LiquidLayer;

  /**
   * 量筒
   * @param props
   * @constructor
   */
  function Cylinder(props) {
    Skin.call(this, props);
  }

  ENJ.defineClass({
    /**
     *
     * @class Cylinder
     * @extends LiquidContainer
     *
     * @constructor
     */
    constructor: Cylinder, extend: Skin,
    /**
     * @override
     */
    ready: function(props) {
      var graphics, shape, liquid, barrel;

      graphics = new Graphics();
      graphics.beginFill('#0f0').drawRect(-300, 0, 600, 400);

      shape = new Shape(graphics);
      shape.x = 35;

      liquid = new LiquidLayer({resId: '量筒液体', mask: shape, color: props.color});//LiquidContainer.createLiquidLayer("量筒液体", props.color, shape);
      barrel = new Bitmap(RES.getRes("量筒"));

      var label = new NumberLabel({unit: ' ml', digits: 1});
      label.visible = false;
      label.x = 50;

      this.addChild(liquid, barrel, label);

      this.liquid = liquid;
      this.label = label;
      this.shape = shape;

      //this.store('volume', 5);
      //this.onChange('volume', props.volume);
    },

    refresh: function() {
      this.shape.rotation = -this.rotation;
    },

    toggle: function(duration) {
      duration = duration || 500;

      var label = this.label;
      if (label.visible) {
        Tween.get(label).to({
          alpha: 0
        }, duration).call(function() {
          label.visible = false;
        });
      } else {
        label.visible = true;
        Tween.get(label).to({
          alpha: 1.0
        }, duration);
      }
    },
    /**
     * @override
     */
    onChange: function(key, value) {

      switch (key) {
        case 'volume':
          this.shape.y = 200 - value * 175 / 80 - 25;
          this.label.save({number: value});
          this.label.y = this.shape.y - 10;
          this.liquid.visible = value > 0;
          break;
      }
    }
  });

  ENJ.Cylinder = Cylinder;

})();
//######################################################################################################################
// src/skins/ProgressBar.js
//######################################################################################################################
(function() {
  var Shape = CreateJS.Shape;
  var Graphics = CreateJS.Graphics;

  var Skin = ENJ.Skin;

  function ProgressBar(props) {
    Skin.call(this, props);
  }

  ENJ.defineClass({
    constructor: ProgressBar,
    extend: Skin,

    ready: function(props) {
      var length = props.length || 500;

      var graphics = new Graphics();
      graphics.beginFill('#0f0').drawRect(0,  0,  length,  5);
      var bar = new Shape(graphics);

      graphics = new Graphics();
      graphics.beginFill('#0f0').drawRect(0,  0,  length,  1);
      var line = new Shape(graphics);

      this.addChild(line);
      line.set({ x:0,  y: 5 });

      this.addChild(bar);
      bar.set({ x:0,  y: 0, scaleX: 0});

      this.bar = bar;
    },

    onChange: function(key, val, old) {
      if (key === 'progress') {
        this.bar.scaleX =  val;
      }
    }
  });

  ENJ.ProgressBar = ProgressBar;
})();

//######################################################################################################################
// src/skins/Thermometer.js
//######################################################################################################################
(function() {
  var Shape = CreateJS.Shape;
  var Bitmap = CreateJS.Bitmap;
  var Graphics = CreateJS.Graphics;
  var NumberLabel = ENJ.NumberLabel;

  var Skin = ENJ.Skin;

  /**
   * 温度计
   * @param props
   * @constructor
   */
  function Thermometer(props) {
    Skin.call(this, props);
  }

  ENJ.defineClass({
    constructor: Thermometer,
    extend: Skin,

    ready: function(props) {
      var body = new Bitmap(RES.getRes('温度计'));

      var graphics = new Graphics();
      graphics.beginFill('#f00').drawRect(0,  0,  2,  250);
      var bar = new Shape(graphics);

      var label = new NumberLabel({unit: ' ℃', digits: 1});

      this.addChild(bar, body, label);

      bar.set({ x:3,  y: 0, scaleY: 0});
      label.x = 8;

      this.bar = bar;
      this.label = label;
      this.save({temperature: 'temperature' in props ? props.temperature : 0});
    },

    //toggle: function() {
    //  this.label.visible = !this.label.visible;
    //},

    onChange: function(key, val, old) {
      if (key === 'temperature') {
        this.bar.scaleY =  val  / 100;
        this.bar.y = 300 - 250 * this.bar.scaleY;

        if (val) {
          this.label.visible = true;
          this.label.save({number: val});
          this.label.y = this.bar.y - 12;
        } else {
          this.label.visible = false;
        }

      }
    }
  });

  ENJ.Thermometer = Thermometer;
})();

//##############################################################################
// src/skins/Dropper.js
//##############################################################################
(function() {
  var Tween = CreateJS.Tween;
  var Shape = CreateJS.Shape;
  var Bitmap = CreateJS.Bitmap;
  var Graphics = CreateJS.Graphics;

  var Skin = ENJ.Skin;
  var NumberLabel = ENJ.NumberLabel;
  var LiquidLayer = ENJ.LiquidLayer;
  var LiquidContainer = ENJ.LiquidContainer;

  var base = Skin.prototype;

  /**
   *
   * @param props
   * @constructor
   */
  function Dropper(props) {
    Skin.call(this, props);
  }

  ENJ.defineClass({
    constructor: Dropper, extend: Skin,

    register: function() {
      this.speed = 1;
    },

    ready: function(props) {

      //label = new NumberLabel({ unit: 'ml' });
      //label.x = 10;

      var drop = new Bitmap(RES.getRes('水滴'));

      drop.x = 8;
      drop.visible = false;

      var pipe = new Bitmap(RES.getRes("滴管"));

      this.addChild(drop, pipe);

      this.set({
        drop: drop
      });
    },

    start: function() {
      base.start.call(this);

      this.drop.y = 120;
      this.drop.visible = true;

      Tween.get(this.drop)
          .to({
            y: 180
          }, 500)
    },

    stop: function() {
      this.drop.visible = false;
      base.stop.call(this);
    },

    //fix: function() {
    //
    //},

    refresh: function() {
      //this.shape.rotation = -this.rotation * this.speed;
      //this.shape.x = 40 + (this.fixed ? Math.sin(this.rotation/180*3.14)*25 : 0);
      //this.shape.x = 40;
      //if (this.shape.y > 40) {
      //  this.shape.x += Math.sin(this.rotation/180*3.14)*27;
      //}
    }
  });

  ENJ.Dropper = Dropper;

})();

//######################################################################################################################
// src/skins/DigitalDisplay.js
//######################################################################################################################
(function() {
  var Skin = ENJ.Skin;
  var base = Skin.prototype;

  /**
   * 数显
   * @param props
   * @constructor
   */
  function DigitalDisplay(props) {
    Skin.call(this, props);
  }

  ENJ.defineClass({
    constructor: DigitalDisplay,
    extend: Skin,

    register: function() {
      base.register.call(this);
      this.number = 0;
      this.maximum = 99999;
      this.minimum = -9999;
      this.maxLength = 5;
    },

    ready: function(props) {
      var data = {
        images: [RES.getRes("电子数字")],
        frames: { width: 10, height: 18 },
        animations: {
          "-": 0,
          "0": 1,
          "1": 2,
          "2": 3,
          "3": 4,
          "4": 5,
          "5": 6,
          "6": 7,
          "7": 8,
          "8": 9,
          "9": 10//,
          //"e": 11,
          //"E": 11
        }
      };

      var sheet = new CreateJS.SpriteSheet(data);

      var display = new CreateJS.BitmapText('0', sheet);

      var bounds = display.getBounds();

      this.digitWidth = bounds.width;
      this.digitHeight = bounds.height;
      display.letterSpacing = Math.floor(this.digitWidth * 0.6);

      this.displayMaxWidth = (this.digitWidth + display.letterSpacing) * this.maxLength;

      var graphics = new CreateJS.Graphics();
      graphics.beginFill('#f00').drawCircle(0, 0, (display.letterSpacing-3) * 0.5);

      var dot = new CreateJS.Shape(graphics);
      dot.visible = false;

      this.addChild(
        display, dot
      );

      this.dot = dot;
      this.display = display;

      //if (!props || !props.hasOwnProperty('number')) {
        this.onChange('number');
      //}
    },

    onChange: function(key, val, old) {
      if (key === 'number') {
        var num = this.number;
        var dot = this.dot;
        var display = this.display;

        //console.log('change');

        if (!display || !dot) { return; }

        if (num < this.minimum) {
          num = this.minimum;
        } else if (num > this.maximum) {
          num = this.maximum;
        }

        var text = ('' + num.toFixed(this.maxLength)).slice(0, this.maxLength + 1);

        display.text = text;
        display.x = this.displayMaxWidth - display.getBounds().width;

        var index = text.indexOf('.');
        if (index > 0 && index < text.length - 1) {
          dot.x = index * (this.digitWidth + display.letterSpacing) - 0.5 *  display.letterSpacing + display.x;
          dot.y = this.digitHeight - 2;
          dot.visible = true;
        } else {
          dot.visible = false;
        }

      } else if (key === 'maxLength') {
        this.displayMaxWidth = (this.digitWidth + this.display.letterSpacing) * this.maxLength;
        this.minimum = -Math.pow(10, this.maxLength)+1;
        this.maximum = +Math.pow(10, this.maxLength + 1)-1;
        this.onChange('number');
      }
    }
  });

  ENJ.DigitalDisplay = DigitalDisplay;
})();

//######################################################################################################################
// src/skins/PlatformScale.js
//######################################################################################################################
(function() {
  var Skin = ENJ.Skin;
  var DigitalDisplay = ENJ.DigitalDisplay;

  var base = Skin.prototype;

  /**
   * 台秤
   * @param props
   * @constructor
   */
  function PlatformScale(props) {
    Skin.call(this, props);
  }

  ENJ.defineClass({
    constructor: PlatformScale,
    extend: Skin,

    register: function() {
      base.register.call(this);
      this.weight = 0;
    },

    ready: function(props) {
      var body = new CreateJS.Bitmap(RES.getRes("台秤"));

      var digitalDisplay = new DigitalDisplay({number:0, maxLength: 5});
      digitalDisplay.set({
        x: 100, y: 108, scaleX: 0.5, scaleY: 0.5
      });

      this.addChild(
        body, digitalDisplay
      );

      this.digitalDisplay = digitalDisplay;
    },

    onChange: function(key, val, old) {
      if (key === 'weight') {
        this.digitalDisplay.save({number: this.weight});
      }
    }
  });

  ENJ.PlatformScale = PlatformScale;
})();

//######################################################################################################################
// src/skins/InductionCooker.js
//######################################################################################################################
(function() {
  var Bitmap = CreateJS.Bitmap;
  var Tween = CreateJS.Tween;
  var Skin = ENJ.Skin;
  var base = Skin.prototype;

  /**
   * 电磁炉
   * @param props
   * @constructor
   */
  function InductionCooker(props) {
    Skin.call(this, props);
  }

  ENJ.defineClass({
    constructor: InductionCooker,
    extend: Skin,

    ready: function() {
      var body = new Bitmap(RES.getRes("电磁炉"));
      var button = new Bitmap(RES.getRes("电磁炉旋钮"));

      var bounds = button.getBounds();
      button.set({x: 162, y: 90, regX: bounds.width * 0.5, regY: bounds.height * 0.5});

      this.addChild(
        body, button
      );

      this.button = button;
    },

    start: function () {
      base.start.call(this);
      Tween.get(this.button).to({rotation: 90}, 200);
    },

    stop: function () {
      base.stop.call(this);
      Tween.get(this.button).to({rotation: 0}, 200);
    }
  });

  ENJ.InductionCooker = InductionCooker;
})();

//######################################################################################################################
// src/skins/Spectrophotometer.js
//######################################################################################################################
(function() {
  var Skin = ENJ.Skin;
  var DigitalDisplay = ENJ.DigitalDisplay;

  var base = Skin.prototype;

  /**
   * 分光光度计
   * @param props
   * @constructor
   */
  function Spectrophotometer(props) {
    Skin.call(this, props);
  }

  ENJ.defineClass({
    constructor: Spectrophotometer,
    extend: Skin,

    register: function() {
      base.register.call(this);
      this.luminosity = 0;
      this.grade = 0;
    },

    ready: function(props) {
      var bar = new CreateJS.Bitmap(RES.getRes("分光光度计拉杆"));

      var mask = new CreateJS.Shape();
      //mask.x = 10;
      mask.y = 180;
      mask.alpha = 0.5;
      mask.graphics.beginFill('#0f0').drawRect(0,0,100,100).drawCircle(65,4,10);

      bar.mask = mask;

      var data = {
        images: [RES.getRes("分光光度计")],
        frames: { width: 300, height: 216 },
        animations: {
          close: 0, open: 1
        }
      };

      var sheet = new CreateJS.SpriteSheet(data);

      var body = new CreateJS.Sprite(sheet);

      var digitalDisplay = new DigitalDisplay({number: Math.random() * 0.1, maxLength: 5});
      digitalDisplay.set({
        x: 158, y: 148, scaleX: 0.6, scaleY: 0.6//, visible: false
      });

      this.addChild(
        body, bar, /*mask,*/ digitalDisplay
      );

      this.bar = bar;
      this.body = body;
      this.digitalDisplay = digitalDisplay;

      this.stop();
      this.onChange('grade', 0);
    },

    start: function() {
      base.start.call(this);
      this.body.gotoAndStop('close');
    },

    stop: function() {
      base.stop.call(this);
      this.body.gotoAndStop('open');
    },

    correct: function() {
      this.digitalDisplay.save({number: 0});
    },

    onChange: function(key, val, old) {
      if (key === 'luminosity') {
        this.digitalDisplay.save({number: this.luminosity});
      } else if (key === 'grade') {
        var bar = this.bar;
        switch (val) {
          case 0:
            bar.x = 57;
            bar.y = 152;
            bar.mask.y = 180;
            break;
          case 1:
            bar.x = 56;
            bar.y = 157;
            bar.mask.y = 183;
            break;
          case 2:
            bar.x = 53;
            bar.y = 167;
            bar.mask.y = 183;
            break;
          case 3:
            bar.x = 50;
            bar.y = 177;
            bar.mask.y = 183;
            break;
        }
      }
    }
  });

  ENJ.Spectrophotometer = Spectrophotometer;
})();

//######################################################################################################################
// src/skins/WildMouthBottle.js
//######################################################################################################################
(function() {
  var Tween = CreateJS.Tween;
  var Bitmap = CreateJS.Bitmap;
  var Container = CreateJS.Container;

  var Skin = ENJ.Skin;

  var base  = Skin.prototype;

  /**
   * 广口瓶
   * @param props
   * @constructor
   */
  function WildMouthBottle(props) {
    Skin.call(this, props);
  }

  ENJ.defineClass({
    constructor: WildMouthBottle,
    extend: Skin,

    ready: function(props) {
      var cap = new Bitmap(RES.getRes('广口瓶瓶塞'));
      var body = new Bitmap(RES.getRes('广口瓶瓶身'));

      var location = {x: 11, y: -15};

      cap.set(location);
      cap.location = location;
      //var container = new Container();



      var content = props.content;

      //content = new Container();
      //for (var i = 0; i < 50; ++i) {
      //  var ball = new Bitmap(RES.getRes('糖球'));
      //  ball.x = Math.random() * 60/* + 10*/;
      //  ball.y = Math.random() * 60 + 57;
      //  content.addChild(ball);
      //}
      //content.cache(0,0,80,137);

      if (content instanceof Container) {
        var bounds = content.getBounds();
        content.y = 17;//137 - bounds.height;

        this.addChild(content);
      }
      console.log(content instanceof Container);

      this.addChild(cap, body);

      this.cap = cap;
    },

    start: function() {
      base.start.call(this);
      Tween.get(this.cap).to({
        x: -30, y: -30, alpha: 0, rotation: -60
      }, 500);
    },

    stop: function() {
      var cap = this.cap;
      Tween.get(cap).to({
        x: cap.location.x, y: cap.location.y, alpha: 1.0, rotation: 0
      }, 500);

      base.stop.call(this);
    },

    onChange: function(key, val, old) {
      if (key === 'temperature') {


      }
    }
  });

  ENJ.WildMouthBottle = WildMouthBottle;
  
})();

//##############################################################################
// src/skins/NarrowMouthBottle.js
//##############################################################################
(function() {
  var Tween = CreateJS.Tween;
  var Shape = CreateJS.Shape;
  var Text = CreateJS.Text;
  var Bitmap = CreateJS.Bitmap;
  var Graphics = CreateJS.Graphics;
  var Container = CreateJS.Container;

  var Skin = ENJ.Skin;
  var NumberLabel = ENJ.NumberLabel;
  var LiquidLayer = ENJ.LiquidLayer;
  var LiquidContainer = ENJ.LiquidContainer;

  var base = Skin.prototype;

  /**
   * 细口瓶
   * @param props
   * @constructor
   */
  function NarrowMouthBottle(props) {
    Skin.call(this, props);
  }

  ENJ.defineClass({
    constructor: NarrowMouthBottle, extend: Skin,

    ready: function(props) {
      var graphics, shape, label, liquid, bottle;

      graphics = new Graphics();
      graphics.beginFill('#0f0')
        .drawRect(-200, 0, 400, 200)
        /*.drawEllipse(-38, -7.5, 76, 15)*/;

      shape = new Shape(graphics);
      shape.x = 40;

      //label = new NumberLabel({ unit: 'ml' });
      //label.x = 10;

      //liquid = LiquidContainer.createLiquidLayer("烧杯液体", props.color, shape);
      liquid = new LiquidLayer({resId: '细口瓶液体', mask: shape, color: props.color});// LiquidContainer.createLiquidLayer("烧杯液体", props.color, shape);

      bottle = new Bitmap(RES.getRes("细口瓶"));

      if (props.useCap) {
        var cap = new Bitmap(RES.getRes('玻璃塞'));
        cap.set({x: 16, y: -10});
        this.addChild(cap);
        this.cap =  cap;
      }

      if (props.label) {
        label = new Bitmap(RES.getRes('标签'));
        var text = new Text(props.label, 'normal 18px Arial', '#000000');

        var container = new Container();
        container.addChild(bottle, label, text);

        text.set({x: 15, y: 56, scaleX: 0.5, scaleY: 0.5});
        label.set({x: 7, y: 50});

        var bounds = container.getBounds();
        container.cache(0,0,bounds.width,bounds.height);

        this.addChild(liquid, container);
      } else {
        this.addChild(liquid, bottle);
      }

      this.set({
        liquid: liquid,
        //label: label,
        shape: shape
      });

      this.color = props.color;
    },

    start: function() {
      base.start.call(this);

      if (this.cap) {
        Tween.get(this.cap)
          .to({
            x: 60, y: -60, alpha: 0.0, rotation: 60
          }, 500);
      }

    },

    stop: function() {
      base.stop.call(this);

      if (this.cap) {
        Tween.get(this.cap)
          .to({
            x: 16, y: -10, alpha: 1.0, rotation: 0
          }, 500);
      }
    },

    //fix: function() {
    //
    //},

    refresh: function() {
      this.shape.rotation = -this.rotation;
      //this.shape.x = 40 + (this.fixed ? Math.sin(this.rotation/180*3.14)*25 : 0);
      //this.shape.x = 40;
      //if (this.shape.y > 40) {
      //  this.shape.x += Math.sin(this.rotation/180*3.14)*27;
      //}
    },

    onChange: function(key, value) {
      var label = this.label, shape = this.shape;

      switch (key) {
        case 'volume':

          shape.y = 80 - value * 78 /100 - 2;
          this.liquid.visible = value > 0;
          //if (!this.fixed) {
          //  shape.y = 80 - value * 78 /100 - 2;
          //} else {
          //  shape.y = 38 - value * 38 /100 + 40;
          //}


          //label.y = shape.y - 10;
          //label.save({number: value});

          break;
        case 'color':
          //this.liquid = LiquidContainer.createLiquidLayer("烧杯液体", value, shape);
          //this.removeChildAt(1);
          //this.addChildAt(this.liquid, 1);
          this.liquid.save({color: value});
          break;
      }
    }
  });

  ENJ.NarrowMouthBottle = NarrowMouthBottle;

})();

//######################################################################################################################
// src/skins/WeightingPaper.js
//######################################################################################################################
(function() {
  //var Tween = CreateJS.Tween;
  var Shape = CreateJS.Shape;
  var Bitmap = CreateJS.Bitmap;
  var Graphics = CreateJS.Graphics;
  var Container = CreateJS.Container;

  var Skin = ENJ.Skin;

  var base  = Skin.prototype;

  function WeightingPaper(props) {
    Skin.call(this, props);
  }

  ENJ.defineClass({
    constructor: WeightingPaper,
    extend: Skin,

    ready: function(props) {
      var paper = new Bitmap(RES.getRes('称量纸折边'));
      var content = new Container();

      var graphics = new Graphics();
      graphics.beginFill('#0f0').drawRect(0,  0,  80,  50);
      var shape = new Shape(graphics);
      shape.alpha = 0.5;
      shape.set({alpha: 0.5, x: 40, y: -32, rotation: 2});

      content.mask = shape;

      this.addChild(paper, content/*, shape*/);

      this.content = content;
    },

    clear: function() {
      this.content.removeAllChildren();
    },

    addSome: function() {
      var content = this.content;
      content.addChild.apply(content, arguments);
    },

    pickOne: function() {
      var content = this.content;

      var child = content.getChildAt(0);

      content.removeChildAt(0);

      return child;
    },


    onChange: function(key, val, old) {

    }
  });

  ENJ.WeightingPaper = WeightingPaper;

})();

//######################################################################################################################
// src/skins/PowderBottle.js
//######################################################################################################################
(function() {
  var Text = CreateJS.Text;
  var Tween = CreateJS.Tween;
  var Bitmap = CreateJS.Bitmap;
  var Container = CreateJS.Container;

  var Skin = ENJ.Skin;

  var base  = Skin.prototype;

  function PowderBottle(props) {
    Skin.call(this, props);
  }

  ENJ.defineClass({
    constructor: PowderBottle,
    extend: Skin,

    register: function() {

    },

    ready: function(props) {
      var cap = new Bitmap(RES.getRes('广口瓶瓶塞'));
      var body = new Bitmap(RES.getRes('广口瓶瓶身'));
      var text = new Text('聚酰胺粉', 'normal 18px Arial', '#000000');
      var label = new Bitmap(RES.getRes('标签'));
      var powder = new Bitmap(RES.getRes('聚酰胺粉'));

      //text.set({
      //  //text: '聚酰胺粉',
      //  //color: '#000',
      //  //font: '6px Arial',
      //  x: 7, y: 5
      //});


      text.set({x: 15, y: 56, scaleX: 0.5, scaleY: 0.5});
      label.set({x: 7, y: 50});
      //label.set({scaleX: 2, scaleY: 2});

      var location = {x: 9, y: -12};

      cap.set(location);
      cap.location = location;

      var container = new Container();
      container.addChild(body, label, text);

      var bounds = container.getBounds();
      container.cache(0,0,bounds.width,bounds.height);
      //container.set({scaleX: 0.5, scaleY: 0.5});
      //container.x = 7;
      //container.y = 50;


      this.addChild(cap, powder, /*body, */container);





      this.cap = cap;
      this.body = body;
    },



    release: function() {
      base.release.call(this);

    },

    refresh:function() {

    },

    start: function() {
      base.start.call(this);

      Tween.get(this.cap).to({
        x: -30, y: -30, alpha: 0, rotation: -60
      }, 500);
    },

    stop: function() {
      var cap = this.cap;
      Tween.get(cap).to({
        x: cap.location.x, y: cap.location.y, alpha: 1.0, rotation: 0
      }, 500);

      base.stop.call(this);
    }
  });

  ENJ.PowderBottle = PowderBottle;

})();

//##############################################################################
// src/skins/ColorimetricTube.js
//##############################################################################
(function() {
  var Tween = CreateJS.Tween;
  var Text = CreateJS.Text;
  var Shape = CreateJS.Shape;
  var Bitmap = CreateJS.Bitmap;
  var Graphics = CreateJS.Graphics;

  var Skin = ENJ.Skin;
  var NumberLabel = ENJ.NumberLabel;
  var LiquidLayer = ENJ.LiquidLayer;
  var LiquidContainer = ENJ.LiquidContainer;

  var base = Skin.prototype;

  /**
   * 比色管
   * @param props
   * @constructor
   */
  function ColorimetricTube(props) {
    Skin.call(this, props);
  }

  ENJ.defineClass({
    constructor: ColorimetricTube, extend: Skin,

    register: function() {
      this.opacity = 1;
      this.volume = 0;
    },

    ready: function(props) {
      var graphics, shape, label, liquid, body, cap;

      graphics = new Graphics();
      graphics.beginFill('#0f0')
        .drawRect(-200, 0, 400, 200)
        /*.drawEllipse(-38, -7.5, 76, 15)*/;

      shape = new Shape(graphics);
      shape.x = 7;
      shape.y = 200;

      //label = new NumberLabel({ unit: 'ml' });
      //label.x = 10;

      //liquid = LiquidContainer.createLiquidLayer("烧杯液体", props.color, shape);
      liquid = new LiquidLayer({resId: '比色管液', mask: shape, color: props.color});// LiquidContainer.createLiquidLayer("烧杯液体", props.color, shape);

      body = new Bitmap(RES.getRes("比色管身"));
      cap = new Bitmap(RES.getRes("比色管塞"));
      cap.y = -2;

      this.addChild(liquid, cap, body);

      if ('no' in props) {
        var text = new Text(props.no, 'normal 12px 黑体', '#000000');
        text.set({x: 8, y: 50, textAlign: 'center'});
        this.addChild(text);
      }

      this.set({
        liquid: liquid,
        shape: shape,
        cap: cap
      });

      this.color = props.color;
    },

    //fix: function() {
    //
    //},

    refresh: function() {
      this.shape.rotation = -this.rotation;
      //this.shape.x = 40 + (this.fixed ? Math.sin(this.rotation/180*3.14)*25 : 0);
      //this.shape.x = 40;
      //if (this.shape.y > 40) {
      //  this.shape.x += Math.sin(this.rotation/180*3.14)*27;
      //}
    },

    start: function() {
      base.start.call(this);

      if (this.cap) {
        Tween.get(this.cap)
          .to({
            x: -50, y: -50, alpha: 0.0, rotation: -60
          }, 500);
      }

    },

    stop: function() {
      base.stop.call(this);

      if (this.cap) {
        Tween.get(this.cap)
          .to({
            x: 0, y: -2, alpha: 1.0, rotation: 0
          }, 500);
      }
    },

    onChange: function(key, value) {
      var label = this.label, shape = this.shape;

      switch (key) {
        case 'volume':

          shape.y = 120 - value * 100 /10 - 2;
          this.liquid.visible = value > 0;

          break;
        case 'opacity':
          this.liquid.alpha = value;
          break;
        case 'color':
          //this.liquid = LiquidContainer.createLiquidLayer("烧杯液体", value, shape);
          //this.removeChildAt(1);
          //this.addChildAt(this.liquid, 1);
          this.liquid.save({color: value});
          break;
      }
    }
  });

  ENJ.ColorimetricTube = ColorimetricTube;

})();

//##############################################################################
// src/skins/CentrifugeTube.js
//##############################################################################
(function() {
  var Shape = CreateJS.Shape;
  var Bitmap = CreateJS.Bitmap;
  var Graphics = CreateJS.Graphics;

  var Skin = ENJ.Skin;
  var LiquidLayer = ENJ.LiquidLayer;

  var base = Skin.prototype;

  function CentrifugeTube(props) {
    Skin.call(this, props);
  }

  ENJ.defineClass({
    constructor: CentrifugeTube, extend: Skin,

    register: function() {
      this.speed = 1;
    },

    ready: function(props) {
      var graphics, shape, label, liquid, bottle;

      graphics = new Graphics();
      graphics.beginFill('#0f0')
        .drawRect(-200, 0, 400, 200)
        /*.drawEllipse(-38, -7.5, 76, 15)*/;

      shape = new Shape(graphics);
      shape.x = 35;

      //label = new NumberLabel({ unit: 'ml' });
      //label.x = 10;

      //liquid = LiquidContainer.createLiquidLayer("烧杯液体", props.color, shape);
      liquid = new LiquidLayer({resId: '离心管液', mask: shape, color: props.color});// LiquidContainer.createLiquidLayer("烧杯液体", props.color, shape);

      bottle = new Bitmap(RES.getRes("离心管芯"));

      this.addChild(liquid, bottle);

      this.set({
        liquid: liquid,
        //label: label,
        shape: shape
      });

      this.color = props.color;
    },

    start: function() {
      base.start.call(this);
      this.shape.x = 0;
      this.shape.y = 0;
    },

    stop: function() {
      this.shape.x = 35;
      base.stop.call(this);
    },

    refresh: function() {
      this.shape.rotation = -this.rotation * this.speed;
      //this.shape.x = 40 + (this.fixed ? Math.sin(this.rotation/180*3.14)*25 : 0);
      //this.shape.x = 40;
      //if (this.shape.y > 40) {
      //  this.shape.x += Math.sin(this.rotation/180*3.14)*27;
      //}
    },

    onChange: function(key, value) {
      var label = this.label, shape = this.shape;

      switch (key) {
        case 'volume':

          if (!this.active) {
            shape.y = 130 - value * 125 / 60 - 5;
          }
          this.liquid.visible = value > 0;
          break;
        case 'color':
          this.liquid.save({color: value});
          break;
      }
    }
  });

  ENJ.CentrifugeTube = CentrifugeTube;

})();

//##############################################################################
// src/skins/TubeWithBranch.js
//##############################################################################
(function() {
  var Shape = CreateJS.Shape;
  var Bitmap = CreateJS.Bitmap;
  var Graphics = CreateJS.Graphics;

  var Skin = ENJ.Skin;
  var NumberLabel = ENJ.NumberLabel;
  var LiquidLayer = ENJ.LiquidLayer;
  var LiquidContainer = ENJ.LiquidContainer;

  /**
   * 具支试管
   * @param props
   * @constructor
   */
  function TubeWithBranch(props) {
    Skin.call(this, props);
  }

  ENJ.defineClass({
    constructor: TubeWithBranch, extend: Skin,

    register: function() {
      this.speed = 1;
    },

    ready: function(props) {
      var graphics, shape, label, liquid, body;

      graphics = new Graphics();
      graphics.beginFill('#0f0')
        .drawRect(-200, 0, 400, 200)
        /*.drawEllipse(-38, -7.5, 76, 15)*/;

      shape = new Shape(graphics);
      shape.x = 70;

      //label = new NumberLabel({ unit: 'ml' });
      //label.x = 10;

      //liquid = LiquidContainer.createLiquidLayer("烧杯液体", props.color, shape);
      liquid = new LiquidLayer({resId: '具支试管液体', mask: shape, color: props.color});// LiquidContainer.createLiquidLayer("烧杯液体", props.color, shape);
      liquid.x = 55;

      body = new Bitmap(RES.getRes("具支试管"));

      this.addChild(liquid, body);

      this.set({
        liquid: liquid,
        //label: label,
        shape: shape
      });

      this.color = props.color;
    },

    //fix: function() {
    //
    //},

    refresh: function() {
      this.shape.rotation = -this.rotation;
      //this.shape.x = 40 + (this.fixed ? Math.sin(this.rotation/180*3.14)*25 : 0);
      //this.shape.x = 40;
      //if (this.shape.y > 40) {
      //  this.shape.x += Math.sin(this.rotation/180*3.14)*27;
      //}
    },

    onChange: function(key, value) {
      var label = this.label, shape = this.shape;

      switch (key) {
        case 'volume':

          shape.y = 140 - value * 120 /100 - 5;
          this.liquid.visible = value > 0;
          //if (!this.fixed) {
          //  shape.y = 80 - value * 78 /100 - 2;
          //} else {
          //  shape.y = 38 - value * 38 /100 + 40;
          //}


          //label.y = shape.y - 10;
          //label.save({number: value});

          break;
        case 'color':
          //this.liquid = LiquidContainer.createLiquidLayer("烧杯液体", value, shape);
          //this.removeChildAt(1);
          //this.addChildAt(this.liquid, 1);
          this.liquid.save({color: value});
          break;
      }
    }
  });

  ENJ.TubeWithBranch = TubeWithBranch;

})();

//##############################################################################
// src/skins/Funnel.js
//##############################################################################
(function() {
  var Tween = CreateJS.Tween;
  var Shape = CreateJS.Shape;
  var Bitmap = CreateJS.Bitmap;
  var Graphics = CreateJS.Graphics;

  var Skin = ENJ.Skin;
  var NumberLabel = ENJ.NumberLabel;
  var LiquidLayer = ENJ.LiquidLayer;
  var LiquidContainer = ENJ.LiquidContainer;

  var base = Skin.prototype;

  /**
   * 砂芯漏斗
   * @param props
   * @constructor
   */
  function Funnel(props) {
    Skin.call(this, props);
  }

  ENJ.defineClass({
    constructor: Funnel, extend: Skin,

    register: function() {
      this.speed = 1;
    },

    ready: function(props) {
      var graphics, shape, shape2, plug, liquid, content, body, drop;

      graphics = new Graphics();
      graphics.beginFill('#0f0')
        .drawRect(-200, 0, 400, 200)
        /*.drawEllipse(-38, -7.5, 76, 15)*/;

      shape = new Shape(graphics);
      shape.x = 20;

      shape2 = new Shape(graphics);
      shape2.x = 20;
      shape2.y = 35;

      //label = new NumberLabel({ unit: 'ml' });
      //label.x = 10;

      drop = new Bitmap(RES.getRes('水滴'));

      //liquid = LiquidContainer.createLiquidLayer("烧杯液体", props.color, shape);
      liquid = new LiquidLayer({resId: '砂芯漏斗2', mask: shape, color: props.color});// LiquidContainer.createLiquidLayer("烧杯液体", props.color, shape);
      content = new LiquidLayer({resId: '砂芯漏斗2', mask: shape2, color: props.color});// LiquidContainer.createLiquidLayer("烧杯液体", props.color, shape);

      plug = new Bitmap(RES.getRes('塞子'));
      plug.x = 7;
      plug.y = 75;

      drop.x = 16;
      drop.visible = false;

      content.visible = false;

      body = new Bitmap(RES.getRes("砂芯漏斗"));

      this.addChild(content, liquid, drop, body, plug);

      this.set({
        content: content,
        liquid: liquid,
        plug: plug,
        drop: drop,
        shape: shape
      });

      this.color = props.color;
    },

    start: function() {
      base.start.call(this);

      this.drop.y = 120;
      this.drop.visible = true;

      this.tween =
        Tween.get(this.drop, {loop: true})
          .to({
            y: 180
          }, 500)
    },

    stop: function() {
      this.tween.setPaused(true);
      this.drop.visible = false;

      base.stop.call(this);
    },

    //fix: function() {
    //
    //},

    refresh: function() {
      //this.shape.rotation = -this.rotation * this.speed;
      //this.shape.x = 40 + (this.fixed ? Math.sin(this.rotation/180*3.14)*25 : 0);
      //this.shape.x = 40;
      //if (this.shape.y > 40) {
      //  this.shape.x += Math.sin(this.rotation/180*3.14)*27;
      //}
    },

    onChange: function(key, value) {
      var label = this.label, shape = this.shape;

      switch (key) {
        case 'volume':

          shape.y = 45 - value * 45 /50;
          this.liquid.visible = value > 0;
          //if (!this.fixed) {
          //  shape.y = 80 - value * 78 /100 - 2;
          //} else {
          //  shape.y = 38 - value * 38 /100 + 40;
          //}


          //label.y = shape.y - 10;
          //label.save({number: value});

          break;
        case 'display':
          this.content.visible = value;
          break;
        case 'color':
          //this.liquid = LiquidContainer.createLiquidLayer("烧杯液体", value, shape);
          //this.removeChildAt(1);
          //this.addChildAt(this.liquid, 1);
          this.liquid.save({color: value});
          break;
      }
    }
  });

  ENJ.Funnel = Funnel;

})();

//##############################################################################
// src/skins/SuckBall.js
//##############################################################################
(function() {
  var Skin = ENJ.Skin;
  var Bitmap = CreateJS.Bitmap;
  var Rectangle = CreateJS.Rectangle;
  //var ColorFilter = CreateJS.ColorFilter;

  /**
   * 吸球
   * @param props
   * @constructor
   */
  function SuckBall(props) {
    this.scale = 1;
    Skin.call(this, props);
  }

  ENJ.defineClass({
    constructor: SuckBall, extend: Skin,

    ready: function(props) {
      var ball = new Bitmap(RES.getRes('吸球'));
      var mouth = new Bitmap(RES.getRes('吸球'));


      ball.sourceRect = new Rectangle(0,36,38,30);
      mouth.sourceRect = new Rectangle(0,0,38,36);


      ball.y = 36;
      this.addChild(mouth, ball);
      //this.set({regX: 6, regY: 6});

      this.ball = ball;


    },

    onChange: function(key, value) {
      var ball = this.ball;

      switch (key) {
        case 'scale':

          ball.scaleY = value;
          break;
      }
    }

  });


  ENJ.SuckBall = SuckBall;

})();
//##############################################################################
// src/elements/SuckPipe.js
//##############################################################################
(function() {
  var Tween = CreateJS.Tween;
  var Shape = CreateJS.Shape;
  var Bitmap = CreateJS.Bitmap;
  var Graphics = CreateJS.Graphics;

  var Skin = ENJ.Skin;
  var NumberLabel = ENJ.NumberLabel;
  var LiquidLayer = ENJ.LiquidLayer;

  function SuckPipe(props) {
    Skin.call(this, props);
  }


  ENJ.defineClass({
    constructor: SuckPipe, extend: Skin,
    /**
     * @override
     */
    ready: function(props) {
      var self = this, graphics, shape, liquid, pipe;

      graphics = new Graphics();
      graphics.beginFill('#0f0').drawRect(-200, 0, 400, 240);

      shape = new Shape(graphics);
      shape.x = 8;

      liquid = new LiquidLayer({resId: '吸管液体', mask: shape, color: props.color});

      pipe = new Bitmap(RES.getRes("吸管"));

      self.addChild(liquid, pipe);

      self.set({
        shape: shape,
        liquid: liquid
      });

    },

    /**
     * @override
     */
    onChange: function(key, value) {
      var shape = this.shape;
      switch (key) {
        case 'volume':
          shape.set({
            y: 200 - value * 160 / 10
          });

          break;
        case 'color':
          this.liquid.save({color: value});
          break;
      }
    }
  });

  ENJ.SuckPipe = SuckPipe;
})();

//##############################################################################
// src/skins/PHTestPaper.js
//##############################################################################
(function() {
  var Tween = CreateJS.Tween;
  var Bitmap = CreateJS.Bitmap;
  var Sprite = CreateJS.Sprite;
  var SpriteSheet = CreateJS.SpriteSheet;

  var Skin = ENJ.Skin;


  /**
   * 烧杯
   * @param props
   * @constructor
   */
  function PHTestPaper(props) {
    Skin.call(this, props);
  }

  ENJ.defineClass({
    constructor: PHTestPaper, extend: Skin,

    ready: function(props) {
      var paper = new Bitmap(RES.getRes('PH试纸'));

      var data = {
        images: [RES.getRes("色块")],
        frames: { width: 19, height: 30 }
      };

      var sheet = new SpriteSheet(data);

      var shape = new Sprite(sheet);

      shape.visible = false;

      this.addChild(paper, shape);

      this.shape = shape;
    },


    onChange: function(key, value) {
      var shape = this.shape;

      switch (key) {
        case 'ph':

          shape.visible = value > 0;
          if (shape.visible) {
            shape.alpha = 0.5;
            shape.gotoAndStop(value*2-1);

            Tween.get(shape).to({alpha: 1.0}, 500);
          }
          break;
      }
    }
  });

  ENJ.PHTestPaper = PHTestPaper;

})();

//##############################################################################
// src/skins/PHTestPaper_2.js
//##############################################################################
(function() {
  var Tween = CreateJS.Tween;
  var Bitmap = CreateJS.Bitmap;
  var Sprite = CreateJS.Sprite;
  var SpriteSheet = CreateJS.SpriteSheet;
  var ColorFilter = CreateJS.ColorFilter;

  var Skin = ENJ.Skin;


  /**
   * 烧杯
   * @param props
   * @constructor
   */
  function PHTestPaper_2(props) {
    Skin.call(this, props);
  }

  ENJ.defineClass({
    constructor: PHTestPaper_2, extend: Skin,

    ready: function(props) {
      var paper = new Bitmap(RES.getRes('PH试纸'));
      var bounds = paper.getBounds();
      paper.filters = [new ColorFilter(1, 1, 1, 1, 1, 0, 0, 0)];
      paper.cache(0, 0 ,bounds.width, bounds.height);

      var data = {
        images: [RES.getRes("色块2")],
        frames: { width: 19, height: 30 }
      };

      var sheet = new SpriteSheet(data);

      var shape = new Sprite(sheet);

      shape.visible = false;

      this.addChild(paper, shape);

      this.shape = shape;
    },


    onChange: function(key, value) {
      var shape = this.shape;

      switch (key) {
        case 'ph':

          shape.visible = value > 0;
          if (shape.visible) {
            shape.alpha = 0.5;
            shape.gotoAndStop(value - 1);

            Tween.get(shape).to({alpha: 1.0}, 500);
          }
          break;
      }
    }
  });

  ENJ.PHTestPaper_2 = PHTestPaper_2;

})();

//##############################################################################
// src/skins/Balance.js
//##############################################################################
(function() {
  var Shape = CreateJS.Shape;
  var Bitmap = CreateJS.Bitmap;
  var Graphics = CreateJS.Graphics;

  var Skin = ENJ.Skin;
  var NumberLabel = ENJ.NumberLabel;
  var LiquidLayer = ENJ.LiquidLayer;
  var LiquidContainer = ENJ.LiquidContainer;

  /**
   * 烧杯
   * @param props
   * @constructor
   */
  function Balance(props) {
    Skin.call(this, props);
  }

  ENJ.defineClass({
    constructor: Balance, extend: Skin,

    ready: function(props) {
      this.dist = 150;

      var bar = new Bitmap(RES.getRes('天平横杆'));
      var base = new Bitmap(RES.getRes('天平底座'));
      var tray1 = new Bitmap(RES.getRes('天平托盘'));
      var tray2 = new Bitmap(RES.getRes('天平托盘'));

      this.addChild(base, tray1, tray2, bar);
      //bar.visible = false;
      bar.set({x: 150, y: 80, regX: 109, regY: 60});
      tray1.set({x: 50, regX: 50, regY: 50});
      tray2.set({x: 250, regX: 50, regY: 50});



      this.bar = bar;
      this.tray1 = tray1;
      this.tray2 = tray2;

      this.save({angle: 0});
    },


    onChange: function(key, value) {

      switch (key) {
        case 'angle':

          this.bar.rotation = value;
          this.tray1.y = this.dist * Math.sin(-value/180*Math.PI) + 80;
          this.tray2.y = this.dist * Math.sin(value/180*Math.PI) + 80;

          break;
      }
    }
  });

  ENJ.Balance = Balance;

})();

//######################################################################################################################
// src/skins/WaterBottle.js
//######################################################################################################################
(function() {
  //var Tween = CreateJS.Tween;
  //var Shape = CreateJS.Shape;
  var Bitmap = CreateJS.Bitmap;
  var Sprite = CreateJS.Sprite;
  var SpriteSheet = CreateJS.SpriteSheet;

  var Skin = ENJ.Skin;

  var base  = Skin.prototype;

  function WaterBottle(props) {
    Skin.call(this, props);
  }

  ENJ.defineClass({
    constructor: WaterBottle,
    extend: Skin,

    ready: function(props) {
      var bottle, flow;

      bottle = new Bitmap(RES.getRes("蒸馏水瓶"));

      var data = {
        images: [RES.getRes("水流")],
        frames: { width: 100, height: 80 }
      };
      var sheet = new SpriteSheet(data);

      this.flow = flow = new Sprite(sheet);
      flow.set({y: 21, scaleX: -0.75, scaleY: 0.75, rotation: -10, visible: false});
      //flow.framerate = 30;
      //flow.gotoAndPlay(0);

      this.addChild(bottle, flow);
    },

    start: function(flag, rotation) {
      base.start.call(this);

      var flow = this.flow;

      flow.visible = true;
      flow.gotoAndPlay(0);
    },

    stop: function() {
      var flow = this.flow;

      flow.visible = false;
      flow.gotoAndStop(0);

      base.stop.call(this);
    },

    onChange: function(key, val, old) {

    }
  });

  ENJ.WaterBottle = WaterBottle;

})();

//##############################################################################
// src/skins/EvaporatingDish.js
//##############################################################################
(function() {

  var ColorFilter = CreateJS.ColorFilter;
  var Bitmap = CreateJS.Bitmap;

  var Skin = ENJ.Skin;

  var base = Skin.prototype;

  /**
   * 砂芯漏斗
   * @param props
   * @constructor
   */
  function EvaporatingDish(props) {
    Skin.call(this, props);
  }

  ENJ.defineClass({
    constructor: EvaporatingDish, extend: Skin,


    ready: function(props) {

      //label = new NumberLabel({ unit: 'ml' });
      //label.x = 10;

      var body = new Bitmap(RES.getRes('蒸发皿'));

      var liquid = new Bitmap(RES.getRes("蒸发皿流出液"));

      this.addChild(body, liquid);

      liquid.visible = false;
      liquid.x = -5;
      liquid.y = 5;

      this.set({
        liquid: liquid
      });
    },

    start: function() {
      base.start.call(this);
      this.liquid.visible = true;
    },

    stop: function() {
      this.liquid.visible = false;
      base.stop.call(this);
    },

    onChange: function(key, value) {
      var liquid = this.liquid;
      switch (key) {
        case 'color':
          var am = ((value >> 24) & 0xff) / 255;
          var rm = ((value >> 16) & 0xff) / 255;
          var gm = ((value >> 8)  & 0xff) / 255;
          var bm = (value & 0xff) / 255;
          var bounds = liquid.getBounds();
          liquid.filters = [new ColorFilter(rm,gm,bm,am)];
          liquid.cache(0, 0, bounds.width, bounds.height);

          break;
      }
    }
  });

  ENJ.EvaporatingDish = EvaporatingDish;

})();

//##############################################################################
// src/elements/Pipet.js
//##############################################################################
(function() {
  var Tween = CreateJS.Tween;
  var Shape = CreateJS.Shape;
  var Bitmap = CreateJS.Bitmap;
  var Graphics = CreateJS.Graphics;

  var Skin = ENJ.Skin;
  var NumberLabel = ENJ.NumberLabel;
  var LiquidLayer = ENJ.LiquidLayer;

  function Pipet(props) {
    Skin.call(this, props);
  }


  ENJ.defineClass({
    constructor: Pipet, extend: Skin,
    /**
     * @override
     */
    ready: function(props) {
      var self = this, graphics, shape, label, liquid, pipe;

      graphics = new Graphics();
      graphics.beginFill('#0f0').drawRect(-200, 0, 400, 240);

      shape = new Shape(graphics);
      shape.x = 8;

      label = new NumberLabel({unit: ' ml', digits: 1});
      label.visible = false;
      label.x = 10;

      liquid = new LiquidLayer({resId: '移液管液体', mask: shape, color: props.color});

      pipe = new Bitmap(RES.getRes("移液管"));

      self.addChild(liquid, pipe, label);

      self.set({
        label: label,
        shape: shape,
        liquid: liquid/*,
        ratio: this.store('ratio') || 1*/
      });

    },

    /**
     * @override
     */
    onChange: function(key, value) {
      var label = this.label, shape = this.shape;
      switch (key) {
        case 'volume':
          //this.shape.y = 240 - value * 240 / 8 + 16;
          shape.set({
            y: 240 - value * 240 / 8 + 60,
            scaleY: value / 8
          });

          label.save({'number': value});
          //label.store('num', value * this.ratio);
          label.y = shape.y - 10;
          break;
        case 'display':
          if (value) {
            label.visible = true;
            Tween.get(label)
              .to({alpha: 1.0}, 500);
          } else {
            Tween.get(label)
              .to({alpha: 0.0}, 500)
              .call(function() {
                label.visible = false;
              });
          }
          break;
        case 'color':
          //this.liquid = LiquidContainer.createLiquidLayer("烧杯液体", value, shape);
          //this.removeChildAt(1);
          //this.addChildAt(this.liquid, 1);
          this.liquid.save({color: value});
          break;
      }
    }
  });

  ENJ.Pipet = Pipet;
})();

//##############################################################################
// src/elements/Cuvette.js
//##############################################################################
(function() {
  var Tween = CreateJS.Tween;
  var Shape = CreateJS.Shape;
  var Bitmap = CreateJS.Bitmap;
  var Graphics = CreateJS.Graphics;

  var Skin = ENJ.Skin;
  var NumberLabel = ENJ.NumberLabel;
  //var LiquidContainer = ENJ.LiquidContainer;
  var LiquidLayer = ENJ.LiquidLayer;

  /**
   * @param props
   * @constructor
   */
  function Cuvette(props) {
    Skin.call(this, props);
  }

  ENJ.defineClass({
    /**
     *
     * @class Cuvette
     * @extends LiquidContainer
     *
     * @constructor
     */
    constructor: Cuvette, extend: Skin,
    /**
     * @override
     */
    ready: function(props) {
      var graphics, shape, liquid, body;

      graphics = new Graphics();
      graphics.beginFill('#0f0').drawRect(-300, 0, 600, 400);

      shape = new Shape(graphics);
      shape.x = 9;

      liquid = new LiquidLayer({resId: '比色皿液体', mask: shape, color: props.color});//LiquidContainer.createLiquidLayer("量筒液体", props.color, shape);
      body = new Bitmap(RES.getRes("比色皿"));

      //var label = new NumberLabel({unit: ' ml', digits: 1});
      //label.visible = false;
      //label.x = 50;

      this.addChild(liquid, body);

      this.liquid = liquid;
      this.shape = shape;

      //this.store('volume', 5);
      //this.onChange('volume', props.volume);
    },

    refresh: function() {
      this.shape.rotation = -this.rotation;
      this.liquid.visible = this.rotation < 90;
    },

    //toggle: function(duration) {
    //  duration = duration || 500;
    //
    //  var label = this.label;
    //  if (label.visible) {
    //    Tween.get(label).to({
    //      alpha: 0
    //    }, duration).call(function() {
    //      label.visible = false;
    //    });
    //  } else {
    //    label.visible = true;
    //    Tween.get(label).to({
    //      alpha: 1.0
    //    }, duration);
    //  }
    //},
    /**
     * @override
     */
    onChange: function(key, value) {

      switch (key) {
        case 'volume':
          this.shape.y = 50 - value * 45 / 2.5 - 2;
          //this.label.save({number: value});
          //this.label.y = this.shape.y - 10;
          this.liquid.visible = value > 0;
          break;
      }
    }
  });

  ENJ.Cuvette = Cuvette;

})();
///##############################################################################
// src/elements/VolumetricFlask.js
//##############################################################################
(function() {
  var Tween = CreateJS.Tween;
  var Shape = CreateJS.Shape;
  var Bitmap = CreateJS.Bitmap;
  var Graphics = CreateJS.Graphics;

  var Skin = ENJ.Skin;
  var LiquidLayer = ENJ.LiquidLayer;

  var base = Skin.prototype;

  function VolumetricFlask(props) {
    Skin.call(this, props);
  }

  ENJ.defineClass({
    /**
     *
     * @class VolumetricFlask
     * @extends LiquidContainer
     *
     * @constructor
     */
    constructor: VolumetricFlask, extend: Skin,
    /**
     * @override
     */
    ready: function(props) {
      var self = this, graphics, bounds, shape, liquid, bottle, cap;

      graphics = new Graphics();
      graphics.beginFill('#0f0').drawRect(-200, 0, 400, 400);

      shape = new Shape(graphics);
      shape.x = 63;
      //shape.y = 50;


      liquid = new LiquidLayer({resId: '容量瓶液体', mask: shape, color: props.color});

      bottle = new Bitmap(RES.getRes("容量瓶"));

      cap = new Bitmap(RES.getRes("容量瓶盖"));

      if (props.dark) {
        bottle.filters = [new CreateJS.ColorFilter(0.5,0.25,0,1)];
        bounds = bottle.getBounds();
        bottle.cache(0, 0, bounds.width, bounds.height);

        cap.filters = [new CreateJS.ColorFilter(0.5,0.25,0,1)];
        bounds = cap.getBounds();
        cap.cache(0, 0, bounds.width, bounds.height);
      }

      cap.set({ x: 22, y: -20 });

      self.addChild(liquid, bottle, cap);

      self.set({
        cap: cap,
        //label: label,
        //level: level,
        shape: shape
      });

    },

    /**
     * @override
     */
    onChange: function(key, value) {
      var shape = this.shape;//, level = this.level;
      switch (key) {
        case 'volume':
          //shape.y = 130 - value / 100 * 100 - 2;
          if (value < 80) {
            shape.y = 130 - value * value / 6400 * 100 - 2;
          } else {
            shape.y = 130 - (value - 80) * 60 / 20 - 2;
          }

          break;
      }
    },

    /**
     * @override
     */
    start: function() {
      base.start.call(this);
      Tween.get(this.cap).to({
        x: 0, y: -60, rotation: -30, alpha: 0
      }, 250);
    },

    /**
     * @override
     */
    stop: function() {
      base.stop.call(this);
      Tween.get(this.cap).to({
        x: 22, y: -20, rotation: 0, alpha: 1.0
      }, 250);
    },

    /**
     * @override
     */
    refresh: function() {

      this.shape.rotation = -this.rotation;

    }
  });

  ENJ.VolumetricFlask = VolumetricFlask;

})();

//##############################################################################
// src/elements/Capillary.js
//##############################################################################
(function() {
  var Tween = CreateJS.Tween;
  var Shape = CreateJS.Shape;
  var Bitmap = CreateJS.Bitmap;
  var Graphics = CreateJS.Graphics;

  var Skin = ENJ.Skin;
  var LiquidLayer = ENJ.LiquidLayer;

  /**
   * @param props
   * @constructor
   */
  function Capillary(props) {
    Skin.call(this, props);
  }

  ENJ.defineClass({
    /**
     *
     * @class Capillary
     * @extends LiquidContainer
     *
     * @constructor
     */
    constructor: Capillary, extend: Skin,
    /**
     * @override
     */
    ready: function(props) {
      var liquid, body;

      //body = new Bitmap(RES.getRes("毛细管"));
      body = new Shape();
      body.alpha = 0.25;
      body.graphics
        .beginStroke('#111')
        .setStrokeStyle(1)
        .moveTo(0,0)
        .lineTo(0,100)
        .endStroke()
        .beginStroke('#eee')
        .setStrokeStyle(1)
        .moveTo(1,0)
        .lineTo(1,100)
        .endStroke();


      liquid = new Shape();
      liquid.alpha = 0.5;
      //liquid.x = 1;

      this.addChild(body, liquid);

      this.liquid = liquid;
    },

    refresh: function() {

    },

    onChange: function(key, value) {

      switch (key) {
        case 'volume':
          //var bounds = this.getBounds();
          this.liquid.graphics
            .clear()
            .beginStroke(this.color)
            .moveTo(0, 100)
            .lineTo(0, 100 - value * 20)
            .endStroke();
          break;
      }
    }
  });

  ENJ.Capillary = Capillary;

})();
//######################################################################################################################
// src/skins/Centrifuge.js
//######################################################################################################################
(function() {
  var Skin = ENJ.Skin;
  var DigitalDisplay = ENJ.DigitalDisplay;

  var base = Skin.prototype;

  function Centrifuge(props) {
    Skin.call(this, props);
  }

  ENJ.defineClass({
    constructor: Centrifuge,
    extend: Skin,

    register: function() {
      base.register.call(this);
      this.number = 0;
    },

    ready: function(props) {
      var dot = new CreateJS.Shape();
      dot.graphics.beginFill('#f00').drawCircle(0,0,2);
      dot.visible = false;

      var data = {
        images: [RES.getRes("离心机")],
        frames: { width: 399, height: 477 },
        animations: {
          close: 1, open: 0
        }
      };

      var sheet = new CreateJS.SpriteSheet(data);

      var body = new CreateJS.Sprite(sheet);

      var digitalDisplay = new DigitalDisplay({number:0, maxLength: 5});
      digitalDisplay.set({
        x: 175, y: 315, scaleX: 0.5, scaleY: 0.5, visible: false
      });

      this.addChild(
        body, digitalDisplay, dot
      );

      this.dot = dot;
      this.body = body;
      this.digitalDisplay = digitalDisplay;
    },

    onChange: function(key, val, old) {
      if (key === 'number') {
        this.digitalDisplay.save({number: this.number});
      } else if (key === 'mode') {
        switch (val) {
          case 0:
            this.dot.visible = false;
            this.digitalDisplay.visible = false;
            break;
          case 1:
            this.dot.x = 134;
            this.dot.y = 312;
            this.dot.visible = true;
            this.digitalDisplay.visible = true;
            break;
          case 2:
            this.dot.x = 132;
            this.dot.y = 325;
            this.dot.visible = true;
            this.digitalDisplay.visible = true;
            break;
        }
      } else if (key === 'open') {
        this.body.gotoAndStop(val ? 'open' : 'close');
      }
    }
  });

  ENJ.Centrifuge = Centrifuge;
})();

//##############################################################################
// src/elements/ChromatographyPaper.js
//##############################################################################
(function() {
  var Tween = CreateJS.Tween;
  var Shape = CreateJS.Shape;

  var Skin = ENJ.Skin;

  /**
   * @param props
   * @constructor
   */
  function ChromatographyPaper(props) {
    Skin.call(this, props);
  }

  ENJ.defineClass({
    /**
     *
     * @class ChromatographyPaper
     * @extends LiquidContainer
     *
     * @constructor
     */
    constructor: ChromatographyPaper, extend: Skin,
    /**
     * @override
     */
    ready: function(props) {


      var shape = new Shape(/*graphics*/);
      shape.snapToPixel = false;

      var dots = [new Shape(), new Shape()];
      dots[0].alpha = 0;
      dots[1].alpha = 0;
      for (var i = 0; i < dots.length; ++i) {
        dots[i].alpha = 0;
        dots[i].graphics
          .beginFill('#ffff00')
          .drawCircle(0,0,2)
          .endFill();
      }

      this.addChild(shape, dots[0], dots[1]);

      this.shape = shape;
      this.amount = 0;
      this.index = 0;
      this.dots = dots;

      //this.store('volume', 5);
      //this.onChange('volume', props.volume);
    },

    refresh: function() {

    },

    onChange: function(key, value) {
      if (key === 'dxy') {
        var dx = value[0], dy = value[1];

        var dx1 = Math.floor((0 - dx) * 60 / 400 + dx);
        var dy1 = Math.floor((400 - dy) * 60 / 400 + dy);

        var dx2 = Math.floor((dx) * 40 / 400);
        var dy2 = Math.floor((dy - 400) * 40 / 400 + 400);

        this.shape.graphics
          .clear()
          .beginFill('#fff')
          .moveTo(dx, dy)
          .lineTo(200 - dx, dy)
          .lineTo(200, 400)
          .lineTo(0, 400)
          .endFill()
          .beginStroke('#222')
          //.setStrokeStyle(1)
          .moveTo(dx1, dy1)
          .lineTo(200 - dx1, dy1)
          .moveTo(dx2, dy2-1)
          .lineTo(200 - dx2, dy2-1)
          .moveTo(dx2 + 20, dy2 - 5)
          .lineTo(dx2 + 20, dy2 + 5)
          .moveTo(180 - dx2, dy2 - 5)
          .lineTo(180 - dx2, dy2 + 5)
          .endStroke();

        this.dots[0].x = dx2 + 20;
        this.dots[0].y = dy2;
        this.dots[1].x = 180 - dx2;
        this.dots[1].y = dy2;

      } else if (key === 'amount') {
        this.dots[this.index].alpha = value;
      } else if (key === 'index') {
        this.index = value;
        this.amount = 0;
      }

    }
  });

  ENJ.ChromatographyPaper = ChromatographyPaper;

})();
//##############################################################################
// src/skins/ClipWithRope.js
//##############################################################################
(function() {
  var Shape = CreateJS.Shape;
  var Bitmap = CreateJS.Bitmap;
  var Graphics = CreateJS.Graphics;

  var Skin = ENJ.Skin;


  function ClipWithRope(props) {
    Skin.call(this, props);
  }

  ENJ.defineClass({
    constructor: ClipWithRope, extend: Skin,

    register: function() {
      this.speed = 1;
    },

    ready: function(props) {
      var rope, clip;

      rope = new Shape();

      clip = new Bitmap(RES.getRes("夹子"));

      this.addChild(rope, clip);

      this.set({
        clip: clip,
        rope: rope
      });

      this.color = props.color;
    },

    update: function(x1, y1, x2, y2) {
      var dist = Math.sqrt((x2 - x1)*(x2 - x1) + (y2 - y1)*(y2 - y1));

      this.x = x1;
      this.y = y1;
      this.rope.graphics
        .clear()
        .beginStroke('#888')
        .setStrokeStyle(2, 1, 1)
        .moveTo(20,-20)
        .lineTo(15, 5)
        .lineTo(25, 5)
        .lineTo(20,-20)
        .lineTo(x2 - x1, y2 - y1)
        .lineTo(x2 - x1, y2 - y1 + 300 - dist)
        .endStroke()
    }
  });

  ENJ.ClipWithRope = ClipWithRope;

})();

//######################################################################################################################
// src/skins/Reporter_10.js
//######################################################################################################################
(function() {
  var Text = CreateJS.Text;
  var Bitmap = CreateJS.Bitmap;
  //var Graphics = CreateJS.Graphics;

  var Skin = ENJ.Skin;

  function Reporter_10(props) {
    Skin.call(this, props);
  }

  ENJ.defineClass({
    constructor: Reporter_10,
    extend: Skin,

    ready: function() {
      var bg = new Bitmap(RES.getRes('结果报告'));
      var button = new Bitmap(RES.getRes('关闭按钮'));

      var i, AList = [], YList = [];

      for (i = 0; i < 7; ++i) {
        AList.push(new Text('', '12px Arial', '#000000'));
        YList.push(new Text('', '12px Arial', '#000000'));

        AList[i].set({x: 180 + i * 60, y: 105, textAlign: 'center'});
        YList[i].set({x: 180 + i * 60, y: 130, textAlign: 'center'});
      }

      var XField = new Text('', '12px Arial', '#000000');
      XField.set({x: 360, y: 155, textAlign: 'center'});

      button.set({regX: 18, regY: 18, x: 585, y: 10, cursor: 'pointer'});

      this.addChild(bg);
      this.addChild(button);
      this.addChild(XField);
      this.addChild.apply(this, AList);
      this.addChild.apply(this, YList);

      this.AList = AList;
      this.YList = YList;
      this.XField = XField;

      var self = this;

      button.addEventListener('mousedown', function() {
        button.set({scaleX: 0.8, scaleY: 0.8});
      });

      button.addEventListener('pressup', function() {
        button.set({scaleX: 1.0, scaleY: 1.0});
        self.dispatchEvent('close');
});
    },

    onChange: function(key, val, old) {
      var index;
      if (/Y\d/.test(key)) {
        index = Number(key.slice(1)) - 1;
        this.YList[index].text = val;
      } else if (/A\d/.test(key)) {
        index = Number(key.slice(1)) - 1;
        this.AList[index].text = val;
      } else if (key === 'X') {
        this.XField.text = val;
      }
    }
  });

  ENJ.Reporter_10 = Reporter_10;
})();

//######################################################################################################################
// src/skins/SugarBallsBottle.js
//######################################################################################################################
(function() {
  var Tween = CreateJS.Tween;
  var Bitmap = CreateJS.Bitmap;
  var Container = CreateJS.Container;
  var ColorFilter = CreateJS.ColorFilter;

  var   b2Vec2 = Box2D.Common.Math.b2Vec2
    ,	b2BodyDef = Box2D.Dynamics.b2BodyDef
    ,	b2Body = Box2D.Dynamics.b2Body
    ,	b2FixtureDef = Box2D.Dynamics.b2FixtureDef
    ,	b2Fixture = Box2D.Dynamics.b2Fixture
    ,	b2World = Box2D.Dynamics.b2World
    , b2RevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef
    ,	b2MassData = Box2D.Collision.Shapes.b2MassData
    ,	b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
    ,	b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
    ,	b2DebugDraw = Box2D.Dynamics.b2DebugDraw;

  var Skin = ENJ.Skin;

  var base  = Skin.prototype;

  function SugarBallsBottle(props) {
    Skin.call(this, props);
  }

  ENJ.defineClass({
    constructor: SugarBallsBottle,
    extend: Skin,

    register: function() {
      this.angle = 3.14/2;
    },

    ready: function(props) {
      var world, shape, fixDef, bodyDef;

      world = new b2World(
        new b2Vec2(0, 10)    //gravity
        ,  false                 //allow sleep
      );

      bodyDef = new b2BodyDef();
      fixDef = new b2FixtureDef();

      fixDef.density = 1.0;
      fixDef.friction = 0.5;
      fixDef.restitution = 0.2;

      //
      shape = new b2PolygonShape();
      shape.SetAsBox(10/30, 10/30);

      fixDef.shape = shape;

      bodyDef.type = b2Body.b2_staticBody;
      bodyDef.position.x = 0;
      bodyDef.position.y = 0;

      var anchor1 = world.CreateBody(bodyDef);
      anchor1.CreateFixture(fixDef);

      bodyDef.position.x = 0;
      bodyDef.position.y = 110/30;

      var anchor2 = world.CreateBody(bodyDef);
      anchor2.CreateFixture(fixDef);

      //
      shape = new b2PolygonShape();

      fixDef.shape = shape;

      bodyDef.type = b2Body.b2_dynamicBody;
      bodyDef.position.x = 0;
      bodyDef.position.y = 0;
      //fixDef.shape = new b2PolygonShape();

      var box = world.CreateBody(bodyDef);

      shape.SetAsOrientedBox(6/30, 55/30, new b2Vec2(0, 55/30), 0);
      box.CreateFixture(fixDef);
      shape.SetAsOrientedBox(6/30, 55/30, new b2Vec2(64/30, 55/30), 0);
      box.CreateFixture(fixDef);
      shape.SetAsOrientedBox(32/30, 6/30, new b2Vec2(32/30, 20/30), 0);
      box.CreateFixture(fixDef);
      shape.SetAsOrientedBox(32/30, 6/30, new b2Vec2(32/30, 110/30), 0);
      box.CreateFixture(fixDef);

      //
      var joint1 = new b2RevoluteJointDef();
      joint1.bodyA = box;
      joint1.bodyB = anchor1;
      joint1.localAnchorA = new b2Vec2(0,0);//anchor.GetWorldCenter();
      joint1.localAnchorB = new b2Vec2(0,0);
      world.CreateJoint(joint1);

      var joint2 = new b2RevoluteJointDef();
      joint2.bodyA = box;
      joint2.bodyB = anchor2;
      joint2.localAnchorA = new b2Vec2(0,110/30);//anchor.GetWorldCenter();
      joint2.localAnchorB = new b2Vec2(0,0);
      world.CreateJoint(joint2);

      //
      shape = new b2CircleShape(5/30);
      fixDef.shape = shape;

      for (var i = 0; i < 30; ++i) {
        //var skin = new Bitmap(RES.getRes('糖球'));
        //skin.filters = [new ColorFilter(1, 1 ,0.6)];
        //skin.cache(0,0,12,12);
        //skin.set({regX: 8, regY: 8});
        var skin = new ENJ.SugarBall({factors: [1,0.6,1]});

        this.addChild(skin);

        bodyDef.position.x = (Math.random() * 45 + 5) / 30;
        bodyDef.position.y = (Math.random() * 70 + 20) / 30;
        bodyDef.userData = {type: 0, skin: skin};

        var ball = world.CreateBody(bodyDef);

        ball.CreateFixture(fixDef);
      }


      this.world = world;
      this.anchor2 = anchor2;

      if (props.context2d) {
        this.setupDebugDraw(props.context2d);
      }


      var cap = new Bitmap(RES.getRes('广口瓶瓶塞'));
      var body = new Bitmap(RES.getRes('广口瓶瓶身'));

      var location = {x: 9, y: -12};

      cap.set(location);
      cap.location = location;

      this.addChild(cap, body);

      this.cap = cap;
      this.body = body;
    },

    setupDebugDraw: function(context2d) {
      var debugDraw = new b2DebugDraw();
      debugDraw.SetSprite(context2d);
      debugDraw.SetDrawScale(30.0);
      debugDraw.SetFillAlpha(0.3);
      debugDraw.SetLineThickness(1.0);
      debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
      this.world.SetDebugDraw(debugDraw);
    },

    release: function() {
      base.release.call(this);

      var world = this.world;

      for (var body = world.GetBodyList(); body; body = body.GetNext()) {
        world.DestroyBody(body);
      }

    },

    refresh:function() {
      //if (!this.active) { return; }

      var world = this.world;



      if (this.rotating && (this.wise ? this.angle < this.targetAngle : this.angle > this.targetAngle)) {
        this.angle += this.wise ? 0.015 : -0.015;
        this.anchor2.SetPositionAndAngle(new b2Vec2((110*Math.cos(this.angle))/30,(110*Math.sin(this.angle))/30),0);
        this.body.rotation = this.angle/3.14*180-90+1;
      } else {
        this.rotating = false;

      }

      world.Step(
        1 / 60   //frame-rate
        ,  10       //velocity iterations
        ,  10       //position iterations
      );
      world.DrawDebugData();
      world.ClearForces();


      for (var body = world.GetBodyList(); body; body = body.GetNext()) {
        var data = body.GetUserData();
        if (data && data.type === 0) {
          var pos = body.GetPosition();
          //pos = this.globalToLocal(pos.x * 30+this.x, pos.y * 30+this.y);
          data.skin.set({x: pos.x * 30, y: pos.y * 30});
        }
      }
    },

    start: function() {
      base.start.call(this);
      Tween.get(this.cap).to({
        x: -30, y: -30, alpha: 0, rotation: -60
      }, 1000);
    },

    stop: function() {
      var cap = this.cap;
      Tween.get(cap).to({
        x: cap.location.x, y: cap.location.y, alpha: 1.0, rotation: 0
      }, 1000);

      base.stop.call(this);
    },

    rotateTo: function(targetRotation) {
      this.rotating = true;
      //this.angle = (this.angle+90)/180*3.14;
      this.targetAngle = (targetRotation + 90)/180*3.14;

      this.wise = (this.targetAngle - this.angle) > 0;
    }
  });

  ENJ.SugarBallsBottle = SugarBallsBottle;

})();

//######################################################################################################################
// src/scenes/Scene.js
//######################################################################################################################
(function() {
  var Point = CreateJS.Point;
  var Container = CreateJS.Container;

  function Scene() {
    Container.call(this);

    this.register();

    this.ready();
  }

  ENJ.defineClass({
    constructor: Scene,
    extend: Container,

    register: function() {},

    ready: function() {},

    refresh: function() {},

    release: function() {
      this.removeAllEventListeners();
    },

    place: function(child, location, index) {
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
    }
  });

  ENJ.Scene = Scene;
})();

//######################################################################################################################
// src/scenes/Scene_10_1.js
//######################################################################################################################
(function() {
  var ColorFilter = CreateJS.ColorFilter;
  var Container = CreateJS.Container;
  var Bitmap = CreateJS.Bitmap;
  var Point = CreateJS.Point;
  var Tween = CreateJS.Tween;
  var Scene = ENJ.Scene;

  function Scene_10_1() {
    Scene.call(this);
  }

  ENJ.defineClass({
    constructor: Scene_10_1,
    extend: Scene,

    start: function() {
      this.active = true;
    },

    stop: function() {
      this.active = false;
    },

    //register: function() {},

    ready: function() {
      var bg = new Bitmap(RES.getRes("背景"));
      bg.set({x: -100, y: -100});
      //var digitDisplay = new CreateJS.BitmapText('-12.138', sheet);
      //digitDisplay.letterSpacing = 2;
      var ladle = new Bitmap(RES.getRes('药勺'));
      ladle.set({regX: 7, regY: 150, visible: false});

      var weightingPaper = new ENJ.WeightingPaper();

      var platformScale = new ENJ.PlatformScale();
      //var inductionCooker = new ENJ.InductionCooker();
      //var spectrophotometer = new ENJ.Spectrophotometer();
      //var thermometer = new ENJ.Thermometer();
      var sugarBallsBottle = new ENJ.SugarBallsBottle({context2d: document.getElementById('debug').getContext('2d')});

      //var wildMouthBottle = new ENJ.WildMouthBottle({content: sugarBallsContainer});

      var sugarBalls = [new ENJ.SugarBall({factors: [1,0.6,1]}), new ENJ.SugarBall({factors: [1,0.6,1]})];
      sugarBalls[0].visible = false;
      sugarBalls[1].visible = false;


      this.ladle = ladle;
      this.sugarBalls = sugarBalls;
      this.platformScale = platformScale;
      this.weightingPaper = weightingPaper;
      this.sugarBallsBottle = sugarBallsBottle;

      //sugarBallsBottle.set({scaleX: 0.8, scaleY: 0.8});

      //this.createBox2dWorld(container);


      this.addChild(
        bg, platformScale, weightingPaper, ladle, sugarBalls[0], sugarBalls[1], sugarBallsBottle//, sugarBallsContainer
      );

      weightingPaper.set({x: 520, y: 300});
      platformScale.set({x: 500, y: 300});
      this.place(sugarBallsBottle, {x: 300, y: 300});

      var self = this;
      //this.addEventListener('click', function() {
      //  //thermometer.save({temperature: Math.random()*100});
      //  //spectrophotometer.save({luminosity: Math.random()});
      //  //spectrophotometer.save({grade: grade});
      //  //grade = (grade+1)%4;
      //  self.animating = true;
      //  if (sugarBallsBottle.active) {
      //    sugarBallsBottle.stop();
      //    sugarBallsBottle.rotateTo(0);
      //    //Tween.get(SugarBallsBottle).to({rotation: 0}, 500).call(function(){
      //    //  self.animating = false;
      //    //});
      //  } else {
      //    sugarBallsBottle.start();
      //    sugarBallsBottle.rotateTo(60);
      //    //Tween.get(SugarBallsBottle).to({rotation: 60}, 500).call(function(){
      //    //  self.animating = false;
      //    //});
      //  }
      //});

      //this.addChild(new ENJ.Beaker({volume: 30, color: 0x66006666}));

      this.addEventListener('tick', this.refresh.bind(this));
    },

    createSugarBall: function(rm, gm, bm) {
      var ball = new Bitmap(RES.getRes('糖球'));

      ball.filters = [new ColorFilter(1, rm ,gm, bm)];
      ball.cache(0,0,12,12);

      return ball;
    },

    release: function() {
      Scene.prototype.release.call(this);

      this.sugarBallsBottle.release();
    },


    refresh: function() {
      var   b2Vec2 = Box2D.Common.Math.b2Vec2;

      this.sugarBallsBottle.refresh();



    }
  });

  ENJ.Scene_10_1 = Scene_10_1;
})();

//######################################################################################################################
// src/scenes/Scene_10_2.js
//######################################################################################################################
(function() {
  var ColorFilter = CreateJS.ColorFilter;
  var Container = CreateJS.Container;
  var Bitmap = CreateJS.Bitmap;
  var Point = CreateJS.Point;
  var Tween = CreateJS.Tween;
  var Scene = ENJ.Scene;

  function Scene_10_2() {
    Scene.call(this);
  }

  ENJ.defineClass({
    constructor: Scene_10_2,
    extend: Scene,

    start: function() {
      this.active = true;
    },

    stop: function() {
      this.active = false;
    },

    //register: function() {},

    ready: function() {
      var bg = new Bitmap(RES.getRes("背景"));
      bg.set({x: -100, y: -100});
      //var digitDisplay = new CreateJS.BitmapText('-12.138', sheet);
      //digitDisplay.letterSpacing = 2;
      var ladle = new Bitmap(RES.getRes('药勺'));
      ladle.set({regX: 7, regY: 150, visible: true});

      var chopsticks = this.createChopsticks();
      chopsticks.set({regX: 10, regY: 150, visible: true});



      var cylinder = new ENJ.Cylinder({volume: 0, color: 0x22ffffff});

      var weightingPaper = new ENJ.WeightingPaper();
      for (var i = 0; i < 8; ++i) {
        var ball = new ENJ.SugarBall({factors: [1,0.6,1]});//this.createSugarBall(1, 0.6, 1);
        ball.x = Math.random()*40+50;
        ball.y = Math.random()*5+15;
        weightingPaper.addSome(ball);
      }

      //var wildMouthBottle = new ENJ.WildMouthBottle({content: sugarBallsContainer});

      //var sugarBalls = [this.createSugarBall(1, 0.6, 1), this.createSugarBall(1, 0.6, 1)];
      //sugarBalls[0].visible = false;
      //sugarBalls[1].visible = false;

      var beakers = [new ENJ.Beaker({volume: 0, color: 0x22ffffff}), new ENJ.Beaker({volume: 0, color: 0x22ffffff})];
      beakers[0].set({regX: 40, regY: 20});
      beakers[1].set({regX: 40, regY: 20});

      var bigBeaker = new ENJ.BigBeaker({volume: 200, color: 0x22ffffff});
      //bigBeaker.set({scaleX: -2, scaleY: 2});


      this.ladle = ladle;
      this.chopsticks = chopsticks;
      this.cylinder = cylinder;
      this.beakers = beakers;
      this.bigBeaker = bigBeaker;
      //this.sugarBalls = sugarBalls;
      this.weightingPaper = weightingPaper;


      this.addChild(
        bg,  weightingPaper, ladle, chopsticks, cylinder,
        /*sugarBalls[0], sugarBalls[1], */beakers[0], beakers[1], bigBeaker
      );

      ladle.set({x: 420, y: 400});
      //cylinder.set({x: 600, y: 200});
      ladle.rotation = 90;
      chopsticks.rotation = 87;
      weightingPaper.set({x: 400, y: 400});
      this.place(ladle, new Point(650, 450));
      this.place(chopsticks, new Point(650, 430));
      this.place(cylinder, new Point(600, 200));
      this.place(bigBeaker, new Point(700, 250));
      this.place(beakers[0], new Point(340, 370));
      this.place(beakers[1], new Point(240, 370));
      //beakers[0].set({x: 300, y: 350});
      //beakers[1].set({x: 200, y: 350});


      //this.addChild(new ENJ.Beaker({volume: 30, color: 0x66006666}));

      //this.addEventListener('tick', this.refresh.bind(this));
    },

    createChopsticks: function() {
      var chopsticks = new Container();

      var bar1 = new Bitmap(RES.getRes('玻璃棒'));
      var bar2 = new Bitmap(RES.getRes('玻璃棒'));

      bar1.set({rotation: -1});
      bar2.set({x: 6, y: 0});

      chopsticks.addChild(bar1, bar2);
      chopsticks.cache(0,0,10,200);

      return chopsticks;
    },

    createSugarBall: function(rm, gm, bm) {
      var ball = new Bitmap(RES.getRes('糖球'));

      ball.filters = [new ColorFilter(1, rm ,gm, bm)];
      ball.cache(0,0,12,12);

      return ball;
    },

    release: function() {
      Scene.prototype.release.call(this);

    },


    refresh: function() {




    }
  });

  ENJ.Scene_10_2 = Scene_10_2;
})();

//######################################################################################################################
// src/scenes/Scene_10_3.js
//######################################################################################################################
(function() {
  var ColorFilter = CreateJS.ColorFilter;
  var Container = CreateJS.Container;
  var Bitmap = CreateJS.Bitmap;
  var Shape = CreateJS.Shape;
  var Point = CreateJS.Point;
  var Tween = CreateJS.Tween;
  var Scene = ENJ.Scene;

  function Scene_10_3() {
    Scene.call(this);
  }

  ENJ.defineClass({
    constructor: Scene_10_3,
    extend: Scene,

    start: function() {
      this.active = true;
    },

    stop: function() {
      this.active = false;
    },

    //register: function() {},

    ready: function() {
      var bg = new Bitmap(RES.getRes("背景"));

      var circle = new Shape();
      circle.graphics.beginFill('#0f0').drawEllipse(0,0,50,20);
      circle.set({regX: 25, regY: 10});

      var bar = new Bitmap(RES.getRes('玻璃棒'));
      var ladle = new Bitmap(RES.getRes('药勺'));
      var paper = new Bitmap(RES.getRes('称量纸平摊'));
      var paper2 = new Bitmap(RES.getRes('称量纸对折'));
      var powder = new Bitmap(RES.getRes('一勺粉末'));
      var powder2 = new Bitmap(RES.getRes('聚酰胺粉称量纸上'));
      var colorCard = new Bitmap(RES.getRes('比色卡'));
      var beaker = new ENJ.Beaker({volume: 60, color: 0xccffffff});
      var bottle = new ENJ.NarrowMouthBottle({volume: 50, color: 0x22ffffff, label: '柠檬酸'});
      var dropper = new ENJ.Dropper();
      var thermometer = new ENJ.Thermometer({temperature: 0});
      var inductionCooker = new ENJ.InductionCooker();
      var platformScale = new ENJ.PlatformScale({weight: 0});
      var powderBottle = new ENJ.PowderBottle();
      var phTestPaper = new ENJ.PHTestPaper();


      bg.set({x: -100, y: -100});
      bar.set({x: 255, y: 200, rotation: -10});
      paper.set({x: 630, y: 300});
      paper2.visible = false;
      powder.set({rotation: -30, visible: false});
      powder2.set({x: 680, y: 310});
      circle.set({x:700, y: 320, scaleX: 0, scaleY: 0});
      colorCard.set({x:400, y: 0, visible: false});
      //colorCard.visible = false;
      phTestPaper.visible = false;
      //circle.set({scaleX: 0, scaleY: 0});
      ladle.set({regX: 7, regY: 130, visible: false});
      beaker.set({x: 265, y: 285});
      bottle.set({x: 100, y: 300});
      //dropper.set({x: 120, y: 250});
      this.place(dropper, {x: 122, y: 250});
      thermometer.set({x: 320, y: 40, alpha: 0});
      this.place(powderBottle, {x: 500, y: 300});
      platformScale.set({x: 600, y: 300});
      inductionCooker.set({x: 200, y: 330});

      powder2.mask = circle;

      this.addChild(
        bg, platformScale, paper, ladle, powder, powderBottle, powder2, dropper, colorCard, phTestPaper,
        inductionCooker, thermometer, bar, beaker, paper2, bottle
      );

      this.bar = bar;
      this.ladle = ladle;
      this.paper = paper;
      this.paper2 = paper2;
      this.powder = powder;
      this.powder2 = powder2;
      this.dropper = dropper;
      this.beaker = beaker;
      this.circle = circle;
      this.colorCard = colorCard;
      this.phTestPaper = phTestPaper;
      this.thermometer = thermometer;
      this.powderBottle = powderBottle;
      this.platformScale = platformScale;
      this.inductionCooker = inductionCooker;
    },

    release: function() {
      Scene.prototype.release.call(this);

    },


    refresh: function() {




    }
  });

  ENJ.Scene_10_3 = Scene_10_3;
})();

//######################################################################################################################
// src/scenes/Scene_10_4.js
//######################################################################################################################
(function() {
  var ColorFilter = CreateJS.ColorFilter;
  var Container = CreateJS.Container;
  var Bitmap = CreateJS.Bitmap;
  var Shape = CreateJS.Shape;
  var Point = CreateJS.Point;
  var Tween = CreateJS.Tween;
  var Scene = ENJ.Scene;

  function Scene_10_4() {
    Scene.call(this);
  }

  ENJ.defineClass({
    constructor: Scene_10_4,
    extend: Scene,

    start: function() {
      this.active = true;
    },

    stop: function() {
      this.active = false;
    },

    //register: function() {},

    ready: function() {
      var bg = new Bitmap(RES.getRes("背景"));

      var bar = new Bitmap(RES.getRes('玻璃棒'));
      var colorCard = new Bitmap(RES.getRes('比色卡2'));
      var bottle = new Bitmap(RES.getRes('广口瓶瓶身'));
      var beaker = new ENJ.Beaker({volume: 60, color: 0xccffffff});
      var beaker2 = new ENJ.Beaker({volume: 60, color: 0x22ffffff});
      var tube = new ENJ.TubeWithBranch({volume: 0, color: 0xccffffff});
      var funnel = new ENJ.Funnel({volume: 0, color: 0xccffffff});
      var suckBall = new ENJ.SuckBall();
      var cylinder = new ENJ.Cylinder({volume: 0, color: 0x22ffffff});
      var bigBeaker = new ENJ.BigBeaker({volume: 200, color: 0x22ffffff});
      var bottle2 = new ENJ.NarrowMouthBottle({volume: 60, color: 0x22ffffff, label: '乙醇一氨', useCap: true});
      var phTestPaper = new ENJ.PHTestPaper_2();

      //beaker.rotation = 60;

      bg.set({x: -100, y: -100});
      bar.set({rotation: 90});
      beaker.set({regX: 80, regY: 0});
      beaker2.set({regX: 80, regY: 0});
      bottle.set({x: 500, y: 300});
      bottle2.set({scaleX: 1.25, scaleY: 1.25, regX: 20});
      //tube.set({x: 470, y: 260});
      funnel.set({x: 515, y: 180});

      colorCard.set({x:400, y: 0, visible: false});
      //colorCard.visible = false;
      phTestPaper.visible = false;

      this.place(bar, {x: 750, y: 450});
      this.place(tube, {x: 470, y: 260});
      this.place(beaker, {x: 350, y: 330});
      this.place(beaker2, {x: 600, y: 600});
      this.place(bottle2, {x: 850, y: 220});
      this.place(bigBeaker, {x: 900, y: 600});
      this.place(cylinder, {x: 700, y: 220});
      this.place(suckBall, {x: 400, y: 350});





      this.addChild(
        bg, bar, suckBall, colorCard, phTestPaper, funnel, tube, bottle, beaker, cylinder, beaker2, bigBeaker, bottle2
      );

      this.bar = bar;
      this.tube = tube;
      this.beaker = beaker;
      this.funnel = funnel;
      this.suckBall = suckBall;

      this.cylinder = cylinder;
      this.bottle2 = bottle2;
      this.beaker2 = beaker2;
      this.bigBeaker = bigBeaker;

      this.colorCard = colorCard;
      this.phTestPaper = phTestPaper;


    },

    release: function() {
      Scene.prototype.release.call(this);

    },


    refresh: function() {

    }
  });

  ENJ.Scene_10_4 = Scene_10_4;
})();

//######################################################################################################################
// src/scenes/Scene_10_5.js
//######################################################################################################################
(function() {
  var ColorFilter = CreateJS.ColorFilter;
  var Container = CreateJS.Container;
  var Bitmap = CreateJS.Bitmap;
  var Shape = CreateJS.Shape;
  var Point = CreateJS.Point;
  var Tween = CreateJS.Tween;
  var Scene = ENJ.Scene;

  function Scene_10_5() {
    Scene.call(this);
  }

  ENJ.defineClass({
    constructor: Scene_10_5,
    extend: Scene,

    start: function() {
      this.active = true;
    },

    stop: function() {
      this.active = false;
    },

    //register: function() {},

    ready: function() {
      var bg = new Bitmap(RES.getRes("背景"));
      var tube = new ENJ.TubeWithBranch({volume: 20, color: 0x22ffffff});
      var balance = new ENJ.Balance({angle: 0});
      var waterBottle = new ENJ.WaterBottle();
      var platformScale = new ENJ.PlatformScale({weight: 0});


      var shells = [
        new Bitmap(RES.getRes('离心管壳')),
        new Bitmap(RES.getRes('离心管壳'))
      ];

      var beakers = [
        new ENJ.Beaker({volume: 0 , color: 0x22ffffff}),
        new ENJ.Beaker({volume: 0 , color: 0x22ffffff})
      ];

      var centrifugeTubes = [
        new ENJ.CentrifugeTube({volume: 0 , color: 0x22ffffff}),
        new ENJ.CentrifugeTube({volume: 0 , color: 0x22ffffff})
      ];

      //beaker.rotation = 60;

      bg.set({x: -100, y: -100});
      tube.set({x: 600, y: 100, regX: 77});
      balance.set({x: 200, y: 250});
      platformScale.set({x: 600, y: 300});


      //beakers[0].set({x: 210, y: 210});
      beakers[0].set({x: 100, y: 320});
      beakers[1].set({x: 660, y: 250});

      //shells[0].set({x: 220, y: 190});
      shells[0].set({x: 10, y: -20});
      shells[1].set({x: 10, y: -20});

      //centrifugeTubes[0].set({x: 225, y: 190});
      centrifugeTubes[0].set({x: 15, y: -22});
      //centrifugeTubes[1].set({x: 675, y: 200});
      centrifugeTubes[1].set({x: 15, y: -150});

      beakers[0].addChildAt(shells[0], 0);
      beakers[0].addChildAt(centrifugeTubes[0], 0);

      beakers[1].addChildAt(shells[1], 0);
      beakers[1].addChildAt(centrifugeTubes[1], 0);

      this.addChild(
        bg,
        platformScale,
        waterBottle,
        beakers[0], beakers[1],
        balance, tube
      );


      this.place(waterBottle, {x: 820, y: 250});

      this.tube = tube;
      this.balance = balance;
      this.beakers = beakers;
      this.waterBottle = waterBottle;
      this.platformScale = platformScale;
      this.centrifugeTubes = centrifugeTubes;
    },

    release: function() {
      Scene.prototype.release.call(this);

    },


    refresh: function() {

    }
  });

  ENJ.Scene_10_5 = Scene_10_5;
})();

//######################################################################################################################
// src/scenes/Scene_10_5_2.js
//######################################################################################################################
(function() {
  var ColorFilter = CreateJS.ColorFilter;
  var Container = CreateJS.Container;
  var Bitmap = CreateJS.Bitmap;
  var Shape = CreateJS.Shape;
  var Point = CreateJS.Point;
  var Tween = CreateJS.Tween;
  var Scene = ENJ.Scene;

  function Scene_10_5_2() {
    Scene.call(this);
  }

  ENJ.defineClass({
    constructor: Scene_10_5_2,
    extend: Scene,

    start: function() {
      this.active = true;
    },

    stop: function() {
      this.active = false;
    },

    //register: function() {},

    ready: function() {
      var bg = new Bitmap(RES.getRes("背景"));

      //var dot = new Shape();
      //dot.graphics.beginFill('#f00').drawCircle(0,0,2);

      var centrifuge = new ENJ.Centrifuge();

      var shells = [
        new Bitmap(RES.getRes('离心管壳')),
        new Bitmap(RES.getRes('离心管壳'))
      ];

      var containers = [
        new Container(),
        new Container()
      ];

      var centrifugeTubes = [
        new ENJ.CentrifugeTube({volume: 40 , color: 0x22ffffff}),
        new ENJ.CentrifugeTube({volume: 40 , color: 0x22ffffff})
      ];

      //beaker.rotation = 60;

      bg.set({x: -100, y: -100});
      //dot.set({x: 435, y: 361});
      centrifuge.set({x: 300, y: 50});


      //containers[0].set({x: 210, y: 210});
      containers[0].set({x: 200, y: 200});
      containers[1].set({x: 700, y: 200});

      //shells[0].set({x: 220, y: 190});
      shells[0].set({x: 10, y: -20});
      shells[1].set({x: 10, y: -20});

      //centrifugeTubes[0].set({x: 225, y: 190});
      centrifugeTubes[0].set({x: 15, y: -22});
      centrifugeTubes[1].set({x: 15, y: -22});
      //centrifugeTubes[1].set({x: 675, y: 200});
      //centrifugeTubes[1].set({x: 15, y: -150});

      containers[0].addChildAt(shells[0], 0);
      containers[0].addChildAt(centrifugeTubes[0], 0);

      containers[1].addChildAt(shells[1], 0);
      containers[1].addChildAt(centrifugeTubes[1], 0);

      this.addChild(
        bg,
        centrifuge,// dot,
        containers[0], containers[1]
      );


      //this.dot = dot;
      this.centrifuge = centrifuge;
      this.containers = containers;
      this.centrifugeTubes = centrifugeTubes;
    },

    release: function() {
      Scene.prototype.release.call(this);

    },


    refresh: function() {

    }
  });

  ENJ.Scene_10_5_2 = Scene_10_5_2;
})();

//######################################################################################################################
// src/scenes/Scene_10_6.js
//######################################################################################################################
(function() {
  var ColorFilter = CreateJS.ColorFilter;
  var Container = CreateJS.Container;
  var Bitmap = CreateJS.Bitmap;
  var Shape = CreateJS.Shape;
  var Point = CreateJS.Point;
  var Tween = CreateJS.Tween;
  var Scene = ENJ.Scene;


  function Bubble() {
    Shape.call(this);

    this.alpha = 0.5;
    this.graphics
      .beginStroke("#000")
      .beginFill('rgba(255,255,255,0.3)')
      .drawEllipse(0,0,20,10)
      .endFill()
      .endStroke();
  }

  ENJ.defineClass({
    constructor: Bubble,
    extend: Shape,
    init: function(origin, angle, life) {
      this.origin = origin;
      this.direction = angle * Math.PI / 180;
      this.life = life;
      this.time = 0;
    },
    step: function(delta) {
      this.time += delta;

      var dist = Math.sin(this.time * 0.01 * Math.PI) * 5;

      this.scaleX = this.scaleY = this.time * 0.0012;

      this.x = this.origin.x + dist;// * Math.cos(this.direction);
      this.y = this.origin.y + this.time * 0.08 ;// * Math.sin(this.direction);
    }
  });

  function Scene_10_6() {
    Scene.call(this);
  }

  ENJ.defineClass({
    constructor: Scene_10_6,
    extend: Scene,

    start: function() {
      this.active = true;
    },

    stop: function() {
      this.active = false;
    },

    //register: function() {},

    ready: function() {
      var bg = new Bitmap(RES.getRes("背景"));
      var dish = new ENJ.EvaporatingDish();
      var beaker = new ENJ.Beaker({volume: 60, color: 0x55ffffff});
      var inductionCooker = new ENJ.InductionCooker();
      var centrifugeTube = new ENJ.CentrifugeTube({volume: 40 , color: 0x33ffff00});

      //beaker.rotation = 60;

      bg.set({x: -100, y: -100});
      dish.set({x: 255, y: 250});
      beaker.set({x: 265, y: 285});
      centrifugeTube.set({x: 700, y: 200});
      inductionCooker.set({x: 200, y: 330});


      this.addChild(
        bg, inductionCooker, dish, beaker, centrifugeTube
      );


      var layer = this.layer = new CreateJS.Container();
      for (var i = 0; i < 50; ++i) {
        var bubble = new Bubble();
        bubble.init({x: Math.random() * 50, y: Math.random() * 10}, Math.random() * 180, Math.random() * 100 + 400);
        layer.addChild(bubble);
      }
      //layer.x = 270;
      //layer.y = 350;
      layer.x = 10;
      layer.y = 80;
      layer.scaleY = -1;
      layer.visible = false;
      beaker.addChild(layer);

      this.dish = dish;
      this.layer = layer;
      this.centrifugeTube = centrifugeTube;
      this.inductionCooker = inductionCooker;

      this.addEventListener('tick', this.refresh.bind(this));
    },

    release: function() {
      Scene.prototype.release.call(this);

    },


    refresh: function(event) {
      var layer = this.layer;
      if (layer.visible) {
        for (var i = 0, n = layer.getNumChildren(); i < n; ++i) {
          var bubble = layer.getChildAt(i);

          if (bubble.time >= bubble.life) {
            bubble.init({x: Math.random() * 50, y: Math.random() * 10}, Math.random() * 180, Math.random() * 100 + 400);
          } else {
            bubble.step(event.delta);
          }
        }
      }

    }
  });

  ENJ.Scene_10_6 = Scene_10_6;
})();

//######################################################################################################################
// src/scenes/Scene_10_7.js
//######################################################################################################################
(function() {
  var ColorFilter = CreateJS.ColorFilter;
  var Container = CreateJS.Container;
  var Bitmap = CreateJS.Bitmap;
  var Shape = CreateJS.Shape;
  var Point = CreateJS.Point;
  var Tween = CreateJS.Tween;
  var Scene = ENJ.Scene;

  function Scene_10_7() {
    Scene.call(this);
  }

  ENJ.defineClass({
    constructor: Scene_10_7,
    extend: Scene,

    start: function() {
      this.active = true;
    },

    stop: function() {
      this.active = false;
    },

    //register: function() {},

    ready: function() {
      var bg = new Bitmap(RES.getRes("背景"));
      var bar = new Bitmap(RES.getRes("玻璃棒"));
      var dish1 = new ENJ.EvaporatingDish();
      var dish2 = new ENJ.EvaporatingDish();
      var stand1 = new Bitmap(RES.getRes("试管架1"));
      var stand2 = new Bitmap(RES.getRes("试管架2"));
      //var liquid = new Bitmap(RES.getRes("蒸发皿流出液"));
      var bottle = new ENJ.WaterBottle(/*RES.getRes("蒸馏水瓶")*/);
      var tube1 = new ENJ.ColorimetricTube({no: 1, volume: 0, color: 0x99999900});
      var tube2 = new ENJ.ColorimetricTube({no: 2, volume: 0, color: 0x99999900});

      var shape = new Shape();
      shape.graphics
        .beginFill('green')
        .drawEllipse(500, 340, 100, 30)
        .lineTo(500, 350)
        .lineTo(500, 150)
        .lineTo(800, 150)
        .lineTo(800, 450)
        .lineTo(600, 450)
        .lineTo(600, 350)
        .endFill();

      shape.alpha = 0.25;
      bar.mask = shape;
      //bar.set({x: 600, y: 280, rotation: 10});
      bg.set({x: -100, y: -100});
      bar.set({rotation: 80});
      stand1.set({x: 100, y: 300});
      stand2.set({x: 100, y: 300});
      //liquid.visible = false;
      //tube2.set({x: 200, y: 330});
      //tube1.set({x: 252, y: 330});

      this.place(bar, {x: 780, y: 400});
      this.place(dish1, {x: 500, y: 350});
      this.place(dish2, {x: 650, y: 300});
      this.place(tube1, {x: 252, y: 280});
      this.place(tube2, {x: 200, y: 280});
      this.place(bottle, {x: 800, y: 250});

      this.addChild(
        bg, dish1, dish2, stand1, tube1, tube2, stand2, bar, bottle/*, shape*/
      );

      this.set({
        bar: bar,
        dishes: [dish1, dish2],
        tubes: [tube1, tube2],
        //liquid: liquid,
        bottle: bottle
      })


    },

    release: function() {
      Scene.prototype.release.call(this);

    },


    refresh: function() {

    }
  });

  ENJ.Scene_10_7 = Scene_10_7;
})();

//######################################################################################################################
// src/scenes/Scene_10_8.js
//######################################################################################################################
(function() {
  var SpriteSheet = CreateJS.SpriteSheet;
  var Sprite = CreateJS.Sprite;
  var Bitmap = CreateJS.Bitmap;
  var Shape = CreateJS.Shape;
  var Point = CreateJS.Point;
  var Tween = CreateJS.Tween;
  var Scene = ENJ.Scene;

  function Scene_10_8() {
    Scene.call(this);
  }

  ENJ.defineClass({
    constructor: Scene_10_8,
    extend: Scene,

    start: function() {
      this.active = true;
    },

    stop: function() {
      this.active = false;
    },

    //register: function() {},

    ready: function() {
      var bg = new Bitmap(RES.getRes("背景"));

      var data = {
        images: [RES.getRes("手")],
        frames: { width: 100, height: 129 },
        animations: { up: 0, down: 1 }
      };
      var sheet = new SpriteSheet(data);

      var hand = new Sprite(sheet);
      hand.gotoAndStop('up');
      hand.visible = false;

      var pipet = new ENJ.Pipet({volume: 0, color: 0x55ffff00});
      var flask = new ENJ.VolumetricFlask({dark: true, volume: 100, color: 0x33ffff00});

      var stand1 = new Bitmap(RES.getRes("试管架1"));
      var stand2 = new Bitmap(RES.getRes("试管架2"));
      var stand3 = new Bitmap(RES.getRes("移液管架"));
      //var liquid = new Bitmap(RES.getRes("蒸发皿流出液"));
      var bottle = new ENJ.WaterBottle(/*RES.getRes("蒸馏水瓶")*/);
      var suckBall = new ENJ.SuckBall(/*RES.getRes("蒸馏水瓶")*/);


      var tubes = [];
      for (var i = 0; i < 6; ++i) {
        tubes[i] = new ENJ.ColorimetricTube({no: i, volume: 0, color: i > 0 ? 0x55ffff00 : 0x55ffffff});
        this.place(tubes[i], {x: 252 - 26 * i, y: 280});
      }

      bg.set({x: -100, y: -100});
      stand1.set({x: 100, y: 300});
      stand2.set({x: 100, y: 300});
      stand3.set({x: 600, y: 200});

      this.place(flask, {x: 500, y: 240});
      this.place(pipet, {x: 850, y: 215, rotation: 90});
      this.place(bottle, {x: 800, y: 250});
      this.place(suckBall, {x: 600, y: 350});

      this.addChild(
        bg,
        stand1,
        tubes[0], tubes[1], tubes[2], tubes[3], tubes[4], tubes[5],
        stand2,
        stand3,
        suckBall,
        pipet,
        flask,

        bottle,
        hand
      );

      this.set({
        hand: hand,
        flask: flask,
        pipet: pipet,
        tubes: tubes,
        bottle: bottle,
        suckBall: suckBall
      })


    },


    refresh: function() {

    }
  });

  ENJ.Scene_10_8 = Scene_10_8;
})();

//######################################################################################################################
// src/scenes/Scene_10_9.js
//######################################################################################################################
(function() {
  var SpriteSheet = CreateJS.SpriteSheet;
  var Sprite = CreateJS.Sprite;
  var Bitmap = CreateJS.Bitmap;
  var Shape = CreateJS.Shape;
  var Point = CreateJS.Point;
  var Tween = CreateJS.Tween;
  var Scene = ENJ.Scene;

  function Scene_10_9() {
    Scene.call(this);
  }

  ENJ.defineClass({
    constructor: Scene_10_9,
    extend: Scene,

    start: function() {
      this.active = true;
    },

    stop: function() {
      this.active = false;
    },

    //register: function() {},

    ready: function() {
      var bg = new Bitmap(RES.getRes("背景"));

      var shape = new Shape();
      shape.alpha = 0.5;
      shape.graphics
        .beginFill('#0f0')
        .moveTo(0, 0)
        .lineTo(0, 960)
        .lineTo(630, 960)
        .lineTo(630, 325)
        .lineTo(1000, 325)
        .lineTo(1000, 0)
        .endFill();

      //var data = {
      //  images: [RES.getRes("手")],
      //  frames: { width: 100, height: 129 },
      //  animations: { up: 0, down: 1 }
      //};
      //var sheet = new SpriteSheet(data);
      //
      //var hand = new Sprite(sheet);
      //hand.gotoAndStop('up');
      //hand.visible = false;

      //var pipet = new ENJ.Pipet({volume: 0, color: 0x55ffff00});
      var beaker = new ENJ.Beaker({volume: 20, color: 0x99ddaa00});

      var stand1 = new Bitmap(RES.getRes("试管架1"));
      var stand2 = new Bitmap(RES.getRes("试管架2"));
      var papers = new Bitmap(RES.getRes("一沓擦镜纸"));
      var paper = new Bitmap(RES.getRes("擦镜纸"));
      ////var liquid = new Bitmap(RES.getRes("蒸发皿流出液"));
      //var bottle = new ENJ.WaterBottle(/*RES.getRes("蒸馏水瓶")*/);
      //var suckBall = new ENJ.SuckBall(/*RES.getRes("蒸馏水瓶")*/);

      var spectrophotometer = new ENJ.Spectrophotometer();
      var reporter = new ENJ.Reporter_10();

      var i;

      var tubes = [];
      for (i = 0; i < 6; ++i) {
        tubes[i] = new ENJ.ColorimetricTube({no: i, volume: 10, opacity: 0.25 + i*0.05, color: i > 0 ? 0x55ffff00 : 0x55ffffff});
        this.place(tubes[i], {x: 252 - 26 * i, y: 280});
      }

      var cuvettes = [];
      for (i = 0; i < 8; ++i) {
        cuvettes[i] = new ENJ.Cuvette({volume: 0, color: i > 0 ? 0x55ffff00 : 0x55ffffff});
        cuvettes[i].mask = shape;
        this.place(cuvettes[i], {x: 235 - 26 * i, y: 425});
      }

      bg.set({x: -100, y: -100});
      stand1.set({x: 100, y: 300});
      stand2.set({x: 100, y: 300});
      papers.set({x: 750, y: 450});
      paper.visible = false;
      //paper.set({x: 750, y: 450});
      reporter.set({x: 100, y: 100, visible: false});

      this.place(paper, {x: 750, y: 430});
      this.place(beaker, {x: 500, y: 400});
      this.place(spectrophotometer, {x: 600, y: 200});
      //this.place(bottle, {x: 800, y: 250});
      //this.place(suckBall, {x: 600, y: 350});

      this.addChild(
        bg,
        spectrophotometer,
        stand1,
        tubes[0], tubes[1], tubes[2], tubes[3], tubes[4], tubes[5],
        cuvettes[7], cuvettes[6], cuvettes[5], cuvettes[4], cuvettes[3], cuvettes[2], cuvettes[1], cuvettes[0],
        stand2,
        //stand3,
        //suckBall,
        //pipet,
        beaker,
        //
        //bottle,
        //hand

        papers,
        paper,
        reporter
      );

      this.set({
        spectrophotometer: spectrophotometer,
        cuvettes: cuvettes,
        tubes: tubes,
        paper: paper,
        reporter: reporter,
        beaker: beaker
      })


    },


    refresh: function() {

    }
  });

  ENJ.Scene_10_9 = Scene_10_9;
})();

//######################################################################################################################
// src/scenes/Scene_10_10.js
//######################################################################################################################
(function() {
  var SpriteSheet = CreateJS.SpriteSheet;
  var Sprite = CreateJS.Sprite;
  var Bitmap = CreateJS.Bitmap;
  var Shape = CreateJS.Shape;
  var Point = CreateJS.Point;
  var Tween = CreateJS.Tween;
  var Scene = ENJ.Scene;

  function Scene_10_10() {
    Scene.call(this);
  }

  ENJ.defineClass({
    constructor: Scene_10_10,
    extend: Scene,

    start: function() {
      this.active = true;
    },

    stop: function() {
      this.active = false;
    },

    //register: function() {},

    ready: function() {
      var bg = new Bitmap(RES.getRes("背景"));

      var shape = new Shape();
      shape.alpha = 0.5;
      shape.graphics
        .beginFill('#0f0')
        .moveTo(0, 0)
        .lineTo(0, 960)
        .lineTo(630, 960)
        .lineTo(630, 325)
        .lineTo(1000, 325)
        .lineTo(1000, 0)
        .endFill();

      //var data = {
      //  images: [RES.getRes("手")],
      //  frames: { width: 100, height: 129 },
      //  animations: { up: 0, down: 1 }
      //};
      //var sheet = new SpriteSheet(data);
      //
      //var hand = new Sprite(sheet);
      //hand.gotoAndStop('up');
      //hand.visible = false;

      //var pipet = new ENJ.Pipet({volume: 0, color: 0x55ffff00});
      var beaker = new ENJ.Beaker({volume: 20, color: 0x99ddaa00});

      var stand1 = new Bitmap(RES.getRes("试管架1"));
      var stand2 = new Bitmap(RES.getRes("试管架2"));
      var papers = new Bitmap(RES.getRes("一沓擦镜纸"));
      var paper = new Bitmap(RES.getRes("擦镜纸"));
      var dish = new ENJ.EvaporatingDish();
      ////var liquid = new Bitmap(RES.getRes("蒸发皿流出液"));
      //var bottle = new ENJ.WaterBottle(/*RES.getRes("蒸馏水瓶")*/);
      //var suckBall = new ENJ.SuckBall(/*RES.getRes("蒸馏水瓶")*/);

      var spectrophotometer = new ENJ.Spectrophotometer();
      var reporter = new ENJ.Reporter_10();

      var i;

      var tubes = [];
      for (i = 0; i < 3; ++i) {
        tubes[i] = new ENJ.ColorimetricTube({no: i, volume: 10, opacity: 0.25, color: i > 0 ? 0x55ffff00 : 0x55ffffff});
        this.place(tubes[i], {x: 252 - 26 * i, y: 280});
      }

      var cuvettes = [];
      for (i = 0; i < 3; ++i) {
        cuvettes[i] = new ENJ.Cuvette({volume: 0, color: i > 0 ? 0x55ffff00 : 0x55ffffff});
        cuvettes[i].mask = shape;
        this.place(cuvettes[i], {x: 235 - 26 * i, y: 425});
      }

      bg.set({x: -100, y: -100});
      dish.set({x: 500, y: 300});
      stand1.set({x: 100, y: 300});
      stand2.set({x: 100, y: 300});
      papers.set({x: 750, y: 450});
      reporter.set({x: 100, y: 100, visible: false});
      paper.visible = false;
      //paper.set({x: 750, y: 450});
      //stand3.set({x: 600, y: 200});

      this.place(paper, {x: 750, y: 430});
      this.place(beaker, {x: 500, y: 400});
      this.place(spectrophotometer, {x: 600, y: 200});
      //this.place(bottle, {x: 800, y: 250});
      //this.place(suckBall, {x: 600, y: 350});

      this.addChild(
        bg,
        dish,
        spectrophotometer,
        stand1,
        tubes[0], tubes[1], tubes[2], //tubes[3], tubes[4], tubes[5],
        cuvettes[2], cuvettes[1], cuvettes[0],
        stand2,
        //stand3,
        //suckBall,
        //pipet,
        beaker,
        //
        //bottle,
        //hand

        papers,
        paper,
        reporter
      );

      this.set({
        spectrophotometer: spectrophotometer,
        cuvettes: cuvettes,
        tubes: tubes,
        paper: paper,
        reporter: reporter,
        beaker: beaker
      })


    },


    refresh: function() {

    }
  });

  ENJ.Scene_10_10 = Scene_10_10;
})();

//######################################################################################################################
// src/scenes/Scene_10_11.js
//######################################################################################################################
(function() {
  var ColorFilter = CreateJS.ColorFilter;
  var Container = CreateJS.Container;
  var Bitmap = CreateJS.Bitmap;
  var Shape = CreateJS.Shape;
  var Point = CreateJS.Point;
  var Tween = CreateJS.Tween;
  var Scene = ENJ.Scene;

  function Scene_10_11() {
    Scene.call(this);
  }

  ENJ.defineClass({
    constructor: Scene_10_11,
    extend: Scene,

    start: function() {
      this.active = true;
    },

    stop: function() {
      this.active = false;
    },

    //register: function() {},

    ready: function() {
      var bg = new Bitmap(RES.getRes("背景"));
      var bar = new Bitmap(RES.getRes("玻璃棒"));

      var shape = new Shape();
      shape.graphics
        .beginFill('green')
        .drawEllipse(250, 390, 100, 30)
        .lineTo(250, 500)
        .lineTo(0, 500)
        .lineTo(0, 0)
        .lineTo(900, 0)
        .lineTo(900, 500)
        .lineTo(350, 500)
        .lineTo(350, 400)
        .endFill();

      shape.alpha = 0.25;
      //bar.mask = shape;

      var paper = new ENJ.ChromatographyPaper();
      paper.save({dxy: [20, 200], scaleX: 0.75, scaleY: 0.75});

      var capillary = new ENJ.Capillary({color: '#ffff00'});

      //var suckPipe = new Bitmap(RES.getRes('吸管'));
      var suckPipe = new ENJ.SuckPipe({color: 0x22ffffff});
      var hairDrier = new Bitmap(RES.getRes('电吹风'));
      var body2 = new Bitmap(RES.getRes('层析缸主体'));
      var cap2 = new Bitmap(RES.getRes('层析缸盖子'));

      var body1 = new Bitmap(RES.getRes('毛细管罐身'));
      var cap1 = new Bitmap(RES.getRes('毛细管盖子'));

      var dish = new ENJ.EvaporatingDish();

      var flask = new ENJ.VolumetricFlask({dark: true, volume: 50, color: 0x33ffff00});
      var beaker = new ENJ.Beaker({volume: 0, color: 0x33ffff00});
      var bottle = new ENJ.NarrowMouthBottle({volume: 40, color: 0x33ffffff, label: '  乙醇', useCap: true});

      bg.set({x: -100, y: -100});
      dish.set({x: 250, y: 400});
      cap1.set({x: 350, y: 290});
      body1.set({x: 350, y: 300});
      cap2.set({x: 700, y: 50});
      body2.set({x: 700, y: 100});
      beaker.set({x: 600, y: 320, scaleX: 0.75, scaleY: 0.75});
      bottle.set({x: 150, y: 270});
      //flask.set({x: 700, y: 250});
      //hairDrier.set({x: 500, y: 420, rotation:-30});
      suckPipe.set({x: 50, y: 400, rotation: -90});
      capillary.set({/*x: 360, y: 300, */rotation: -5, visible: false, regY: 100});

      paper.set({x: 400, y: 200/*, skewX:50, skewY: 0*/});
      //paper.visible = false;
      body2.visible = false;
      cap2.visible = false;
      //paper.transformMatrix = new CreateJS.Matrix2D(1,0.2,0,1);
      //capillary.save({volume: 1});
      bar.mask = shape;
      capillary.mask = shape;


      this.addChild(
        bg, /*shape, */paper, dish, body1, cap1, body2, cap2, bottle, suckPipe, beaker, flask, hairDrier, capillary, bar
      );

      bar.rotation = 80;
      this.place(bar, {x: 225, y: 425});
      this.place(cap1, {x: 350, y: 290});
      this.place(flask, {x: 700, y: 250});
      this.place(suckPipe, {x: 50, y: 400});
      this.place(hairDrier, {x: 600, y: 400});
      this.place(capillary, {x: 360, y: 370});

      this.set({
        bar: bar,
        cap1: cap1,
        dish: dish,
        paper: paper,
        flask: flask,
        bottle: bottle,
        beaker: beaker,
        suckPipe: suckPipe,
        hairDrier: hairDrier,
        capillary: capillary
      })

    },

    release: function() {
      Scene.prototype.release.call(this);

    },


    refresh: function() {

    }
  });

  ENJ.Scene_10_11 = Scene_10_11;
})();

//######################################################################################################################
// src/scenes/Scene_10_12.js
//######################################################################################################################
(function() {
  var ColorFilter = CreateJS.ColorFilter;
  var Container = CreateJS.Container;
  var Bitmap = CreateJS.Bitmap;
  var Shape = CreateJS.Shape;
  var Point = CreateJS.Point;
  var Tween = CreateJS.Tween;
  var Scene = ENJ.Scene;

  function Scene_10_12() {
    Scene.call(this);
  }

  ENJ.defineClass({
    constructor: Scene_10_12,
    extend: Scene,

    start: function() {
      this.active = true;
    },

    stop: function() {
      this.active = false;
    },

    //register: function() {},

    ready: function() {
      var bg = new Bitmap(RES.getRes("背景"));
      //var bar = new Bitmap(RES.getRes("玻璃棒"));

      //var shape = new Shape();
      //shape.graphics
      //  .beginFill('green')
      //  .drawEllipse(250, 390, 100, 30)
      //  .lineTo(250, 500)
      //  .lineTo(0, 500)
      //  .lineTo(0, 0)
      //  .lineTo(900, 0)
      //  .lineTo(900, 500)
      //  .lineTo(350, 500)
      //  .lineTo(350, 400)
      //  .endFill();
      //
      //shape.alpha = 0.25;
      //bar.mask = shape;

      var paper = new ENJ.ChromatographyPaper();
      paper.save({dxy: [20, 200], scaleX: 0.75, scaleY: 0.75});

      //var capillary = new ENJ.Capillary({color: '#ffff00'});

      //var suckPipe = new Bitmap(RES.getRes('吸管'));
      //var suckPipe = new ENJ.SuckPipe({color: 0x22ffffff});
      //var hairDrier = new Bitmap(RES.getRes('电吹风'));
      var body2 = new Bitmap(RES.getRes('层析缸主体'));
      var cap2 = new Bitmap(RES.getRes('层析缸盖子'));

      var clipWithRope = new ENJ.ClipWithRope();
      var reporter = new ENJ.Reporter_10();

      //var body1 = new Bitmap(RES.getRes('毛细管罐身'));
      //var cap1 = new Bitmap(RES.getRes('毛细管盖子'));

      //var dish = new ENJ.EvaporatingDish();
      //
      //var flask = new ENJ.VolumetricFlask({dark: true, volume: 50, color: 0x33ffff00});
      //var beaker = new ENJ.Beaker({volume: 0, color: 0x33ffff00});
      //var bottle = new ENJ.NarrowMouthBottle({volume: 40, color: 0x33ffffff, label: '  乙醇', useCap: true});

      bg.set({x: -100, y: -100});

      reporter.set({x: 100, y: 100, visible: false});

      cap2.set({x: 704, y: 10, scaleX: 1.00, scaleY: 1.00});
      body2.set({x: 700, y: 100, scaleX: 1.00, scaleY: 1.00});


      paper.set({x: 400, y: 200/*, skewX:50, skewY: 0*/});
      paper.save({index: 0});
      paper.save({amount: 1});
      paper.save({index: 1});
      paper.save({amount: 1});
      //paper.visible = false;
      //paper.transformMatrix = new CreateJS.Matrix2D(1,0.2,0,1);
      //capillary.save({volume: 1});


      this.addChild(
        bg, /*shape, */paper, clipWithRope, body2, cap2, reporter
      );

      this.place(cap2, {x: 703, y: 10});

      clipWithRope.update(-100, 100, -100, 75);
      this.set({
        clipWithRope: clipWithRope,
        nodes: [{x:-100, y:200}, {x:-100, y:200}],
        reporter: reporter,
        paper: paper,
        cap2: cap2
      });

    },

    release: function() {
      Scene.prototype.release.call(this);

    },


    refresh: function() {

    }
  });

  ENJ.Scene_10_12 = Scene_10_12;
})();

//######################################################################################################################
// src/steps/Step.js
//######################################################################################################################
(function() {
  var EventDispatcher = CreateJS.EventDispatcher;

  function Step(paras) {
    EventDispatcher.call(this);
    //this.register();

    this.lab = paras.lab;
    this.store = paras.store;

    //this.ready();
  }

  ENJ.defineClass({
    /**
     *
     * @class Step
     * @extends EventDispatcher
     *
     * @param {Object} paras
     * @constructor
     */
    constructor: Step, extend: EventDispatcher,

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
      this.active = true;
      //this.dispatchEvent('stepstart');
    },

    /**
     * Stop interacting.
     *
     * @method stop
     */
    stop: function() {
      this.active = false;
      this.dispatchEvent('complete');
    }
  });

  ENJ.Step = Step;
})();

//##############################################################################
// src/steps/Step_Interlude_1.js
//##############################################################################
(function() {
  var Step = ENJ.Step,
    Tween = CreateJS.Tween;

  var base = Step.prototype;

  function Step_Interlude_1() {
    Step.apply(this, arguments);
  }

  ENJ.defineClass({
    /**
     * 过场
     * 所用：
     *
     * @constructor
     */
    constructor: Step_Interlude_1, extend: Step,

    start: function() {
      base.start.call(this);
      var self = this, store = this.store, board = this.lab.blackBoard;

      var scene = this.lab.getScene();
      if (!scene) {
        this.lab.putScene(new ENJ.Scene_10_1());
      } else {
        scene.weightingPaper.clear();
        scene.platformScale.save({weight: 0});
      }



      board.save({'title': store.title});
      board.visible = true;
      board.alpha = 1.0;
      Tween.get(board)
        //.to({ alpha: 1.0 }, 500)
        .wait(1000)
        .to({ alpha: 0.0 }, 500)
        .call(function() {
          board.visible = false;
          self.stop();
        });
    },

    stop: function() {
      base.stop.call(this);
    }
  });

  ENJ.Step_Interlude_1 = Step_Interlude_1;

})();

//##############################################################################
// src/steps/Step_Interlude_2.js
//##############################################################################
(function() {
  var Step = ENJ.Step,
    Tween = CreateJS.Tween;

  var base = Step.prototype;

  function Step_Interlude_2() {
    Step.apply(this, arguments);
  }

  ENJ.defineClass({
    /**
     * 过场
     * 所用：
     *
     * @constructor
     */
    constructor: Step_Interlude_2, extend: Step,

    start: function() {
      base.start.call(this);
      var self = this, store = this.store, board = this.lab.blackBoard;

      board.save({'title': store.title});
      board.visible = true;
      board.alpha = 1.0;
      Tween.get(board)
        //.to({ alpha: 1.0 }, 500)
        .wait(1000)
        .to({ alpha: 0.0 }, 500)
        .call(function() {
          board.visible = false;
          self.stop();
        });

      var Scene = ENJ['Scene_10_' + store.no];

      this.lab.putScene(new Scene());
    },

    stop: function() {
      base.stop.call(this);
    }
  });

  ENJ.Step_Interlude_2 = Step_Interlude_2;

})();

//##############################################################################
// src/steps/Step_WeightingSugarBalls.js
//##############################################################################
(function() {
  var Step = ENJ.Step,
    Tween = CreateJS.Tween;

  var base = Step.prototype;

  function Step_WeightingSugarBalls() {
    Step.apply(this, arguments);
  }

  ENJ.defineClass({
    /**
     * 过场
     * 所用：
     *
     * @constructor
     */
    constructor: Step_WeightingSugarBalls, extend: Step,

    start: function() {
      base.start.call(this);
      var scene = this.lab.getScene(), store = this.store;


      var ladle = scene.ladle, bottle = scene.sugarBallsBottle;

      ladle.visible = true;
      ladle.set({x: 600, y: 250, rotation: 60});



      this.ladle = ladle;
      this.bottle = bottle;
      this.paper = scene.weightingPaper;
      this.sugarBalls = scene.sugarBalls;
      this.platformScale = scene.platformScale;

      this.times = 0;

      this.onClickLadle = this.onClickLadle.bind(this);

      var self = this;

      bottle.start();
      bottle.rotateTo(75);
      Tween.get(bottle).to({
        x: 550, y: 250
      }, 1000).call(function() {
        //if (store.autoPlay) {
        //  self.transformBalls();
        //} else {
          ladle.addEventListener('click', self.onClickLadle);
        //}

          if (store.autoPlay) {
            //ladle.dispatchEvent('click');
            self.transformBalls();
          } else {
            ladle.cursor = 'pointer';
          }

      });

    },

    onClickLadle: function() {
      this.ladle.removeEventListener('click', this.onClickLadle);
      this.transformBalls();
    },

    transformBalls: function() {
      var self = this, scene = this.lab.getScene(),
        ladle = this.ladle, paper = this.paper, sugarBalls = this.sugarBalls, platformScale = this.platformScale;

      Tween.get(ladle)
        .to({
          x: 550, y: 280
        }, 200)
        .to({
          x: 500, y: 300
        }, 500)
        .call(function() {
          //show balls
          sugarBalls[0].visible = true;
          sugarBalls[1].visible = true;
        })
        .to({
          x: 550, y: 280
        }, 500)
        .to({
          x: 600, y: 300
        }, 1000)
        .call(function() {
          //hide balls
          sugarBalls[0].visible = false;
          sugarBalls[1].visible = false;

          ++self.times;

          var ball1 = new ENJ.SugarBall({factors: [1,0.6,1]});
          var ball2 = new ENJ.SugarBall({factors: [1,0.6,1]});
          ball1.x = Math.random()*40+50;
          ball1.y = Math.random()*5+15;
          ball2.x = Math.random()*40+50;
          ball2.y = Math.random()*5+15;
          paper.addSome(ball1, ball2);

          platformScale.save({weight: 0.001*(self.times*2.5 + 0.1)});

          if (self.times < 4) {
            self.transformBalls();
          } else {
            self.willStop();
          }
        });
    },

    willStop: function() {
      var bottle = this.bottle;

      bottle.stop();
      bottle.rotateTo(0);
      Tween.get(bottle).to({
        x: bottle.location.x, y: bottle.location.y
      }, 1000).call(this.stop.bind(this));

      this.ladle.visible = false;
      this.ladle.cursor = 'auto';
    },

    //stop: function() {
    //  var bottle = this.bottle;
    //
    //  bottle.stop();
    //  bottle.rotateTo(0);
    //  Tween.get(bottle).to({
    //    x: bottle.location.x, y: bottle.location.y
    //  }, 500);
    //
    //  this.ladle.visible = false;
    //  this.ladle.cursor = 'auto';
    //
    //
    //
    //    base.stop.call(this);
    //},

    update: function() {
      //this.bottle.refresh();
      var ladle = this.ladle, sugarBalls = this.sugarBalls;
      if (sugarBalls[0].visible) {
        sugarBalls[0].x = ladle.x-5;
        sugarBalls[0].y = ladle.y-5;
        sugarBalls[1].x = ladle.x+2;
        sugarBalls[1].y = ladle.y-10;
      }
    }
  });

  ENJ.Step_WeightingSugarBalls = Step_WeightingSugarBalls;

})();

//##############################################################################
// src/steps/Step_DumpWaterToCylinder.js
//##############################################################################
(function() {
  var Step = ENJ.Step;
  var Tween = CreateJS.Tween;

  var base = Step.prototype;

  function Step_DumpWaterToCylinder() {
    Step.apply(this, arguments);
  }

  ENJ.defineClass({
    /**
     * 过场
     * 所用：
     *
     * @constructor
     */
    constructor: Step_DumpWaterToCylinder, extend: Step,

    start: function() {
      base.start.call(this);

      var scene = this.lab.getScene(), store = this.store;

      var cylinder = scene.cylinder, bigBeaker = scene.bigBeaker;

      this.flags = [];

      Tween.get(bigBeaker)
        .to({
          x: 650, y: 200, rotation: -15
        }, 500);

      bigBeaker.cursor = 'pointer';

      this.cylinder = cylinder;
      this.bigBeaker = bigBeaker;
      this.onClickBigBeaker = this.onClickBigBeaker.bind(this);

      bigBeaker.addEventListener('click', this.onClickBigBeaker);
    },

    stop: function() {
      //var scene = this.lab.getScene();

      this.bigBeaker.cursor = 'auto';

      base.stop.call(this);
    },

    update: function(event) {
      var cylinder = this.cylinder, bigBeaker = this.bigBeaker;

      bigBeaker.refresh();

      if (this.flags[0]) {
        var delta = event.delta/3000*30;

        var volume = cylinder.volume;

        if (volume >= 30) {
          this.stopDumping();
          cylinder.save({volume: 30});
          cylinder.toggle();
          this.flags[0] = false;
        } else {
          cylinder.save({volume: volume + delta});
          bigBeaker.save({volume: bigBeaker.volume - delta});
        }
      }
    },

    stopDumping: function() {
      var bigBeaker = this.bigBeaker;//scene = this.lab.getScene();
      Tween.get(bigBeaker)
        .to({
          x: bigBeaker.location.x,
          y: bigBeaker.location.y,
          rotation: 0
        }, 500)
        .call(this.stop.bind(this));
    },

    startDumping: function() {
      var store = this.store, self = this;

      Tween.get(this.bigBeaker)
        .to({ rotation: store.angleFrom }, 500)
        .call(function() {
          self.flags[0] = 1;
          self.cylinder.toggle();
        })
        .to({
          rotation: store.angleTo/*,
          onChange: function() {

          }*/
        }, 3000);
    },

    onClickBigBeaker: function() {
      //var scene = this.lab.getScene();

      this.bigBeaker.removeEventListener('click', this.onClickBigBeaker);

      this.startDumping();
    }
  });

  ENJ.Step_DumpWaterToCylinder = Step_DumpWaterToCylinder;

})();

//##############################################################################
// src/steps/Step_DumpWaterToBeaker.js
//##############################################################################
(function() {
  var Step = ENJ.Step;
  var Tween = CreateJS.Tween;

  var base = Step.prototype;

  function Step_DumpWaterToBeaker() {
    Step.apply(this, arguments);
  }

  ENJ.defineClass({
    /**
     * 过场
     * 所用：
     *
     * @constructor
     */
    constructor: Step_DumpWaterToBeaker, extend: Step,

    start: function() {
      base.start.call(this);

      var scene = this.lab.getScene(), store = this.store;

      var cylinder = scene.cylinder, beaker = scene.beakers[store.beakerId];

      this.flags = [];

      Tween.get(cylinder)
        .to({
          x: beaker.x + 10, y: beaker.y - 25, rotation: -60
        }, 500);

      cylinder.cursor = 'pointer';

      this.cylinder = cylinder;
      this.beaker = beaker;
      this.onClickCylinder = this.onClickCylinder.bind(this);

      cylinder.addEventListener('click', this.onClickCylinder);
    },

    stop: function() {
      //var scene = this.lab.getScene();

      this.cylinder.cursor = 'auto';

      base.stop.call(this);
    },

    update: function(event) {
      var cylinder = this.cylinder, beaker = this.beaker;

      cylinder.refresh();

      if (this.flags[0]) {
        var delta = event.delta/1000*30;

        var volume = cylinder.volume;

        if (volume <= 0) {
          this.stopDumping();
          cylinder.save({volume: 0});
          //cylinder.toggle();
          this.flags[0] = false;
        } else {
          cylinder.save({volume: volume - delta});
          beaker.save({volume: beaker.volume + delta});
        }
      }
    },

    stopDumping: function() {
      var cylinder = this.cylinder;//scene = this.lab.getScene();
      Tween.get(cylinder)
        .to({
          x: cylinder.location.x,
          y: cylinder.location.y,
          rotation: 0
        }, 500)
        .call(this.stop.bind(this));
    },

    startDumping: function() {
      //var store = this.store, self = this;

      this.flags[0] = 1;

      Tween.get(this.cylinder)
        .to({
          rotation: -90
        }, 1000);
    },

    onClickCylinder: function() {
      //var scene = this.lab.getScene();

      this.cylinder.removeEventListener('click', this.onClickCylinder);

      this.startDumping();
    }
  });

  ENJ.Step_DumpWaterToBeaker = Step_DumpWaterToBeaker;

})();

//##############################################################################
// src/steps/Step_PickSugarBall.js
//##############################################################################
(function() {
  var Step = ENJ.Step;
  var Tween = CreateJS.Tween;

  var base = Step.prototype;

  function Step_PickSugarBall() {
    Step.apply(this, arguments);
  }

  ENJ.defineClass({

    constructor: Step_PickSugarBall, extend: Step,

    start: function() {
      base.start.call(this);

      var scene = this.lab.getScene(), store = this.store;

      var ladle = scene.ladle, chopsticks = scene.chopsticks, beakers = scene.beakers,
        weightingPaper = scene.weightingPaper/*, beaker = scene.beakers[store.beakerId]*/;

      this.flags = [];

      Tween.get(ladle)
        .to({
          rotation: 3, x: weightingPaper.x + 80, y: weightingPaper.y - 20
        }, 500)
        .to({
          y: weightingPaper.y + 5
        }, 250);

      Tween.get(chopsticks)
        .to({
          rotation: -3, x: weightingPaper.x + 70, y: weightingPaper.y - 20
        }, 500)
        .to({
          y: weightingPaper.y + 5
        }, 250)
        .call(this.startTransforming.bind(this));

      this.beakers = beakers;
      this.ladle = ladle;
      this.chopsticks = chopsticks;
      this.weightingPaper = weightingPaper;
    },

    stop: function() {
      //var scene = this.lab.getScene();

      base.stop.call(this);
    },

    startTransforming: function() {
      var scene = this.lab.getScene();
      var sugarBall = this.weightingPaper.pickOne();

      this.sugarBall = sugarBall;

      scene.addChildAt(sugarBall, scene.getChildIndex(this.ladle)+1);
      sugarBall.set({x: this.ladle.x - 5, y: this.ladle.y});

      Tween.get(sugarBall)
        .to({
          x: this.beakers[1].x + 0, y: this.beakers[1].y - 30
        }, 500)
        .call(this.stopTransforming.bind(this));
    },

    stopTransforming: function() {
      var ladle = this.ladle, chopsticks = this.chopsticks, sugarBall = this.sugarBall;
//console.log('stopTransforming');
      Tween.get(ladle)
        .to({
          rotation: 90, x: ladle.location.x, y: ladle.location.y
        }, 500);

      Tween.get(chopsticks)
        .to({
          rotation: 87, x: chopsticks.location.x, y: chopsticks.location.y
        }, 500)
        .call(this.stop.bind(this));

      sugarBall.set({x: 40, y: 70});
      this.beakers[1].addChildAt(sugarBall, 0);

      this.sugarBall = null;
    },

    update: function(event) {
      if (this.sugarBall) {
        var x = this.sugarBall.x, y = this.sugarBall.y;

        this.ladle.x = x + 8;
        this.ladle.y = y;
        this.chopsticks.x = x;
        this.chopsticks.y = y;
      }
    }
  });

  ENJ.Step_PickSugarBall = Step_PickSugarBall;

})();

//##############################################################################
// src/steps/Step_PickSugarBall_2.js
//##############################################################################
(function() {
  var Step = ENJ.Step;
  var Tween = CreateJS.Tween;

  var base = Step.prototype;

  function Step_PickSugarBall_2() {
    Step.apply(this, arguments);
  }

  ENJ.defineClass({

    constructor: Step_PickSugarBall_2, extend: Step,

    start: function() {
      base.start.call(this);

      var scene = this.lab.getScene(), store = this.store;

      var ladle = scene.ladle, chopsticks = scene.chopsticks, beakers = scene.beakers;

      this.flags = [];

      Tween.get(ladle)
        .to({
          rotation: 3, x: beakers[1].x + 10, y: beakers[1].y - 30
        }, 500)
        .to({
          y: beakers[1].y + 45
        }, 500);

      Tween.get(chopsticks)
        .to({
          rotation: -3, x: beakers[1].x + 0, y: beakers[1].y - 30
        }, 500)
        .to({
          y: beakers[1].y + 45
        }, 500)
        .call(this.startTransforming.bind(this));

      this.beakers = beakers;
      this.ladle = ladle;
      this.chopsticks = chopsticks;
      //this.weightingPaper = weightingPaper;
    },

    stop: function() {
      //var scene = this.lab.getScene();

      base.stop.call(this);
    },

    startTransforming: function() {
      var scene = this.lab.getScene();
      var sugarBall = this.beakers[1].getChildAt(0);
      this.beakers[1].removeChildAt(0);

      this.sugarBall = sugarBall;

      scene.addChildAt(sugarBall, scene.getChildIndex(this.ladle)+1);
      sugarBall.set({x: this.ladle.x - 5, y: this.ladle.y});

      Tween.get(sugarBall)
        .to({
          x: this.beakers[0].x + 0, y: this.beakers[0].y - 30
        }, 500)
        .call(this.stopTransforming.bind(this));
    },

    stopTransforming: function() {
      var ladle = this.ladle, chopsticks = this.chopsticks, sugarBall = this.sugarBall;

      Tween.get(ladle)
        .to({
          rotation: 90, x: ladle.location.x, y: ladle.location.y
        }, 500);

      Tween.get(chopsticks)
        .to({
          rotation: 87, x: chopsticks.location.x, y: chopsticks.location.y
        }, 500)
        .call(this.stop.bind(this));

      sugarBall.set({x: 40, y: 70});
      this.beakers[0].addChildAt(sugarBall, 0);

      this.sugarBall = null;
    },

    update: function(event) {
      if (this.sugarBall) {
        var x = this.sugarBall.x, y = this.sugarBall.y;

        this.ladle.x = x + 8;
        this.ladle.y = y;
        this.chopsticks.x = x;
        this.chopsticks.y = y;
      }
    }
  });

  ENJ.Step_PickSugarBall_2 = Step_PickSugarBall_2;

})();

//##############################################################################
// src/steps/Step_PickSugarBall_3.js
//##############################################################################
(function() {
  var Step = ENJ.Step;
  var Tween = CreateJS.Tween;

  var base = Step.prototype;

  function Step_PickSugarBall_3() {
    Step.apply(this, arguments);
  }

  ENJ.defineClass({

    constructor: Step_PickSugarBall_3, extend: Step,

    start: function() {
      base.start.call(this);

      var scene = this.lab.getScene(), store = this.store;

      var ladle = scene.ladle, chopsticks = scene.chopsticks, beakers = scene.beakers;

      this.flags = [];

      Tween.get(ladle)
        .to({
          rotation: 3, x: beakers[0].x + 10, y: beakers[0].y - 30
        }, 500)
        .to({
          y: beakers[0].y + 45
        }, 500);

      Tween.get(chopsticks)
        .to({
          rotation: -3, x: beakers[0].x + 0, y: beakers[0].y - 30
        }, 500)
        .to({
          y: beakers[0].y + 45
        }, 500)
        .call(this.startTransforming.bind(this));

      this.beakers = beakers;
      this.ladle = ladle;
      this.chopsticks = chopsticks;
      //this.weightingPaper = weightingPaper;
    },

    stop: function() {
      //var scene = this.lab.getScene();

      base.stop.call(this);
    },

    startTransforming: function() {
      var scene = this.lab.getScene();
      var sugarBall = this.beakers[0].getChildAt(0);
      this.beakers[0].removeChildAt(0);

      this.sugarBall = sugarBall;

      scene.addChildAt(sugarBall, scene.getChildIndex(this.ladle)+1);
      sugarBall.set({x: this.ladle.x - 5, y: this.ladle.y});

      Tween.get(sugarBall)
        .to({
          x: -100, y: 300
        }, 500)
        .call(this.stopTransforming.bind(this));
    },

    stopTransforming: function() {
      var ladle = this.ladle, chopsticks = this.chopsticks, sugarBall = this.sugarBall;

      Tween.get(ladle)
        .to({
          rotation: 90, x: ladle.location.x, y: ladle.location.y
        }, 500);

      Tween.get(chopsticks)
        .to({
          rotation: 87, x: chopsticks.location.x, y: chopsticks.location.y
        }, 500)
        .call(this.stop.bind(this));

      this.lab.getScene().removeChild(sugarBall);

      this.sugarBall = null;
    },

    update: function(event) {
      if (this.sugarBall) {
        var x = this.sugarBall.x, y = this.sugarBall.y;

        this.ladle.x = x + 8;
        this.ladle.y = y;
        this.chopsticks.x = x;
        this.chopsticks.y = y;
      }
    }
  });

  ENJ.Step_PickSugarBall_3 = Step_PickSugarBall_3;

})();

//##############################################################################
// src/steps/Step_DipSugarBall.js
//##############################################################################
(function() {
  var Step = ENJ.Step;
  var Tween = CreateJS.Tween;

  var base = Step.prototype;

  function Step_DipSugarBall() {
    Step.apply(this, arguments);
  }

  ENJ.defineClass({
    /**
     * 过场
     * 所用：
     *
     * @constructor
     */
    constructor: Step_DipSugarBall, extend: Step,

    start: function() {
      base.start.call(this);

      var scene = this.lab.getScene(), store = this.store;

      var beaker = scene.beakers[store.beakerId];

      beaker.cursor = 'pointer';

      this.flags = [];

      this.beaker = beaker;
      this.onClickBeaker = this.onClickBeaker.bind(this);

      var self = this;

      Tween.get(beaker)
        .to({
          rotation: 30,
          y: beaker.y - 100
        }, 500)
        .call(function() {
          if (store.autoPlay) {
            self.startShaking();
          } else {
            beaker.addEventListener('click', self.onClickBeaker);
          }

        });
    },

    stop: function() {
      //var scene = this.lab.getScene();

      this.beaker.speed = 1.0;
      this.beaker.cursor = 'auto';

      base.stop.call(this);
    },

    update: function(event) {
      var beaker = this.beaker;

      //++this.times;
      //
      //if (this.time > 10) {
      //  this.stopShaking();
      //}

      beaker.refresh();

    },

    startShaking: function() {
      var beaker = this.beaker, self = this, times = 0;
      beaker.speed = 1.2;
      //this.times = 0;
      this.tween = Tween.get(beaker, {loop: true})
        .to({rotation: -30}, 200)
        .to({rotation: 30}, 200)
        .call(function() {
          ++times;
          //console.log(1,alpha);
          var alpha = (beaker.color >>> 24) + 10;
          if (alpha > 200) {
            alpha = 200;
          }
          console.log(2,alpha);
          var color = 0x00ffffff | (alpha << 24);
          beaker.save({color: color});
          if (times === 8) {
            self.stopShaking();
          }
        });

    },

    stopShaking: function() {
      this.tween.setPaused(true);

      var beaker = this.beaker;
      beaker.speed = 1.0;
      Tween.get(beaker)
        .to({
          rotation: 0,
          y: beaker.location.y
        }, 500)
        .call(this.stop.bind(this));
    },

    onClickBeaker: function() {
      this.beaker.removeEventListener('click', this.onClickBeaker);
      this.startShaking();
    }
  });

  ENJ.Step_DipSugarBall = Step_DipSugarBall;

})();

//##############################################################################
// src/steps/Step_MergeEluent.js
//##############################################################################
(function() {
  var Step = ENJ.Step;
  var Tween = CreateJS.Tween;

  var base = Step.prototype;

  function Step_MergeEluent() {
    Step.apply(this, arguments);
  }

  ENJ.defineClass({

    constructor: Step_MergeEluent, extend: Step,

    start: function() {
      base.start.call(this);

      var scene = this.lab.getScene(), store = this.store;

      var beakers = scene.beakers;

      this.flags = [];


      this.beakers = beakers;
      var onClickBeaker = this.onClickBeaker = this.onClickBeaker.bind(this);


      beakers[1].cursor = 'pointer';

      Tween.get(beakers[1])
        .to({
          rotation: 60, x: beakers[0].x - 40, y: beakers[0].y - 40
        }, 500)
        .call(function() {
          beakers[1].addEventListener('click', onClickBeaker);
        });
    },

    stop: function() {
      //var scene = this.lab.getScene();
      this.beakers[1].cursor = 'auto';
      base.stop.call(this);
    },

    dump: function() {
      this.flags[0] = true;
      this.beakers[1].fixed = true;
      Tween.get(this.beakers[1])
        .to({
          rotation: 85
        }, 500);
    },

    back: function() {
      var beaker = this.beakers[1];
      beaker.save({volume: -100});
      beaker.fixed = false;
      Tween.get(beaker)
        .to({
          rotation: 0, x: beaker.location.x, y: beaker.location.y
        }, 500)
        .call(this.stop.bind(this));
    },


    update: function(event) {
      var beakers = this.beakers;

      beakers[1].refresh();

      if (this.flags[0]) {
        var delta = event.delta * 0.02;
        beakers[1].save({volume: beakers[1].volume - delta});
        beakers[0].save({volume: beakers[0].volume + delta});

        if (beakers[1].volume <= 0) {
          this.flags[0] = false;
          this.back();
        }
      }

    },

    onClickBeaker: function() {
      this.beakers[1].removeEventListener('click', this.onClickBeaker);
      this.dump();
    }
  });

  ENJ.Step_MergeEluent = Step_MergeEluent;

})();

//##############################################################################
// src/steps/Step_HeatingBeaker.js
//##############################################################################
(function() {
  var Step = ENJ.Step;
  var Tween = CreateJS.Tween;

  var base = Step.prototype;

  function Step_HeatingBeaker() {
    Step.apply(this, arguments);
  }

  ENJ.defineClass({
    constructor: Step_HeatingBeaker, extend: Step,

    start: function() {
      base.start.call(this);

      var scene = this.lab.getScene(), store = this.store;

      var bar =  scene.bar, beaker = scene.beaker, thermometer = scene.thermometer, inductionCooker = scene.inductionCooker;

      inductionCooker.cursor = 'pointer';

      this.flags = [];

      this.beaker = beaker;
      this.onClick = this.onClick.bind(this);

      var self = this;

      thermometer.set({x: 400, y: 0, rotation: 30});
      Tween.get(thermometer)
        .to({
          rotation: 0,
          alpha: 1.0,
          x: 320,
          y: 40
        }, 500)
        .call(function() {
          inductionCooker.addEventListener('click', self.onClick);
        });

      this.bar = bar;
      this.thermometer = thermometer;
      this.inductionCooker = inductionCooker;
    },

    stop: function() {

      this.inductionCooker.removeEventListener('click', this.onClick);
      this.inductionCooker.cursor = 'auto';

      Tween.get(this.thermometer)
        .to({
          x: 400, y: 0, rotation: 30, alpha: 0
        }, 500);

      base.stop.call(this);
    },

    update: function(event) {
      var thermometer = this.thermometer;
      if (this.flags[0]) {
        var temperature = thermometer.temperature;

        temperature += event.delta * 0.005;

        if (temperature >= 70) {
          temperature = 70;
          this.flags[0] = false;
          this.flags[1] = true;
          this.tween.setPaused(true);
        }

        thermometer.save({temperature: temperature});
      }

    },

    startHeating: function() {
      this.inductionCooker.start();

      this.tween =
        Tween.get(this.bar, {loop: true})
          .to({x: 295}, 500)
          .to({x: 255}, 500);
    },

    stopHeating: function() {
      this.inductionCooker.stop();
      this.stop();
    },

    onClick: function() {
      if (this.flags[0]) { return; }
      //this.startShaking();
      this.flags[0] = true;

      if (!this.flags[1]) {
        this.startHeating();
      } else {
        this.stopHeating();
      }

    }
  });

  ENJ.Step_HeatingBeaker = Step_HeatingBeaker;

})();

//##############################################################################
// src/steps/Step_WeightingPowder.js
//##############################################################################
(function() {
  var Step = ENJ.Step,
    Tween = CreateJS.Tween;

  var base = Step.prototype;

  function Step_WeightingPowder() {
    Step.apply(this, arguments);
  }

  ENJ.defineClass({
    /**
     * 过场
     * 所用：
     *
     * @constructor
     */
    constructor: Step_WeightingPowder, extend: Step,

    start: function() {
      base.start.call(this);
      var scene = this.lab.getScene(), store = this.store;


      var ladle = scene.ladle, circle = scene.circle, bottle = scene.powderBottle;

      ladle.visible = true;
      ladle.set({x: 700, y: 250, rotation: 60});

      circle.set({scaleX: 0, scaleY: 0});

      this.ladle = ladle;
      this.bottle = bottle;
      this.circle = circle;
      this.paper = scene.paper;
      this.powder = scene.powder;
      this.platformScale = scene.platformScale;

      this.times = 0;

      this.onClickLadle = this.onClickLadle.bind(this);

      var self = this;

      bottle.start();
      Tween.get(bottle).to({
        x: 630, y: 260, rotation: 60
      }, 500).call(function() {
        //if (store.autoPlay) {
        //  self.transformPowder();
        //} else {
        ladle.addEventListener('click', self.onClickLadle);
        //}

        if (store.autoPlay) {
          //ladle.dispatchEvent('click');
          self.transformPowder();
        } else {
          ladle.cursor = 'pointer';
        }

      });

    },

    onClickLadle: function() {
      this.ladle.removeEventListener('click', this.onClickLadle);
      this.transformPowder();
    },

    transformPowder: function() {
      var self = this, scene = this.lab.getScene(),
        ladle = this.ladle, paper = this.paper, powder = this.powder, platformScale = this.platformScale;

      Tween.get(ladle)
        .to({
          x: 650, y: 280
        }, 200)
        .to({
          x: 600, y: 300
        }, 500)
        .call(function() {
          powder.visible = true;
        })
        .to({
          x: 650, y: 280
        }, 500)
        .to({
          x: 700, y: 300
        }, 1000)
        .call(function() {

          powder.visible = false;

          ++self.times;


          platformScale.save({weight: 0.001*(self.times/3 + 0.1)});

          if (self.times < 3) {

            self.transformPowder();
          } else {
            self.willStop();
          }

          self.circle.set({scaleX: (self.times+1) / 4, scaleY: (self.times+1) / 4});
        });
    },

    willStop: function() {
      var bottle = this.bottle;

      bottle.stop();
      Tween.get(bottle).to({
        x: bottle.location.x, y: bottle.location.y, rotation: 0
      }, 500).call(this.stop.bind(this));

      this.ladle.visible = false;
      this.ladle.cursor = 'auto';
    },

    //stop: function() {
    //  var bottle = this.bottle;
    //
    //  bottle.stop();
    //  bottle.rotateTo(0);
    //  Tween.get(bottle).to({
    //    x: bottle.location.x, y: bottle.location.y
    //  }, 500);
    //
    //  this.ladle.visible = false;
    //  this.ladle.cursor = 'auto';
    //
    //
    //
    //    base.stop.call(this);
    //},

    update: function() {
      //this.bottle.refresh();
      var ladle = this.ladle, powder = this.powder;
      if (powder.visible) {
        powder.x = ladle.x - 30;
        powder.y = ladle.y + 8;
      }
    }
  });

  ENJ.Step_WeightingPowder = Step_WeightingPowder;

})();

//##############################################################################
// src/steps/Step_AddPowder.js
//##############################################################################
(function() {
  var Step = ENJ.Step;
  var Tween = CreateJS.Tween;

  var base = Step.prototype;

  function Step_AddPowder() {
    Step.apply(this, arguments);
  }

  ENJ.defineClass({
    /**
     * 过场
     * 所用：
     *
     * @constructor
     */
    constructor: Step_AddPowder, extend: Step,

    start: function() {
      base.start.call(this);

      var scene = this.lab.getScene(), store = this.store;

      scene.paper.visible = false;
      scene.powder2.visible = false;

      var paper2 = this.paper2 = scene.paper2;
      paper2.visible = true;
      paper2.set({x: 650, y: 270});

      var onClick = this.onClick = this.onClick.bind(this);

      Tween.get(paper2)
        .to({
          x: 300, y: 220
        }, 500).call(function() {
          paper2.addEventListener('click', onClick);
        });

      this.powder2 = scene.powder2;
      this.bar = scene.bar;
      paper2.cursor = "pointer";
    },

    onClick: function() {
      var paper2 = this.paper2, powder2 = this.powder2;
      paper2.removeEventListener('click', this.onClick);

      var self = this;

      Tween.get(paper2).to({
        x: 270, y: 270, rotation: -60
      }, 500).call(function() {
        self.stir();
      }).to({
        alpha: 0
      }, 500);
    },

    stir: function() {
      var powder2 = this.powder2;

      powder2.mask = null;
      powder2.set({visible: true, rotation: -60, x: 290, y: 270});
      Tween.get(powder2)
        .to({
          y: 350
        }, 250)
        .call(function() {
          powder2.visible = false;
        })
        .wait(5000)
        .call(this.stop.bind(this));

      this.tween =
        Tween.get(this.bar, {loop: true})
          .to({x: 295}, 500)
          .to({x: 255}, 500);
    },

    stop: function() {
      this.paper2.cursor = "auto";
      this.tween.setPaused(true);
      base.stop.call(this);
    },

    update: function(event) {

    }

  });

  ENJ.Step_AddPowder = Step_AddPowder;

})();

//##############################################################################
// src/steps/Step_AddWaterToDish.js
//##############################################################################
(function() {
  var Step = ENJ.Step;
  var Tween = CreateJS.Tween;

  var base = Step.prototype;

  function Step_AddWaterToDish() {
    Step.apply(this, arguments);
  }

  ENJ.defineClass({

    constructor: Step_AddWaterToDish, extend: Step,

    start: function() {
      base.start.call(this);

      var scene = this.lab.getScene(), store = this.store, self = this;

      var dish = this.dish =  scene.dishes[store.no];
      var bottle = this.bottle = scene.bottle;

      this.onClick = this.onClick.bind(this);

      Tween.get(dish)
        .to({x: 500, y: 250}, 500);

      Tween.get(bottle)
        .to({x: 600, y: 200}, 500)
        .call(function() {
          if (store.autoPlay) {
            self.startDumping();
          } else {
            bottle.cursor = 'pointer';
            bottle.addEventListener('click', self.onClick);
          }
        });
    },

    onClick: function() {
      this.bottle.removeEventListener('click', this.onClick);
      this.bottle.cursor = 'auto';
      this.startDumping();
    },

    startDumping: function() {
      var bottle = this.bottle;//, self = this;

      Tween.get(bottle)
        .to({rotation: -10}, 500)
        .call(function() {
          bottle.start();
        })
        .wait(3000)
        .call(this.stopDumping.bind(this));
    },

    stopDumping: function() {
      var dish = this.dish, bottle = this.bottle;

      Tween.get(dish)
        .to({
          x: 500,
          y: 350
        }, 500);

      bottle.stop();

      Tween.get(bottle)
        .to({
          rotation: 0,
          x: bottle.location.x,
          y: bottle.location.y
        }, 500)
        .call(this.stop.bind(this));
    },

    update: function(event) {

    }

  });

  ENJ.Step_AddWaterToDish = Step_AddWaterToDish;

})();

//##############################################################################
// src/steps/Step_AddWaterToTube.js
//##############################################################################
(function() {
  var Step = ENJ.Step;
  var Tween = CreateJS.Tween;

  var base = Step.prototype;

  function Step_AddWaterToTube() {
    Step.apply(this, arguments);
  }

  ENJ.defineClass({

    constructor: Step_AddWaterToTube, extend: Step,

    start: function() {
      base.start.call(this);

      var scene = this.lab.getScene(), store = this.store, self = this;

      var tube = this.tube =  scene.tubes[store.no];
      var bottle = this.bottle = scene.bottle;

      this.onClick = this.onClick.bind(this);
      this.flags = [];

      Tween.get(tube)
        .to({
          y: 150
        }, 500)
        .call(function() {
          tube.start();
        })
        .to({x: 400, y: 250, rotation: 15}, 500)
        .call(function() {
          if (store.autoPlay) {
            self.startDumping();
          } else {
            bottle.cursor = 'pointer';
            bottle.addEventListener('click', self.onClick);
          }
        });

      Tween.get(bottle)
        .to({x: 405, y: 230}, 500);


      store.originalVolume = tube.volume;
      store.originalOpacity = tube.opacity;
    },

    onClick: function() {
      this.bottle.removeEventListener('click', this.onClick);
      this.bottle.cursor = 'auto';
      this.startDumping();
    },

    startDumping: function() {
      var bottle = this.bottle, self = this;

      Tween.get(bottle)
        .to({rotation: -10}, 500)
        .call(function() {
          self.flags[0] = true;
          //bottle.start();
        });
        //.wait(3000)
        //.call(this.stopDumping.bind(this));
    },

    stopDumping: function() {
      var tube = this.tube, bottle = this.bottle;

      this.flags[0] = false;

      Tween.get(tube)
        .to({
          x: tube.location.x, y: 150, rotation: 0
        }, 500)
        .call(function() {
          tube.stop();
        })
        .wait(500)
        .to({
          rotation: -180
        }, 250)
        .to({
          rotation: 0
        }, 250)
        .to({
          y: tube.location.y
        }, 500)
        .call(this.stop.bind(this));

      //bottle.stop();

      Tween.get(bottle)
        .to({
          rotation: 0,
          x: bottle.location.x,
          y: bottle.location.y
        }, 500);
    },

    update: function(event) {
      var tube = this.tube, store = this.store;

      tube.refresh();

      if (this.flags[0]) {
        var delta = event.delta*0.001;

        var volume = tube.volume;

        if (volume >= store.targetVolume) {
          this.stopDumping();
          tube.save({volume: store.targetVolume});
        } else {
          tube.save({volume: volume + delta});
        }

        if ('targetOpacity' in store) {
          tube.save({
            opacity: store.originalOpacity + (tube.volume - store.originalVolume)/(store.targetVolume - store.originalVolume) * (store.targetOpacity - store.originalOpacity)
          });
        }
      }
    }

  });

  ENJ.Step_AddWaterToTube = Step_AddWaterToTube;

})();

//##############################################################################
// src/steps/Step_DumpToFunnel.js
//##############################################################################
(function() {
  var Step = ENJ.Step;
  var Tween = CreateJS.Tween;

  var base = Step.prototype;

  function Step_DumpToFunnel() {
    Step.apply(this, arguments);
  }

  ENJ.defineClass({

    constructor: Step_DumpToFunnel, extend: Step,

    start: function() {
      base.start.call(this);

      var scene = this.lab.getScene(), store = this.store, self = this;

      var beaker = scene.beaker, funnel = scene.funnel,  bar = scene.bar;

      beaker.cursor = "pointer";

      var onClick = this.onClick = this.onClick.bind(this);

      Tween.get(beaker)
        .to({
          x: 535, y: 150, rotation: 15
        }, 500)
        .call(function() {
          if (store.autoPlay) {
            self.startDumping();
          } else {
            beaker.addEventListener('click', onClick);
          }
        });

      Tween.get(bar)
        .to({
          x: 560, y: 60, rotation: 15
        }, 500);

      this.beaker = beaker;
      this.funnel = funnel;
      this.bar = bar;
      this.flags = [];
    },

    onClick: function() {
      var beaker = this.beaker, store = this.store;

      beaker.removeEventListener('click', this.onClick);

      //var self = this;
      this.startDumping();

    },

    startDumping: function() {
      var beaker = this.beaker, store = this.store;

      this.flags[0] = true;

      Tween.get(beaker)
        .to({
          /*x: 520, y: 150, */rotation: 30
        }, 500)
        .to({
          /*x: 520, y: 150, */rotation: store.targetAngle
        }, 1000);
    },

    stopDumping: function() {
      this.flags[0] = false;

      var beaker = this.beaker;

      beaker.cursor = "auto";

      Tween.get(beaker)
        .to({
          x: beaker.location.x, y: beaker.location.y, rotation: 0
        }, 500).call(this.stop.bind(this));
    },

    stop: function() {


      base.stop.call(this);
    },

    update: function(event) {
      var beaker = this.beaker, funnel = this.funnel;

      beaker.refresh();

      if (this.flags[0]) {
        var delta = event.delta/1000*10;

        var volume = funnel.volume;

        if (volume >= 30 /*this.store.targetVolume*/) {
          //this.stopDumping();
          //funnel.save({volume: 0});
          //cylinder.toggle();

          this.stopDumping();
        } else {
          beaker.save({volume: beaker.volume - delta});
          funnel.save({volume: volume + delta});
        }
      }
    }

  });

  ENJ.Step_DumpToFunnel = Step_DumpToFunnel;

})();

//##############################################################################
// src/steps/Step_DumpToFunnel_2.js
//##############################################################################
(function() {
  var Step = ENJ.Step;
  var Tween = CreateJS.Tween;

  var base = Step.prototype;

  function Step_DumpToFunnel_2() {
    Step.apply(this, arguments);
  }

  ENJ.defineClass({

    constructor: Step_DumpToFunnel_2, extend: Step,

    start: function() {
      base.start.call(this);

      var scene = this.lab.getScene(), store = this.store, self = this;

      var cylinder = scene.cylinder, funnel = scene.funnel,  bar = scene.bar;

      cylinder.cursor = "pointer";

      var onClick = this.onClick = this.onClick.bind(this);

      Tween.get(cylinder)
        .to({
          x: 535, y: 150, rotation: -15
        }, 500)
        .call(function() {
          if (store.autoPlay) {
            self.startDumping();
          } else {
            cylinder.addEventListener('click', onClick);
          }
        });

      Tween.get(bar)
        .to({
          x: 560, y: 60, rotation: 15
        }, 500);

      this.cylinder = cylinder;
      this.funnel = funnel;
      this.bar = bar;
      this.flags = [];
    },

    onClick: function() {
      var cylinder = this.cylinder, store = this.store;

      cylinder.removeEventListener('click', this.onClick);

      //var self = this;
      this.startDumping();

    },

    startDumping: function() {
      var cylinder = this.cylinder, store = this.store;

      this.flags[0] = true;

      Tween.get(cylinder)
        .to({
          /*x: 520, y: 150, */rotation: -30
        }, 500)
        .to({
          /*x: 520, y: 150, */rotation: store.targetAngle
        }, 1000);
    },

    stopDumping: function() {
      this.flags[0] = false;

      var cylinder = this.cylinder;

      cylinder.cursor = "auto";

      Tween.get(cylinder)
        .to({
          x: cylinder.location.x, y: cylinder.location.y, rotation: 0
        }, 500).call(this.stop.bind(this));
    },

    stop: function() {


      base.stop.call(this);
    },

    update: function(event) {
      var cylinder = this.cylinder, funnel = this.funnel;

      cylinder.refresh();

      if (this.flags[0]) {
        var delta = event.delta/1000*10;

        var volume = funnel.volume;

        if (volume >= 20) {
          //this.stopDumping();
          //funnel.save({volume: 0});
          //cylinder.toggle();

          this.stopDumping();
        } else {
          cylinder.save({volume: cylinder.volume - delta});
          funnel.save({volume: volume + delta});
        }
      }
    }

  });

  ENJ.Step_DumpToFunnel_2 = Step_DumpToFunnel_2;

})();

//##############################################################################
// src/steps/Step_DumpToCuvette.js
//##############################################################################
(function() {
  var Step = ENJ.Step;
  var Tween = CreateJS.Tween;

  var base = Step.prototype;

  function Step_DumpToCuvette() {
    Step.apply(this, arguments);
  }

  ENJ.defineClass({

    constructor: Step_DumpToCuvette, extend: Step,

    start: function() {
      base.start.call(this);

      var scene = this.lab.getScene(), store = this.store, self = this;

      var cuvette = scene.cuvettes[store.no], tube = scene.tubes[store.no];//, liquid = scene.liquid;

      var onClick = this.onClick = this.onClick.bind(this);

      cuvette.save({color: tube.color});

      Tween.get(tube)
        .to({
          y: 150
        }, 500)
        .call(function() {
          tube.start();
        })
        .to({
          x: 400, y: 240, rotation: 30
        }, 500)
        .call(function() {
          if (store.autoPlay) {
            self.startDumping();
          } else {
            tube.addEventListener('click', onClick);
            tube.cursor = "pointer";
          }
        });

      Tween.get(cuvette)
        .wait(500)
        .to({
          x: 400, y: 250, rotation: -15
        }, 500);


      //this.liquid = liquid;
      this.cuvette = cuvette;
      this.tube = tube;
      this.flags = [];

      //store.originalVolume = tube.volume;
      //store.originalOpacity = tube.opacity;
    },

    onClick: function() {
      var tube = this.cuvette, store = this.store;

      tube.removeEventListener('click', this.onClick);
      tube.cursor = "auto";
      //var self = this;
      this.startDumping();

    },

    startDumping: function() {
      var tube = this.tube, liquid = this.liquid;

      this.flags[0] = true;

      Tween.get(tube)
        .to({
          /*x: 520, y: 150, */
          rotation: 80
        }, 500);


    },

    stopDumping: function() {
      this.flags[0] = false;

      var cuvette = this.cuvette, tube = this.tube;

      Tween.get(tube)
        .to({
          x: tube.location.x, y: 150, rotation: 0
        }, 500)
        .call(function() {
          tube.stop();
        })
        .to({
          y: tube.location.y
        }, 500)
        .call(this.stop.bind(this));
      //
      //
      Tween.get(cuvette)
        .to({
          /*x: 500, y: 350, */rotation: 0
        }, 500);

    },

    stop: function() {


      base.stop.call(this);
    },

    update: function(event) {
      var tube = this.tube, cuvette = this.cuvette,  store = this.store;

      tube.refresh();
      cuvette.refresh();

      if (this.flags[0]) {
        var delta = event.delta*0.001;

        var volume = cuvette.volume;

        if (volume >= store.targetVolume) {
          this.stopDumping();
          cuvette.save({volume: store.targetVolume});
        } else {
          cuvette.save({volume: volume + delta});
          tube.save({volume: tube.volume - delta});
        }

      }
    }

  });

  ENJ.Step_DumpToCuvette = Step_DumpToCuvette;

})();

//##############################################################################
// src/steps/Step_DropToTube.js
//##############################################################################
(function() {
  var Step = ENJ.Step;
  var Tween = CreateJS.Tween;

  var base = Step.prototype;

  function Step_DropToTube() {
    Step.apply(this, arguments);
  }

  ENJ.defineClass({

    constructor: Step_DropToTube, extend: Step,

    start: function() {
      base.start.call(this);

      var scene = this.lab.getScene(), store = this.store, self = this;

      var tube = scene.tube, funnel = scene.funnel,  bar = scene.bar, suckBall = scene.suckBall;

      suckBall.cursor = "pointer";
      //
      var onClick = this.onClick = this.onClick.bind(this);

      this.suckBall = suckBall;
      this.funnel = funnel;
      this.tube = tube;
      this.bar = bar;
      this.flags = [];

      if (store.color) {
        tube.save({color: store.color});
      }

      Tween.get(suckBall)
        .to({
          x: 490, y: 265, rotation: 90
        }, 500).call(function() {
          if (store.autoPlay) {
            self.startDropping();
          } else {
            suckBall.addEventListener('click', onClick);
          }
        });
    },

    onClick: function() {
      var suckBall = this.suckBall, funnel = this.funnel, bar = this.bar;

      suckBall.removeEventListener('click', this.onClick);

      //var self = this;
      this.startDropping();




    },

    startDropping: function() {
      var suckBall = this.suckBall, funnel = this.funnel, bar = this.bar;

      this.flags[0] = true;

      suckBall.save({scale: 0.6});

      funnel.start();

      this.tween =
        Tween.get(bar, {loop: true})
          .to({
            x: 580
          }, 500)
          .to({
            x: 560
          }, 500);


      if (this.store.display) {
        funnel.save({display: true});
      }
    },

    stopDropping: function() {
      var suckBall = this.suckBall, funnel = this.funnel, bar = this.bar;

      this.flags[0] = false;

      suckBall.cursor = "auto";
      suckBall.save({scale: 1.0});

      funnel.stop();

      this.tween.setPaused(true);

      Tween.get(suckBall)
        .to({
          x: suckBall.location.x, y: suckBall.location.y, rotation: 0
        }, 500).call(this.stop.bind(this));

      //Tween.get(beaker)
      //  .to({
      //    x: beaker.location.x, y: beaker.location.y, rotation: 0
      //  }, 500).call(this.stop.bind(this));
    },

    stop: function() {


      base.stop.call(this);
    },

    update: function(event) {
      var tube = this.tube, funnel = this.funnel, suckBall = this.suckBall;

      //beaker.refresh();

      if (this.flags[0]) {
        //var delta = event.delta*0.0005;
        var delta = event.delta*0.0010;

        var volume = funnel.volume;

        if (volume <= 0) {
          //this.stopDropping();
          //funnel.save({volume: 0});
          //cylinder.toggle();

          this.stopDropping();
        } else {
          suckBall.save({scale: (20-volume) / 20 * 0.4 + 0.6});

          tube.save({volume: tube.volume + delta * 0.8});
          funnel.save({volume: volume - delta});
        }
      }
    }

  });

  ENJ.Step_DropToTube = Step_DropToTube;

})();

//##############################################################################
// src/steps/Step_DropToBeaker.js
//##############################################################################
(function() {
  var Step = ENJ.Step;
  var Tween = CreateJS.Tween;

  var base = Step.prototype;

  function Step_DropToBeaker() {
    Step.apply(this, arguments);
  }

  ENJ.defineClass({

    constructor: Step_DropToBeaker, extend: Step,

    start: function() {
      base.start.call(this);

      var scene = this.lab.getScene(), store = this.store;

      var beaker = scene.beaker, funnel = scene.funnel,  bar = scene.bar, dropper = scene.dropper;


      //
      var onClick = this.onClick = this.onClick.bind(this);

      this.dropper = dropper;
      this.beaker = beaker;
      this.bar = bar;

      this.flags = [];

      Tween.get(dropper)
        .to({
          y: dropper.location.y - 100
        }, 500)
        .to({
          x: 300,
          y: 150
        }, 500)
        .call(function() {
          dropper.addEventListener('click', onClick);
        });

      dropper.cursor = "pointer";
    },

    onClick: function() {
      var dropper = this.dropper, funnel = this.funnel, bar = this.bar;

      dropper.removeEventListener('click', this.onClick);

      dropper.cursor = "auto";
      //var self = this;
      dropper.start();

      Tween.get(dropper)
        .wait(500)
        .call(function() {
          dropper.stop();
        })
        .to({
          x: dropper.location.x,
          y: dropper.location.y - 100
        }, 500)
        .to({
          y: dropper.location.y
        }, 500)
        .call(this.stop.bind(this));

    }

  });

  ENJ.Step_DropToBeaker = Step_DropToBeaker;

})();

//##############################################################################
// src/steps/Step_TestPH.js
//##############################################################################
(function() {
  var Step = ENJ.Step;
  var Tween = CreateJS.Tween;

  var base = Step.prototype;

  function Step_TestPH() {
    Step.apply(this, arguments);
  }

  ENJ.defineClass({

    constructor: Step_TestPH, extend: Step,

    start: function() {
      base.start.call(this);

      var scene = this.lab.getScene(), self = this;

      var phTestPaper = scene.phTestPaper, colorCard = scene.colorCard,  bar = scene.bar;

      colorCard.set({alpha: 0, visible: true});
      phTestPaper.set({x: 200, y: 200, alpha: 0, visible: true});
      phTestPaper.save({ph: 0});

      var x0 = bar.x, y0 = bar.y;
      Tween.get(bar)
        .wait(500)
        .to({x: 180, y: 50 }, 1000)
        .wait(1000)
        .call(function() {
          phTestPaper.save({ph:4.0});
        })
        .to({x: x0, y: y0 }, 500);

      Tween.get(colorCard)
        .to({alpha: 1.0}, 500);

      Tween.get(phTestPaper)
        .to({alpha: 1.0}, 500)
        .wait(2000)
        .to({x: 520, y: 85}, 1000)
        .wait(3000)
        .call(function() {
          colorCard.visible = false;
          phTestPaper.visible = false;
          self.stop();
        });

    }

  });

  ENJ.Step_TestPH = Step_TestPH;

})();

//##############################################################################
// src/steps/Step_TestPH_2.js
//##############################################################################
(function() {
  var Step = ENJ.Step;
  var Tween = CreateJS.Tween;

  var base = Step.prototype;

  function Step_TestPH_2() {
    Step.apply(this, arguments);
  }

  ENJ.defineClass({

    constructor: Step_TestPH_2, extend: Step,

    start: function() {
      base.start.call(this);

      var scene = this.lab.getScene(), store = this.store, self = this;

      var phTestPaper = scene.phTestPaper, colorCard = scene.colorCard,  funnel = scene.funnel;

      colorCard.set({alpha: 0, visible: true});
      phTestPaper.set({x: 200, y: 200, alpha: 0, visible: true});
      phTestPaper.save({ph: 0});

      var x0 = funnel.x, y0 = funnel.y;
      Tween.get(funnel)
        .wait(500)
        .to({x: 190, y: 90}, 1000)
        .wait(1000)
        .call(function() {
          phTestPaper.save({ph: store.ph});
        })
        .to({x: x0, y: y0 }, 500);

      Tween.get(colorCard)
        .to({alpha: 1.0}, 500);

      var x;
      switch (store.ph) {
        case 5:
          x = 75 + 400;
          break;
        case 7:
          x = 100 + 400;
          break;
      }

      Tween.get(phTestPaper)
        .to({alpha: 1.0}, 500)
        .wait(2000)
        .to({x: x, y: 20}, 1000)
        .wait(3000)
        .call(function() {
          colorCard.visible = false;
          phTestPaper.visible = false;
          self.stop();
        });

    }

  });

  ENJ.Step_TestPH_2 = Step_TestPH_2;

})();

//##############################################################################
// src/steps/Step_ExchangeDishes.js
//##############################################################################
(function() {
  var Step = ENJ.Step;
  var Tween = CreateJS.Tween;

  var base = Step.prototype;

  function Step_ExchangeDishes() {
    Step.apply(this, arguments);
  }

  ENJ.defineClass({
    /**
     * 所用：
     *
     * @constructor
     */
    constructor: Step_ExchangeDishes, extend: Step,

    start: function() {
      base.start.call(this);

      var scene = this.lab.getScene(), self = this;

      var dish1 = scene.dishes[0], dish2 = scene.dishes[1];

      Tween.get(dish1)
        .wait(1000)
        .to({
          x: 650, y: 300
        }, 500);

      Tween.get(dish2)
        .wait(1000)
        .to({
          x: 500, y: 350
        }, 500)
        .wait(500)
        .call(function() {
          scene.place(dish2, {x: 500, y: 350});
          scene.place(dish1, {x: 650, y: 300});
          self.stop();
        });

    }
  });

  ENJ.Step_ExchangeDishes = Step_ExchangeDishes;

})();

//##############################################################################
// src/steps/Step_ShakeDish.js
//##############################################################################
(function() {
  var Step = ENJ.Step;
  var Tween = CreateJS.Tween;

  var base = Step.prototype;

  function Step_ShakeDish() {
    Step.apply(this, arguments);
  }

  ENJ.defineClass({

    constructor: Step_ShakeDish, extend: Step,

    start: function() {
      base.start.call(this);

      var scene = this.lab.getScene(), store = this.store, self = this;

      var dish = scene.dishes[store.no];

      Tween.get(dish)
        .to({ x: 500, y: 300, rotation: 5 }, 500)
        .to({ x: 520, y: 310, rotation: -5 }, 250)
        .to({ x: 500, y: 300, rotation: 5 }, 250)
        .to({ x: 520, y: 310, rotation: -5 }, 250)
        .to({ x: 500, y: 300, rotation: 5 }, 250)
        .to({ x: 520, y: 310, rotation: -5 }, 250)
        .to({ x: 500, y: 300, rotation: 5 }, 250)
        .to({ x: 520, y: 310, rotation: -5 }, 250)
        .to({ x: 500, y: 400, rotation: 0 }, 500)
        .call(this.stop.bind(this));



    }


  });

  ENJ.Step_ShakeDish = Step_ShakeDish;

})();

//##############################################################################
// src/steps/Step_EmptyTube.js
//##############################################################################
(function() {
  var Step = ENJ.Step;
  var Tween = CreateJS.Tween;

  var base = Step.prototype;

  function Step_EmptyTube() {
    Step.apply(this, arguments);
  }

  ENJ.defineClass({
    /**
     * 所用：
     *
     * @constructor
     */
    constructor: Step_EmptyTube, extend: Step,

    start: function() {
      base.start.call(this);

      var scene = this.lab.getScene(), store = this.store;

      var bar =  scene.bar, tube = scene.tube, funnel = scene.funnel, suckBall = scene.suckBall;

      this.flags = [];

      var x1 = bar.x, y1 = bar.y;
      Tween.get(bar)
        .to({
          rotation: 90,
          x: bar.location.x,
          y: bar.location.y
        }, 500)
        .wait(2000)
        .to({
          rotation: 15,
          x: x1,
          y: y1
        }, 500);


      var x2 = funnel.x, y2 = funnel.y;
      Tween.get(funnel)
        .to({
          rotation: 30,
          x: 600,
          y: 100
        }, 500)
        .wait(2000)
        .to({
          rotation: 0,
          x: x2,
          y: y2
        }, 500);

      var x3 = 490, y3 = 265;
      Tween.get(suckBall)
        .to({
          rotation: 0,
          x: suckBall.location.x,
          y: suckBall.location.y
        }, 500)
        .wait(2000)
        .to({
          rotation: 90,
          x: x3,
          y: y3
        }, 500);


      Tween.get(tube)
        .to({
          y: 150
        }, 500)
        .to({
          x: -200,
          y: 300
        }, 1000)
        .call(function() {
          tube.save({volume: 0});
        })
        .to({
          x: tube.location.x,
          y: 150
        }, 500)
        .to({
          y: tube.location.y
        }, 500)
        .wait(1000)
        .call(this.stop.bind(this));
      //
      //this.bar = bar;
      //this.tube = tube;
      //this.funnel = funnel;
      //this.suckBall = suckBall;
    },

    stop: function() {

      base.stop.call(this);
    },

    update: function(event) {


    }
  });

  ENJ.Step_EmptyTube = Step_EmptyTube;

})();

//##############################################################################
// src/steps/Step_DumpToTube.js
//##############################################################################
(function() {
  var Step = ENJ.Step;
  var Tween = CreateJS.Tween;

  var base = Step.prototype;

  function Step_DumpToTube() {
    Step.apply(this, arguments);
  }

  ENJ.defineClass({

    constructor: Step_DumpToTube, extend: Step,

    start: function() {
      base.start.call(this);

      var scene = this.lab.getScene(), store = this.store, self = this;

      var dish = scene.dishes[store.no], tube = scene.tubes[store.no];//, liquid = scene.liquid;

      var onClick = this.onClick = this.onClick.bind(this);

      dish.save({color: store.color});

      Tween.get(tube)
        .to({
          y: 150
        }, 500)
        .call(function() {
          tube.start();
        })
        .to({
          x: 400, y: 250, rotation: 15
        }, 500);

      Tween.get(dish)
        .wait(500)
        .to({
          x: 400, y: 250, rotation: -15
        }, 500)
        .call(function() {
          if (store.autoPlay) {
            self.startDumping();
          } else {
            dish.addEventListener('click', onClick);
            dish.cursor = "pointer";
          }
        });


      //this.liquid = liquid;
      this.dish = dish;
      this.tube = tube;
      this.flags = [];

      store.originalVolume = tube.volume;
      store.originalOpacity = tube.opacity;
    },

    onClick: function() {
      var dish = this.dish, store = this.store;

      dish.removeEventListener('click', this.onClick);
      dish.cursor = "auto";
      //var self = this;
      this.startDumping();

    },

    startDumping: function() {
      var dish = this.dish, liquid = this.liquid;

      this.flags[0] = true;

      Tween.get(dish)
        .to({
          /*x: 520, y: 150, */rotation: -60
        }, 500)
        .call(function() {
          dish.start();
          //liquid.set({x: 405, y: 310, rotation: -60, visible: true});
        });


    },

    stopDumping: function() {
      this.flags[0] = false;

      var dish = this.dish, tube = this.tube, liquid = this.liquid;

      //liquid.visible = false;
      dish.stop();

      Tween.get(tube)
        .to({
          x: tube.location.x, y: 150, rotation: 0
        }, 500)
        .call(function() {
          tube.stop();
        })
        .to({
          y: tube.location.y
        }, 500)
        .call(this.stop.bind(this));


      Tween.get(dish)
        .to({
          x: 500, y: 350, rotation: 0
        }, 500);

    },

    stop: function() {


      base.stop.call(this);
    },

    update: function(event) {
      var tube = this.tube, store = this.store;

      tube.refresh();

      if (this.flags[0]) {
        var delta = event.delta*0.001;

        var volume = tube.volume;

        if (volume >= store.targetVolume) {
          this.stopDumping();
          tube.save({volume: store.targetVolume});
        } else {
          tube.save({volume: volume + delta});
        }

        tube.save({
          opacity: store.originalOpacity + (tube.volume - store.originalVolume)/(store.targetVolume - store.originalVolume) * (store.targetOpacity - store.originalOpacity)
        });
      }
    }

  });

  ENJ.Step_DumpToTube = Step_DumpToTube;

})();

//##############################################################################
// src/steps/Step_DumpToBeaker.js
//##############################################################################
(function() {
  var Step = ENJ.Step;
  var Tween = CreateJS.Tween;

  var base = Step.prototype;

  function Step_DumpToBeaker() {
    Step.apply(this, arguments);
  }

  ENJ.defineClass({

    constructor: Step_DumpToBeaker, extend: Step,

    start: function() {
      base.start.call(this);

      var scene = this.lab.getScene(), store = this.store, self = this;

      var beaker = scene.beaker, cylinder = scene.cylinder;

      if ('color' in store) {
        beaker.save({color: store.color});
      }


      var onClick = this.onClick = this.onClick.bind(this);

      Tween.get(cylinder)
        .to({
          x: 330, y: 320, rotation: -60
        }, 500)
        .call(function() {
          if (store.autoPlay) {
            self.startDumping();
          } else {
            cylinder.addEventListener('click', onClick);
            cylinder.cursor = "pointer";
          }
        });

      this.beaker = beaker;
      this.cylinder = cylinder;
      this.flags = [];
    },

    onClick: function() {
      var cylinder = this.cylinder, store = this.store;

      cylinder.removeEventListener('click', this.onClick);
      cylinder.cursor = "auto";
      //var self = this;
      this.startDumping();

    },

    startDumping: function() {
      var cylinder = this.cylinder, store = this.store;

      this.flags[0] = true;

      Tween.get(cylinder)
        //.to({
        //  /*x: 520, y: 150, */rotation: 60
        //}, 500)
        .to({
          /*x: 520, y: 150, */rotation: store.targetAngle
        }, 500);
    },

    stopDumping: function() {
      this.flags[0] = false;

      var cylinder = this.cylinder;



      Tween.get(cylinder)
        .to({
          x: cylinder.location.x, y: cylinder.location.y, rotation: 0
        }, 500).call(this.stop.bind(this));
    },

    stop: function() {


      base.stop.call(this);
    },

    update: function(event) {
      var beaker = this.beaker, cylinder = this.cylinder;

      cylinder.refresh();

      if (this.flags[0]) {
        var delta = event.delta/1000*10;

        var volume = cylinder.volume;

        if (volume <= 0) {
          //this.stopDumping();
          //funnel.save({volume: 0});
          //cylinder.toggle();

          this.stopDumping();
        } else {
          beaker.save({volume: beaker.volume + delta});
          cylinder.save({volume: volume - delta});
        }
      }
    }

  });

  ENJ.Step_DumpToBeaker = Step_DumpToBeaker;

})();

//##############################################################################
// src/steps/Step_StirringDish.js
//##############################################################################
(function() {
  var Step = ENJ.Step;
  var Tween = CreateJS.Tween;

  var base = Step.prototype;

  function Step_StirringDish() {
    Step.apply(this, arguments);
  }

  ENJ.defineClass({

    constructor: Step_StirringDish, extend: Step,

    start: function() {
      base.start.call(this);

      var scene = this.lab.getScene(), store = this.store, self = this;

      var dish = scene.dishes[store.no], bar = scene.bar;

      Tween.get(bar)
        .to({
          x: 700, y: 150, rotation: 30
        }, 500)
        .to({
          x: 600, y: 230, rotation: 10
        }, 500)
        .call(function() {
          self.startStirring();
        });

      this.dish = dish;
      this.bar = bar;
      this.flags = [];
    },

    startStirring: function() {

      this.flags[0] = true;

      this.time = 0;

      this.tween =
        Tween.get(this.bar, {loop: true})
          .to({x: 550}, 500)
          .to({x: 600}, 500);
    },

    stopStirring: function() {
      var bar = this.bar;

      this.flags[0] = false;

      Tween.get(bar)
        .to({
          x: 700, y: 150, rotation: 30
        }, 500)
        .to({
          x: bar.location.x, y: bar.location.y, rotation: 80
        }, 500).call(this.stop.bind(this));
    },

    update: function(event) {
      //var dish = this.dish;

      if (this.flags[0]) {
        this.time += event.delta;

        if (this.time > 10000) {
          this.tween.setPaused(true);
          this.stopStirring();

        }
      }
    }

  });

  ENJ.Step_StirringDish = Step_StirringDish;

})();

//##############################################################################
// src/steps/Step_StirringBeaker.js
//##############################################################################
(function() {
  var Step = ENJ.Step;
  var Tween = CreateJS.Tween;

  var base = Step.prototype;

  function Step_StirringBeaker() {
    Step.apply(this, arguments);
  }

  ENJ.defineClass({

    constructor: Step_StirringBeaker, extend: Step,

    start: function() {
      base.start.call(this);

      var scene = this.lab.getScene(), self = this;

      var beaker = scene.beaker, bar = scene.bar;

      Tween.get(bar)
        .to({
          x: 315, y: 240, rotation: 15
        }, 500)
        .call(function() {
          self.startStirring();
        });

      this.beaker = beaker;
      this.bar = bar;
      this.flags = [];
    },

    startStirring: function() {

      this.flags[0] = true;

      this.time = 0;

      this.tween =
        Tween.get(this.bar, {loop: true})
          .to({x: 355}, 500)
          .to({x: 315}, 500);
    },

    stopStirring: function() {
      var bar = this.bar;

      this.flags[0] = false;

      Tween.get(bar)
        .to({
          x: bar.location.x, y: bar.location.y, rotation: 90
        }, 500).call(this.stop.bind(this));
    },

    update: function(event) {
      //var beaker = this.beaker;

      if (this.flags[0]) {
        this.time += event.delta;

        if (this.time > 5000) {
          this.tween.setPaused(true);
          this.stopStirring();

        }
      }
    }

  });

  ENJ.Step_StirringBeaker = Step_StirringBeaker;

})();

//##############################################################################
// src/steps/Step_SuckFromFlask.js
//##############################################################################
(function() {
  var Step = ENJ.Step;
  var Tween = CreateJS.Tween;

  var base = Step.prototype;

  function Step_SuckFromFlask() {
    Step.apply(this, arguments);
  }

  ENJ.defineClass({

    constructor: Step_SuckFromFlask, extend: Step,

    start: function() {
      base.start.call(this);

      var scene = this.lab.getScene(), self = this;

      this.onClick = this.onClick.bind(this);
      this.flags = [];

      var hand = this.hand = scene.hand;
      var flask = this.flask = scene.flask;
      var pipet = this.pipet = scene.pipet;
      var suckBall = this.suckBall = scene.suckBall;

      flask.start();
      Tween.get(flask)
        .to({x: 375, y: 300}, 500);

      pipet.save({display: false});
      Tween.get(pipet)
        .to({x: 400, y: 0, rotation: 0}, 500)
        .to({y: 120}, 500);

      Tween.get(hand)
        .to({ y: -20 }, 500)
        .to({ y: 100 }, 500);

      Tween.get(suckBall)
        .wait(1000)
        .to({x: 425, y: 148, rotation: 180}, 500)
        .call(function() {
          hand.visible = false;
          if (self.store.autoPlay) {
            self.startSucking();
          } else {
            suckBall.addEventListener('click', self.onClick);
            suckBall.cursor = 'pointer';
          }
        });


    },

    onClick: function() {
      var suckBall = this.suckBall;
      suckBall.removeEventListener('click', this.onClick);
      suckBall.cursor = 'auto';

      this.startSucking();
    },

    startSucking: function() {
      this.flags[0] = true;
      this.suckBall.save({scale: 0.5});
    },

    stopSucking: function() {
      this.hand.visible = true;
      this.flags[0] = false;
      this.stop();
      //var suckBall = this.suckBall;
      //
      //Tween.get(suckBall)
      //  .to({x: suckBall.location.x, y: suckBall.location.y, rotation: 0}, 500)
      //  .call(this.stop.bind(this));

    },

    update: function(event) {
      var pipet = this.pipet, suckBall = this.suckBall;
      if (this.flags[0]) {
        var volume = pipet.volume;
        var scale = suckBall.scale;

        if (volume >= 6) {
          this.stopSucking();
        } else {
          pipet.save({volume: volume + event.delta * 0.005});
        }

        if (scale < 1) {
          suckBall.save({scale: scale + 0.01});
        }

      }
    }

  });

  ENJ.Step_SuckFromFlask = Step_SuckFromFlask;

})();

//##############################################################################
// src/steps/Step_BlowToFlask.js
//##############################################################################
(function() {
  var Step = ENJ.Step;
  var Tween = CreateJS.Tween;

  var base = Step.prototype;

  function Step_BlowToFlask() {
    Step.apply(this, arguments);
  }

  ENJ.defineClass({

    constructor: Step_BlowToFlask, extend: Step,

    start: function() {
      base.start.call(this);

      var scene = this.lab.getScene(), self = this;

      this.onClick = this.onClick.bind(this);
      this.flags = [];

      var hand = this.hand = scene.hand;
      var flask = this.flask = scene.flask;
      var pipet = this.pipet = scene.pipet;
      var suckBall = this.suckBall = scene.suckBall;

      //flask.start();
      
      hand.set({
        visible: true,
        x: 390,
        y: 100
      });
      hand.gotoAndStop('up');
      
      if (this.store.autoPlay) {
        this.prepare();
      } else {
        hand.addEventListener('click', this.onClick);
        hand.cursor = 'pointer';
      }


    },

    onClick: function() {
      var hand = this.hand;
      

      if (!this.flags[0]) {
        this.prepare();
      } else {
        hand.removeEventListener('click', this.onClick);

        hand.cursor = 'auto';



        this.startBlowing();
      }
      
    },

    prepare: function() {
      var self = this;

      this.flags[0] = true;

      this.hand.gotoAndStop('down');


      var flask = this.flask, suckBall = this.suckBall;

      Tween.get(flask)
        .to({x: 375, y: 400, rotation: 10}, 500)
        .call(function() {
          if (self.store.autoPlay) {
            self.startBlowing();
          }
        });

      Tween.get(suckBall)
        .to({x: suckBall.location.x, y: suckBall.location.y, rotation: 0}, 500);
    },

    startBlowing: function() {
      this.flags[1] = true;

      this.hand.gotoAndStop('up');
      this.pipet.save({display: true});
    },

    stopBlowing: function() {
      this.flags[1] = false;
      
      var pipet = this.pipet, flask = this.flask, self = this;
      
      Tween.get(flask)
        .to({
          rotation: 0,
          x: flask.location.x,
          y: flask.location.y
        }, 500)
        .call(function() {
          //pipet.save({display: false});
          self.stop();
        });

      this.hand.gotoAndStop('down');
    },

    update: function(event) {
      var pipet = this.pipet, flask = this.flask;

      flask.refresh();
      if (this.flags[1]) {
        var volume = pipet.volume;

        if (volume <= this.store.targetVolume) {
          this.stopBlowing();
        } else {
          pipet.save({volume: volume - event.delta * 0.001});
        }

      }
    }

  });

  ENJ.Step_BlowToFlask = Step_BlowToFlask;

})();

//##############################################################################
// src/steps/Step_BlowToTube.js
//##############################################################################
(function() {
  var Step = ENJ.Step;
  var Tween = CreateJS.Tween;

  var base = Step.prototype;

  function Step_BlowToTube() {
    Step.apply(this, arguments);
  }

  ENJ.defineClass({

    constructor: Step_BlowToTube, extend: Step,

    start: function() {
      base.start.call(this);

      var scene = this.lab.getScene(), self = this;

      this.onClick = this.onClick.bind(this);
      this.flags = [];

      var hand = this.hand = scene.hand;
      var tube = this.tube = scene.tubes[this.store.no];
      var pipet = this.pipet = scene.pipet;

      //hand.set({
      //  visible: true,
      //  x: 390,
      //  y: 100
      //});
      //hand.gotoAndStop('up');


      Tween.get(tube)
        .to({y: 150}, 500)
        .call(function() {
          tube.start();
        })
        .to({x: 395, y: 400, rotation: 10}, 500)
        .call(function() {
          if (self.store.autoPlay) {
            self.startBlowing();
          } else {
            hand.addEventListener('click', self.onClick);
            hand.cursor = 'pointer';
          }
        });
      



    },

    onClick: function() {
      var hand = this.hand;

      hand.removeEventListener('click', this.onClick);
      hand.cursor = 'auto';

      this.pipet.save({display: true});

      this.startBlowing();
    },

    startBlowing: function() {
      this.flags[1] = true;
      this.hand.gotoAndStop('up');
      this.pipet.save({display: true});
    },

    stopBlowing: function() {
      this.flags[1] = false;
      
      var pipet = this.pipet, tube = this.tube, self = this;
      
      Tween.get(tube)
        .to({
          rotation: 0,
          x: tube.location.x,
          y: 150
        }, 500)
        .call(function() {
          tube.stop();
        })
        .to({
          y: tube.location.y
        }, 500)
        .call(function() {
          //pipet.save({display: false});
          self.stop();
        });

      if (this.store.last) {
        this.hand.visible = false;
        pipet.save({display: false});
        Tween.get(pipet)
          .to({
            x: pipet.location.x,
            y: pipet.location.y,
            rotation: 90
          }, 500)
      }

      this.hand.gotoAndStop('down');
    },

    update: function(event) {
      var pipet = this.pipet, tube = this.tube;
      if (this.flags[1]) {
        var volume = pipet.volume;

        if (volume <= this.store.targetVolume) {
          this.stopBlowing();
        } else {
          pipet.save({volume: volume - event.delta * 0.0005});
          tube.save({volume: tube.volume + event.delta * 0.0005});
        }

      }
    }

  });

  ENJ.Step_BlowToTube = Step_BlowToTube;

})();

//##############################################################################
// src/steps/Step_WashCuvette.js
//##############################################################################
(function() {
  var Step = ENJ.Step;
  var Tween = CreateJS.Tween;

  var base = Step.prototype;

  function Step_WashCuvette() {
    Step.apply(this, arguments);
  }

  ENJ.defineClass({

    constructor: Step_WashCuvette, extend: Step,

    start: function() {
      base.start.call(this);

      var scene = this.lab.getScene(), store = this.store, self = this;

      var cuvette = scene.cuvettes[store.no], beaker = scene.beaker;//, liquid = scene.liquid;


      Tween.get(cuvette)
        //.wait(500)
        .to({
          x: 530, y: 360, rotation: 60
        }, 500)
        .call(function() {
          self.startDumping();
        });


      //this.liquid = liquid;
      this.cuvette = cuvette;
      this.beaker = beaker;
      this.flags = [];
    },

    startDumping: function() {
      var cuvette = this.cuvette;

      this.flags[0] = true;

      Tween.get(cuvette)
        .to({
          /*x: 520, y: 150, */
          rotation: 120
        }, 250);


    },

    stopDumping: function() {
      this.flags[0] = false;

      var cuvette = this.cuvette, tube = this.tube;

      //Tween.get(tube)
      //  .to({
      //    x: tube.location.x, y: 150, rotation: 0
      //  }, 500)
      //  .call(function() {
      //    tube.stop();
      //  })
      //  .to({
      //    y: tube.location.y
      //  }, 500)
      //  .call(this.stop.bind(this));
      //
      //
      Tween.get(cuvette)
        .to({
          rotation: 60
        }, 500)
        .call(this.stop.bind(this));

    },

    stop: function() {


      base.stop.call(this);
    },

    update: function(event) {
      var beaker = this.beaker, cuvette = this.cuvette,  store = this.store;



      if (this.flags[0]) {
        var delta = event.delta*0.001;

        var volume = cuvette.volume;

        if (volume <= 0) {
          this.stopDumping();
          cuvette.save({volume: 0});
        } else {
          cuvette.save({volume: volume - delta});
          beaker.save({volume: beaker.volume + delta});
        }

      }

      cuvette.refresh();
    }

  });

  ENJ.Step_WashCuvette = Step_WashCuvette;

})();

//##############################################################################
// src/steps/Step_WipeCuvette.js
//##############################################################################
(function() {
  var Step = ENJ.Step;
  var Tween = CreateJS.Tween;

  var base = Step.prototype;

  function Step_WipeCuvette() {
    Step.apply(this, arguments);
  }

  ENJ.defineClass({

    constructor: Step_WipeCuvette, extend: Step,

    start: function() {
      base.start.call(this);

      var scene = this.lab.getScene(), store = this.store, self = this;

      var cuvette = scene.cuvettes[store.no], paper = scene.paper;//, liquid = scene.liquid;


      var index = scene.getChildIndex(paper);

      paper.visible = true;
      Tween.get(paper)
        .to({
          x: 410, y: 200,
          scaleX: 0.25, scaleY: 0.5
        }, 1000)
        .to({
          y: 270
        }, 500)
        .to({
          y: 200
        }, 500)
        .to({
          y: 270
        }, 500)
        .call(function() {
          //paper.x = 380;
          scene.setChildIndex(paper, 1);
        })
        .to({
          x: 380, y: 270
        }, 500)
        .to({
          y: 200
        }, 500)
        .to({
          y: 270
        }, 500)
        .call(function() {
          paper.set({
            visible: false,
            scaleX: 1.0, scaleY: 1.0,
            x: paper.location.x, y: paper.location.y
          });
          scene.setChildIndex(paper, index);

          self.stop();
        });

    }


  });

  ENJ.Step_WipeCuvette = Step_WipeCuvette;

})();


//##############################################################################
// src/steps/Step_BalanceTubes.js
//##############################################################################
(function() {
  var Step = ENJ.Step,
    Tween = CreateJS.Tween;

  var base = Step.prototype;

  function Step_BalanceTubes() {
    Step.apply(this, arguments);
  }

  ENJ.defineClass({
    /**
     * 过场
     * 所用：
     *
     * @constructor
     */
    constructor: Step_BalanceTubes, extend: Step,

    start: function() {
      base.start.call(this);
      var scene = this.lab.getScene(), store = this.store, self = this;

      var waterBottle = scene.waterBottle, balance = scene.balance, beakers = scene.beakers;

      this.flags = [];
      this.onClick = this.onClick.bind(this);

      Tween.get(beakers[0])
        .to({
          x: 210, y: 210
        }, 500)
        .to({
          y: 190
        }, 500);

      Tween.get(beakers[1])
        .to({
          x: 410, y: 210
        }, 500)
        .call(function() {
          self.flags[0] = true;
        })
        .to({
          y: 230
        }, 500)
        .call(function() {
          self.flags[0] = false;
        });

      Tween.get(waterBottle)
        .wait(1000)
        .to({x: 300, y: 50}, 500)
        .call(function() {
          //if (store.autoPlay) {
          //  self.startDumping();
          //} else {
            waterBottle.cursor = 'pointer';
            waterBottle.addEventListener('click', self.onClick);
          //}
        });

      this.balance = balance;
      this.beakers = beakers;
      this.waterBottle = waterBottle;
    },

    onClick: function() {
      var waterBottle = this.waterBottle;

      this.flags[1] = true;

      waterBottle.cursor = 'auto';
      waterBottle.removeEventListener('click', this.onClick);

      waterBottle.start();
      Tween.get(waterBottle)
        .to({
          rotation: -15, y: 100, x: 270
        }, 500);
    },

    update: function(event) {
      if (this.flags[0] || this.flags[1]) {
        this.beakers[0].y += 0.1;
        this.beakers[1].y -= 0.1;
        this.balance.save({angle: Math.atan2(this.beakers[1].y-210, this.balance.dist)*180/Math.PI});

        if (this.beakers[0].y >= this.beakers[1].y) {
          this.flags[1] = false;
          this.waterBottle.stop();
          Tween.get(this.waterBottle)
            .to({
              x: this.waterBottle.location.x, y: this.waterBottle.location.y, rotation: 0
            }, 500)
            .call(this.stop.bind(this));
        }
      }
    }
  });

  ENJ.Step_BalanceTubes = Step_BalanceTubes;

})();

//##############################################################################
// src/steps/Step_InstallCuvette.js
//##############################################################################
(function() {
  var Step = ENJ.Step;
  var Tween = CreateJS.Tween;

  var base = Step.prototype;

  function Step_InstallCuvette() {
    Step.apply(this, arguments);
  }

  ENJ.defineClass({

    constructor: Step_InstallCuvette, extend: Step,

    start: function() {
      base.start.call(this);

      var scene = this.lab.getScene(), store = this.store, self = this;

      var cuvette = scene.cuvettes[store.no];//, liquid = scene.liquid;


      Tween.get(cuvette)
        //.wait(500)
        .to({
          x: 650, y: 200, rotation: 0
        }, 500)
        .to({
          x: 665 + store.ox, y: 325 - store.oy, rotation: 0
        }, 500)
        .call(function() {
          self.stop();
        });
    }

  });

  ENJ.Step_InstallCuvette = Step_InstallCuvette;

})();

//##############################################################################
// src/steps/Step_DumpToCylinder_1.js
//##############################################################################
(function() {
  var Step = ENJ.Step;
  var Tween = CreateJS.Tween;

  var base = Step.prototype;

  function Step_DumpToCylinder_1() {
    Step.apply(this, arguments);
  }

  ENJ.defineClass({

    constructor: Step_DumpToCylinder_1, extend: Step,

    start: function() {
      base.start.call(this);

      var scene = this.lab.getScene(), store = this.store, self = this;

      var beaker = scene.beaker2, cylinder = scene.cylinder;

      beaker.cursor = "pointer";

      var onClick = this.onClick = this.onClick.bind(this);

      Tween.get(beaker)
        .to({
          x: 720, y: 220, rotation: 15
        }, 500)
        .call(function() {
          if (store.autoPlay) {
            self.startDumping();
          } else {
            beaker.addEventListener('click', onClick);
          }
        });

      this.beaker = beaker;
      this.cylinder = cylinder;
      this.flags = [];
    },

    onClick: function() {
      var beaker = this.beaker, store = this.store;

      beaker.removeEventListener('click', this.onClick);

      //var self = this;
      this.startDumping();

    },

    startDumping: function() {
      var beaker = this.beaker, store = this.store;

      this.flags[0] = true;

      Tween.get(beaker)
        .to({
          /*x: 520, y: 150, */rotation: 30
        }, 500)
        .to({
          /*x: 520, y: 150, */rotation: store.targetAngle
        }, 1000);
    },

    stopDumping: function() {
      this.flags[0] = false;

      var beaker = this.beaker;

      beaker.cursor = "auto";

      Tween.get(beaker)
        .to({
          x: beaker.location.x, y: beaker.location.y, rotation: 0
        }, 500).call(this.stop.bind(this));
    },

    stop: function() {


      base.stop.call(this);
    },

    update: function(event) {
      var beaker = this.beaker, cylinder = this.cylinder;

      beaker.refresh();

      if (this.flags[0]) {
        var delta = event.delta/1000*10;

        var volume = cylinder.volume;

        if (volume >= 20) {
          //this.stopDumping();
          //funnel.save({volume: 0});
          //cylinder.toggle();

          this.stopDumping();
        } else {
          beaker.save({volume: beaker.volume - delta});
          cylinder.save({volume: volume + delta});
        }
      }
    }

  });

  ENJ.Step_DumpToCylinder_1 = Step_DumpToCylinder_1;

})();

//##############################################################################
// src/steps/Step_DumpToCylinder_2.js
//##############################################################################
(function() {
  var Step = ENJ.Step;
  var Tween = CreateJS.Tween;

  var base = Step.prototype;

  function Step_DumpToCylinder_2() {
    Step.apply(this, arguments);
  }

  ENJ.defineClass({

    constructor: Step_DumpToCylinder_2, extend: Step,

    start: function() {
      base.start.call(this);

      var scene = this.lab.getScene(), store = this.store, self = this;

      var beaker = scene.bigBeaker, cylinder = scene.cylinder;

      beaker.cursor = "pointer";

      var onClick = this.onClick = this.onClick.bind(this);

      Tween.get(beaker)
        .to({
          x: 750, y: 220, rotation: -15
        }, 500)
        .call(function() {
          if (store.autoPlay) {
            self.startDumping();
          } else {
            beaker.addEventListener('click', onClick);
          }
        });

      this.beaker = beaker;
      this.cylinder = cylinder;
      this.flags = [];
    },

    onClick: function() {
      var beaker = this.beaker, store = this.store;

      beaker.removeEventListener('click', this.onClick);

      //var self = this;
      this.startDumping();

    },

    startDumping: function() {
      var beaker = this.beaker, store = this.store;

      this.flags[0] = true;

      Tween.get(beaker)
        .to({
          /*x: 520, y: 150, */rotation: -30
        }, 500)
        .to({
          /*x: 520, y: 150, */rotation: store.targetAngle
        }, 1000);
    },

    stopDumping: function() {
      this.flags[0] = false;

      var beaker = this.beaker;

      beaker.cursor = "auto";

      Tween.get(beaker)
        .to({
          x: beaker.location.x, y: beaker.location.y, rotation: 0
        }, 500).call(this.stop.bind(this));
    },

    stop: function() {


      base.stop.call(this);
    },

    update: function(event) {
      var beaker = this.beaker, cylinder = this.cylinder;

      beaker.refresh();

      if (this.flags[0]) {
        var delta = event.delta/1000*10;

        var volume = cylinder.volume;

        if (volume >= 20) {
          //this.stopDumping();
          //funnel.save({volume: 0});
          //cylinder.toggle();

          this.stopDumping();
        } else {
          beaker.save({volume: beaker.volume - delta});
          cylinder.save({volume: volume + delta});
        }
      }
    }

  });

  ENJ.Step_DumpToCylinder_2 = Step_DumpToCylinder_2;

})();

//##############################################################################
// src/steps/Step_DumpToCylinder_3.js
//##############################################################################
(function() {
  var Step = ENJ.Step;
  var Tween = CreateJS.Tween;

  var base = Step.prototype;

  function Step_DumpToCylinder_3() {
    Step.apply(this, arguments);
  }

  ENJ.defineClass({

    constructor: Step_DumpToCylinder_3, extend: Step,

    start: function() {
      base.start.call(this);

      var scene = this.lab.getScene(), store = this.store, self = this;

      var bottle = scene.bottle2, cylinder = scene.cylinder;

      bottle.cursor = "pointer";
      bottle.start();

      var onClick = this.onClick = this.onClick.bind(this);

      Tween.get(bottle)
        .to({
          x: 750, y: 220, rotation: -15
        }, 500)
        .call(function() {
          if (store.autoPlay) {
            self.startDumping();
          } else {
            bottle.addEventListener('click', onClick);
          }
        });

      this.bottle = bottle;
      this.cylinder = cylinder;
      this.flags = [];
    },

    onClick: function() {
      var bottle = this.bottle, store = this.store;

      bottle.removeEventListener('click', this.onClick);

      //var self = this;
      this.startDumping();

    },

    startDumping: function() {
      var bottle = this.bottle, store = this.store;

      this.flags[0] = true;

      Tween.get(bottle)
        .to({
          /*x: 520, y: 150, */rotation: -30
        }, 500)
        .to({
          /*x: 520, y: 150, */rotation: store.targetAngle
        }, 1000);
    },

    stopDumping: function() {
      this.flags[0] = false;

      var bottle = this.bottle;

      bottle.cursor = "auto";
      bottle.stop();

      Tween.get(bottle)
        .to({
          x: bottle.location.x, y: bottle.location.y, rotation: 0
        }, 500).call(this.stop.bind(this));
    },

    stop: function() {


      base.stop.call(this);
    },

    update: function(event) {
      var bottle = this.bottle, cylinder = this.cylinder;

      bottle.refresh();

      if (this.flags[0]) {
        var delta = event.delta/1000*10;

        var volume = cylinder.volume;

        if (volume >= 20) {
          //this.stopDumping();
          //funnel.save({volume: 0});
          //cylinder.toggle();

          this.stopDumping();
        } else {
          bottle.save({volume: bottle.volume - delta * 0.5});
          cylinder.save({volume: volume + delta});
        }
      }
    }

  });

  ENJ.Step_DumpToCylinder_3 = Step_DumpToCylinder_3;

})();

//##############################################################################
// src/steps/Step_DumpToCentrifugeTube.js
//##############################################################################
(function() {
  var Step = ENJ.Step;
  var Tween = CreateJS.Tween;

  var base = Step.prototype;

  function Step_DumpToCentrifugeTube() {
    Step.apply(this, arguments);
  }

  ENJ.defineClass({

    constructor: Step_DumpToCentrifugeTube, extend: Step,

    start: function() {
      base.start.call(this);

      var scene = this.lab.getScene(), store = this.store, self = this;

      var tube = scene.tube, centrifugeTube = scene.centrifugeTubes[store.no];//, liquid = scene.liquid;

      var onClick = this.onClick = this.onClick.bind(this);

      Tween.get(tube)
        .to({
          x: 680, y: 90, rotation: 15
        }, 500)
        .call(function() {
          if (store.autoPlay) {
            self.startDumping();
          } else {
            tube.addEventListener('click', onClick);
            tube.cursor = "pointer";
          }
        });

      this.centrifugeTube = centrifugeTube;
      this.tube = tube;
      this.flags = [];
    },

    onClick: function() {
      var tube = this.tube, store = this.store;

      tube.removeEventListener('click', this.onClick);
      tube.cursor = "auto";
      //var self = this;
      this.startDumping();

    },

    startDumping: function() {
      var tube = this.tube;

      this.flags[0] = true;

      Tween.get(tube)
        .to({
          rotation: 105
        }, 500);


    },

    stopDumping: function() {
      this.flags[0] = false;

      var tube = this.tube;

      Tween.get(tube)
        .to({
          /*x: 500, y: 0, rotation: 0, */alpha: 0
        }, 500)
        .call(this.stop.bind(this));

    },

    update: function(event) {
      var centrifugeTube = this.centrifugeTube, tube = this.tube, store = this.store;

      tube.refresh();

      if (this.flags[0]) {
        var delta = event.delta*0.1;

        var volume = tube.volume;

        if (volume <= 0) {
          this.stopDumping();
          tube.save({volume: 0});
        } else {
          tube.save({volume: volume - delta});
          centrifugeTube.save({volume: centrifugeTube.volume + delta});
        }
      }
    }

  });

  ENJ.Step_DumpToCentrifugeTube = Step_DumpToCentrifugeTube;

})();

//##############################################################################
// src/steps/Step_WeightingCentrifugeTube.js
//##############################################################################
(function() {
  var Step = ENJ.Step,
    Tween = CreateJS.Tween;

  var base = Step.prototype;

  function Step_WeightingCentrifugeTube() {
    Step.apply(this, arguments);
  }

  ENJ.defineClass({
    /**
     * 过场
     * 所用：
     *
     * @constructor
     */
    constructor: Step_WeightingCentrifugeTube, extend: Step,

    start: function() {
      base.start.call(this);
      var scene = this.lab.getScene(), store = this.store;


      var platformScale = scene.platformScale, centrifugeTube = scene.centrifugeTubes[store.no];
      
      Tween.get(centrifugeTube)
        .to({
          y: -22
        }, 500)
        .call(function() {
          platformScale.save({weight: store.weight});
        })
        .wait(1000)
        .call(this.stop.bind(this));
    }
  });

  ENJ.Step_WeightingCentrifugeTube = Step_WeightingCentrifugeTube;

})();

//##############################################################################
// src/steps/Step_AddWaterToCentrifugeTube.js
//##############################################################################
(function() {
  var Step = ENJ.Step;
  var Tween = CreateJS.Tween;

  var base = Step.prototype;

  function Step_AddWaterToCentrifugeTube() {
    Step.apply(this, arguments);
  }

  ENJ.defineClass({

    constructor: Step_AddWaterToCentrifugeTube, extend: Step,

    start: function() {
      base.start.call(this);

      var scene = this.lab.getScene(), store = this.store, self = this;

      var platformScale = this.platformScale =  scene.platformScale;
      var waterBottle = this.waterBottle = scene.waterBottle;

      this.onClick = this.onClick.bind(this);
      this.flags = [];
        

      Tween.get(waterBottle)
        .to({x: 720, y: 200}, 500)
        .call(function() {
          if (store.autoPlay) {
            self.startDumping();
          } else {
            waterBottle.cursor = 'pointer';
            waterBottle.addEventListener('click', self.onClick);
          }
        });
    },

    onClick: function() {
      this.waterBottle.removeEventListener('click', this.onClick);
      this.waterBottle.cursor = 'auto';
      this.startDumping();
    },

    startDumping: function() {
      var waterBottle = this.waterBottle, self = this;

      Tween.get(waterBottle)
        .to({x: 700, rotation: -15}, 500)
        .call(function() {
          self.flags[0] = true;
          waterBottle.start();
        });
        //.wait(3000)
        //.call(this.stopDumping.bind(this));
    },

    stopDumping: function() {
      var waterBottle = this.waterBottle;

      this.flags[0] = false;
      waterBottle.stop();

      Tween.get(waterBottle)
        .to({
          rotation: 0,
          x: waterBottle.location.x,
          y: waterBottle.location.y
        }, 500)
        .call(this.stop.bind(this));
    },

    update: function(event) {
      var platformScale = this.platformScale, store = this.store;

      if (this.flags[0]) {
        var delta = event.delta*0.1;

        var weight = platformScale.weight;

        if (weight >= store.targetWeight) {
          this.stopDumping();
          platformScale.save({weight: store.targetWeight});
        } else {
          platformScale.save({weight: weight + delta});
        }
      }
    }

  });

  ENJ.Step_AddWaterToCentrifugeTube = Step_AddWaterToCentrifugeTube;

})();

//##############################################################################
// src/steps/Step_CorrectSpectrophotometer.js
//##############################################################################
(function() {
  var Step = ENJ.Step;
  var Tween = CreateJS.Tween;

  var base = Step.prototype;

  function Step_CorrectSpectrophotometer() {
    Step.apply(this, arguments);
  }

  ENJ.defineClass({

    constructor: Step_CorrectSpectrophotometer, extend: Step,

    start: function() {
      base.start.call(this);

      var scene = this.lab.getScene();
      var indices = this.store.indices;
      var cuvettes = scene.cuvettes;
      var spectrophotometer = this.spectrophotometer = scene.spectrophotometer;//, liquid = scene.liquid;

      spectrophotometer.addEventListener('click', this.stop.bind(this));
      spectrophotometer.cursor = 'pointer';
      spectrophotometer.start();

      for (var i = 0; i < indices.length; ++i) {
        var cuvette = cuvettes[indices[i]];
        if (cuvette) {
          cuvette.visible = false;
        }
      }
    },

    stop: function() {
      var spectrophotometer = this.spectrophotometer;
      spectrophotometer.removeAllEventListeners();
      //spectrophotometer.save({grade: 0});
      spectrophotometer.correct();
      spectrophotometer.cursor = 'auto';
      base.stop.call(this);
    }

  });

  ENJ.Step_CorrectSpectrophotometer = Step_CorrectSpectrophotometer;

})();

//##############################################################################
// src/steps/Step_ResetSpectrophotometer.js
//##############################################################################
(function() {
  var Step = ENJ.Step;
  var Tween = CreateJS.Tween;

  var base = Step.prototype;

  function Step_ResetSpectrophotometer() {
    Step.apply(this, arguments);
  }

  ENJ.defineClass({

    constructor: Step_ResetSpectrophotometer, extend: Step,

    start: function() {
      base.start.call(this);

      var scene = this.lab.getScene();
      var indices = this.store.indices;
      var cuvettes = scene.cuvettes;
      var spectrophotometer = this.spectrophotometer = scene.spectrophotometer;//, liquid = scene.liquid;

      spectrophotometer.addEventListener('click', this.stop.bind(this));
      spectrophotometer.cursor = 'pointer';
      spectrophotometer.stop();

      for (var i = 0; i < indices.length; ++i) {
        var cuvette = cuvettes[indices[i]];
        cuvette.visible = true;
        Tween.get(cuvette)
          .wait(200*i)
          .to({
            x: 650, y: 200
          }, 500)
          .to({
            x: 1000
          }, 500);
      }
    },

    stop: function() {
      var spectrophotometer = this.spectrophotometer;
      spectrophotometer.removeAllEventListeners();
      spectrophotometer.save({grade: 0});
      spectrophotometer.cursor = 'auto';
      base.stop.call(this);
    }

  });

  ENJ.Step_ResetSpectrophotometer = Step_ResetSpectrophotometer;

})();

//##############################################################################
// src/steps/Step_MeasureLuminosity.js
//##############################################################################
(function() {
  var Step = ENJ.Step;
  var Tween = CreateJS.Tween;

  var base = Step.prototype;

  function Step_MeasureLuminosity() {
    Step.apply(this, arguments);
  }

  ENJ.defineClass({

    constructor: Step_MeasureLuminosity, extend: Step,

    start: function() {
      base.start.call(this);

      var scene = this.lab.getScene();

      var spectrophotometer = this.spectrophotometer = scene.spectrophotometer;//, liquid = scene.liquid;

      spectrophotometer.addEventListener('click', this.onClick.bind(this));
      spectrophotometer.cursor = 'pointer';

      spectrophotometer.start();
    },

    stop: function() {
      var spectrophotometer = this.spectrophotometer;

      spectrophotometer.removeAllEventListeners();
      spectrophotometer.cursor = 'auto';
      base.stop.call(this);
    },

    onClick: function() {
      var store = this.store, spectrophotometer = this.spectrophotometer;
      var grade = spectrophotometer.grade;
      spectrophotometer.save({
        grade: grade+1,
        luminosity: store.luminosities[grade]
      });
      if (grade+1 >= store.luminosities.length) {
        this.stop();
      }
    }

  });

  ENJ.Step_MeasureLuminosity = Step_MeasureLuminosity;

})();

//##############################################################################
// src/steps/Step_Centrifuging.js
//##############################################################################
(function() {
  var Step = ENJ.Step;
  var Tween = CreateJS.Tween;

  var base = Step.prototype;

  function Step_Centrifuging() {
    Step.apply(this, arguments);
  }

  ENJ.defineClass({

    constructor: Step_Centrifuging, extend: Step,

    start: function() {
      base.start.call(this);

      var scene = this.lab.getScene(), self = this;

      var containers = scene.containers, centrifuge = scene.centrifuge;

      Tween.get(containers[0])
        .wait(500)
        .to({x: 400, y: 200}, 500)
        .to({x: 400, y: 220}, 1000);

      Tween.get(containers[1])
        .wait(500)
        .to({x: 500, y: 200}, 500)
        .to({x: 500, y: 220}, 1000);

      Tween.get(centrifuge)
        .wait(2000)
        .call(function() {
          containers[0].visible = false;
          containers[1].visible = false;
          centrifuge.save({mode: 2, number: 4000, open: false});
        })
        .wait(5000)
        .call(function() {
          centrifuge.save({mode: 1, number: 10});
        })
        .wait(5000)
        .call(this.stop.bind(this));
    }
  });

  ENJ.Step_Centrifuging = Step_Centrifuging;

})();

//##############################################################################
// src/steps/Step_FinishCentrifuging.js
//##############################################################################
(function() {
  var Step = ENJ.Step,
    Tween = CreateJS.Tween;

  var base = Step.prototype;

  function Step_FinishCentrifuging() {
    Step.apply(this, arguments);
  }

  ENJ.defineClass({
    constructor: Step_FinishCentrifuging, extend: Step,

    start: function() {
      base.start.call(this);
      var self = this, store = this.store, scene = this.lab.getScene(), board = this.lab.blackBoard;

      board.save({'title': store.title});
      board.visible = true;
      board.alpha = 1.0;
      Tween.get(board)
        //.to({ alpha: 1.0 }, 500)
        .wait(1000)
        .to({ alpha: 0.0 }, 500)
        .call(function() {
          board.visible = false;
          //self.stop();
        });

      var centrifuge = scene.centrifuge;
      centrifuge.save({mode: 0, number: 0, open: true});

      var centrifugeTubes = scene.centrifugeTubes;

      scene.addChild(centrifugeTubes[0], centrifugeTubes[1]);

      centrifugeTubes[0].save({color: 0x33ffff00});
      centrifugeTubes[0].set({x: 520, y: 220});
      Tween.get(centrifugeTubes[0])
        .wait(1500)
        //.to({x: 500, y: 200}, 500)
        .to({x: 700, y: 200}, 500)
        /*.call(this.stop.bind(this))*/;

      centrifugeTubes[1].set({x: 420, y: 220});
      Tween.get(centrifugeTubes[1])
        .wait(1500)
        //.to({x: 500, y: 200}, 500)
        .to({x: 200, y: 200}, 500)
        .call(this.stop.bind(this));
      

    },

    stop: function() {
      base.stop.call(this);
    }
  });

  ENJ.Step_FinishCentrifuging = Step_FinishCentrifuging;

})();

//##############################################################################
// src/steps/Step_RecycleToDish.js
//##############################################################################
(function() {
  var Step = ENJ.Step;
  var Tween = CreateJS.Tween;

  var base = Step.prototype;

  function Step_RecycleToDish() {
    Step.apply(this, arguments);
  }

  ENJ.defineClass({

    constructor: Step_RecycleToDish, extend: Step,

    start: function() {
      base.start.call(this);

      var scene = this.lab.getScene();
      var indices = this.store.indices;
      var cuvettes = scene.cuvettes;
      var dishes = scene.dishes;//, liquid = scene.liquid;
      var tubes = scene.tubes;//, liquid = scene.liquid;
      var spectrophotometer = this.spectrophotometer = scene.spectrophotometer;//, liquid = scene.liquid;

      spectrophotometer.save({grade: 0});
      spectrophotometer.stop();
      cuvettes[0].visible = true;
      cuvettes[1].visible = true;
      cuvettes[2].visible = true;

      Tween.get(tubes[1])
        .to({
          y: 150
        }, 500)
        .call(function() {
          tubes[1].start();
        })
        .to({
          x: 520, y: 240, rotation: 30
        }, 500)
        .wait(1000)
        .to({
          rotation: 105
        }, 250)
        .call(function() {
          tubes[1].save({volume: 0});
        })
        .wait(1000)
        .to({
          x: tubes[1].location.x, y: 150, rotation: 0
        }, 500)
        .to({
          y: tubes[1].location.y
        }, 500)
        .call(function() {
          tubes[1].stop();
        })
        .wait(1000)
        .call(this.stop.bind(this));

      Tween.get(cuvettes[1])
        .to({
          y: 200
        }, 500)
        .to({
          x: 580, y: 240, rotation: -30
        }, 500)
        .wait(1000)
        .to({
          rotation: -105
        }, 250)
        .call(function() {
          cuvettes[1].save({volume: 0});
        })
        .wait(1000)
        .to({
          rotation: 0
        }, 500);

      //Tween.get(cuvettes[2])
      //  .wait(2000)
      //  .to({
      //    x: 650, y: 200
      //  }, 500)
      //  .to({
      //    x: 1000
      //  }, 500);
    },

    stop: function() {

      base.stop.call(this);
    }

  });

  ENJ.Step_RecycleToDish = Step_RecycleToDish;

})();

//##############################################################################
// src/steps/Step_AddEthanolToDish.js
//##############################################################################
(function() {
  var Step = ENJ.Step;
  var Tween = CreateJS.Tween;

  var base = Step.prototype;

  function Step_AddEthanolToDish() {
    Step.apply(this, arguments);
  }

  ENJ.defineClass({

    constructor: Step_AddEthanolToDish, extend: Step,

    start: function() {
      base.start.call(this);

      var scene = this.lab.getScene(), store = this.store, self = this;

      var dish = this.dish =  scene.dish;
      var bottle = this.bottle = scene.bottle;
      var suckPipe = this.suckPipe =  scene.suckPipe;

      this.onClick = this.onClick.bind(this);

      bottle.start();

      Tween.get(suckPipe)
        //.to({x: 50, y: 50, rotation: 0}, 500)
        .to({x: 175, y: 50, rotation: 0}, 500)
        .call(function() {
          suckPipe.cursor = 'pointer';
          suckPipe.addEventListener('click', self.onClick);
        });
    },

    onClick: function() {
      var suckPipe = this.suckPipe, bottle = this.bottle, scene = this.lab.scene;

      suckPipe.removeEventListener('click', this.onClick);
      suckPipe.cursor = 'auto';

      var index = scene.getChildIndex(suckPipe);

      scene.setChildIndex(suckPipe, scene.getChildIndex(bottle));

      Tween.get(suckPipe)
        .to({y: 150}, 500)
        .call(function() {
          suckPipe.save({volume: 2});
        })
        .to({y: 50}, 500)
        .call(function() {
          bottle.stop();
          scene.setChildIndex(suckPipe, index);
        })
        .wait(1000)
        .to({x: 300, y: 200}, 500)
        .wait(1000)
        .call(function() {
          suckPipe.save({volume: 0});
        })
        .wait(1000)
        .to({x: suckPipe.location.x, y: suckPipe.location.y, rotation: -90}, 500)
        .call(this.stop.bind(this));


    },


    update: function(event) {

    }

  });

  ENJ.Step_AddEthanolToDish = Step_AddEthanolToDish;

})();

//##############################################################################
// src/steps/Step_StirringDish_2.js
//##############################################################################
(function() {
  var Step = ENJ.Step;
  var Tween = CreateJS.Tween;

  var base = Step.prototype;

  function Step_StirringDish_2() {
    Step.apply(this, arguments);
  }

  ENJ.defineClass({

    constructor: Step_StirringDish_2, extend: Step,

    start: function() {
      base.start.call(this);

      var scene = this.lab.getScene(), store = this.store, self = this;

      var dish = scene.dish, bar = scene.bar;

      Tween.get(bar)
        .to({
          x: 400, y: 200, rotation: 30
        }, 500)
        .to({
          x: 350, y: 300, rotation: 10
        }, 500)
        .call(function() {
          self.startStirring();
        });

      this.dish = dish;
      this.bar = bar;
      this.flags = [];
    },

    startStirring: function() {

      this.flags[0] = true;

      this.time = 0;

      this.tween =
        Tween.get(this.bar, {loop: true})
          .to({x: 300}, 500)
          .to({x: 350}, 500);
    },

    stopStirring: function() {
      var bar = this.bar;

      this.flags[0] = false;

      Tween.get(bar)
        .to({
          x: 400, y: 200, rotation: 30
        }, 500)
        .to({
          x: bar.location.x, y: bar.location.y, rotation: 80
        }, 500).call(this.stop.bind(this));
    },

    update: function(event) {
      //var dish = this.dish;

      if (this.flags[0]) {
        this.time += event.delta;

        if (this.time > 10000) {
          this.tween.setPaused(true);
          this.stopStirring();

        }
      }
    }

  });

  ENJ.Step_StirringDish_2 = Step_StirringDish_2;

})();

//##############################################################################
// src/steps/Step_DumpToBeaker_2.js
//##############################################################################
(function() {
  var Step = ENJ.Step;
  var Tween = CreateJS.Tween;

  var base = Step.prototype;

  function Step_DumpToBeaker_2() {
    Step.apply(this, arguments);
  }

  ENJ.defineClass({

    constructor: Step_DumpToBeaker_2, extend: Step,

    start: function() {
      base.start.call(this);

      var scene = this.lab.getScene(), store = this.store, self = this;

      var beaker = scene.beaker, flask = scene.flask;

      if ('color' in store) {
        beaker.save({color: store.color});
      }


      var onClick = this.onClick = this.onClick.bind(this);

      flask.start();
      Tween.get(flask)
        .to({
          x: 640, y: 320, rotation: -60
        }, 500)
        .call(function() {
          if (store.autoPlay) {
            self.startDumping();
          } else {
            flask.addEventListener('click', onClick);
            flask.cursor = "pointer";
          }
        });

      this.beaker = beaker;
      this.flask = flask;
      this.flags = [];
    },

    onClick: function() {
      var flask = this.flask, store = this.store;

      flask.removeEventListener('click', this.onClick);
      flask.cursor = "auto";
      //var self = this;
      this.startDumping();

    },

    startDumping: function() {
      var flask = this.flask, store = this.store;

      this.flags[0] = true;

      Tween.get(flask)
        .to({
          y: 335, rotation: -70//store.targetAngle
        }, 500);
    },

    stopDumping: function() {
      this.flags[0] = false;

      var flask = this.flask;

      flask.stop();
      Tween.get(flask)
        .to({
          x: flask.location.x, y: flask.location.y, rotation: 0
        }, 500).call(this.stop.bind(this));
    },

    stop: function() {


      base.stop.call(this);
    },

    update: function(event) {
      var beaker = this.beaker, flask = this.flask;

      flask.refresh();

      if (this.flags[0]) {
        var delta = event.delta/1000*10;

        var volume = flask.volume;

        if (beaker.volume >= 10) {
          //this.stopDumping();
          //funnel.save({volume: 0});
          //flask.toggle();

          this.stopDumping();
        } else {
          beaker.save({volume: beaker.volume + delta});
          flask.save({volume: volume - delta});
        }
      }
    }

  });

  ENJ.Step_DumpToBeaker_2 = Step_DumpToBeaker_2;

})();

//##############################################################################
// src/steps/Step_DipCapillary.js
//##############################################################################
(function() {
  var Step = ENJ.Step;
  var Tween = CreateJS.Tween;

  var base = Step.prototype;

  function Step_DipCapillary() {
    Step.apply(this, arguments);
  }

  ENJ.defineClass({

    constructor: Step_DipCapillary, extend: Step,

    start: function() {
      base.start.call(this);

      var scene = this.lab.getScene(), store = this.store;

      var container = scene[store.containerId], capillary = scene.capillary, cap1 = scene.cap1;

      if (!capillary.visible) {
        Tween.get(cap1)
          .to({
            x: cap1.location.x + 50, y: cap1.location.y - 50, rotation: 30
          }, 500)
          .call(function() {
            capillary.visible = true;
          })
          .wait(1000)
          .to({
            x: cap1.location.x, y: cap1.location.y, rotation: 0
          }, 500);

        Tween.get(capillary)
          .wait(500)
          .to({
            y: capillary.location.y - 100
          }, 500)
      }

      Tween.get(capillary)
        .wait(1000)
        .to({
          x: container.x + 30, y: container.y - 10
        }, 500)
        .wait(1000)
        .to({
          y: container.y + 50
        }, 500)
        .call(function() {
          capillary.save({volume: 1});
        })
        .to({
          x: container.x + 20, y: container.y - 10
        }, 500)
        .call(this.stop.bind(this));
    }
  });

  ENJ.Step_DipCapillary = Step_DipCapillary;

})();

//##############################################################################
// src/steps/Step_SpotSample.js
//##############################################################################
(function() {
  var Step = ENJ.Step;
  var Tween = CreateJS.Tween;

  var base = Step.prototype;

  function Step_SpotSample() {
    Step.apply(this, arguments);
  }

  ENJ.defineClass({
    constructor: Step_SpotSample, extend: Step,

    start: function() {
      base.start.call(this);

      var scene = this.lab.getScene(), store = this.store, self = this;

      var capillary = scene.capillary, paper = scene.paper, point = store.point;

      paper.save({index: store.index});

      Tween.get(capillary)
        .to({
          x: point.x - 2, y: point.y - 10
        }, 500)
        .wait(1000)
        .to({
          x: point.x, y: point.y
        }, 500)
        .call(function() {
          capillary.save({volume: capillary.volume - 0.125});
          paper.save({amount: paper.amount + 0.125});
        })
        .wait(1000)
        .to({
          x: point.x - 2, y: point.y - 10
        }, 500)
        //.wait(1000)
        .to({
          x: point.x, y: point.y
        }, 500)
        .call(function() {
          capillary.save({volume: capillary.volume - 0.125});
          paper.save({amount: paper.amount + 0.125});
        })
        .wait(1000)
        .to({
          x: point.x - 30, y: point.y - 20
        }, 500)
        .call(function() {
          if (store.last) {
            capillary.x = capillary.location.x;
            capillary.y = capillary.location.y;
            capillary.visible = false;
          }
          self.stop();
        });

    }
  });

  ENJ.Step_SpotSample = Step_SpotSample;

})();

//##############################################################################
// src/steps/Step_BlowSample.js
//##############################################################################
(function() {
  var Step = ENJ.Step;
  var Tween = CreateJS.Tween;

  var base = Step.prototype;

  function Step_BlowSample() {
    Step.apply(this, arguments);
  }

  ENJ.defineClass({
    constructor: Step_BlowSample, extend: Step,

    start: function() {
      base.start.call(this);

      var scene = this.lab.getScene(), store = this.store;

      var hairDrier = scene.hairDrier, paper = scene.paper, point = store.point;

      Tween.get(hairDrier)
        .to({
          x: point.x + 20, y: point.y - 20, rotation: -20
        }, 500)
        .to({
          y: point.y - 10
        }, 2000)
        .to({
          y: point.y - 20
        }, 2000)
        .to({
          y: point.y - 10
        }, 2000)
        .to({
          x: hairDrier.location.x, y: hairDrier.location.y, rotation: 0
        }, 500)
        .call(this.stop.bind(this));

    }
  });

  ENJ.Step_BlowSample = Step_BlowSample;

})();

//##############################################################################
// src/steps/Step_DumpToDish.js
//##############################################################################
(function() {
  var Step = ENJ.Step;
  var Tween = CreateJS.Tween;

  var base = Step.prototype;

  function Step_DumpToDish() {
    Step.apply(this, arguments);
  }

  ENJ.defineClass({

    constructor: Step_DumpToDish, extend: Step,

    start: function() {
      base.start.call(this);

      var scene = this.lab.getScene(), store = this.store, self = this;

      var centrifugeTube = scene.centrifugeTube, dish = scene.dish;

      centrifugeTube.cursor = "pointer";

      var onClick = this.onClick = this.onClick.bind(this);

      Tween.get(centrifugeTube)
        .to({
          x: 340, y: 250, rotation: -45
        }, 500)
        .call(function() {

          if (store.autoPlay) {
            self.startDumping();
          } else {
            centrifugeTube.addEventListener('click', onClick);
          }
        });

      this.centrifugeTube = centrifugeTube;
      this.dish = dish;
      this.flags = [];
    },

    onClick: function() {
      var centrifugeTube = this.centrifugeTube, store = this.store;

      centrifugeTube.removeEventListener('click', this.onClick);

      //var self = this;
      this.startDumping();

    },

    startDumping: function() {
      var centrifugeTube = this.centrifugeTube, store = this.store;

      this.flags[0] = true;

      centrifugeTube.start();
      Tween.get(centrifugeTube)
        //.to({
        //  /*x: 520, y: 150, */rotation: 30
        //}, 500)
        .to({
          /*x: 520, y: 150, */rotation: -90//store.targetAngle
        }, 1000);
    },

    stopDumping: function() {
      this.flags[0] = false;

      var centrifugeTube = this.centrifugeTube;

      centrifugeTube.cursor = "auto";

      centrifugeTube.stop();
      Tween.get(centrifugeTube)
        .to({
          x: 500, y: 300, alpha: 0, rotation: 0
        }, 500).call(this.stop.bind(this));
    },

    stop: function() {


      base.stop.call(this);
    },

    update: function(event) {
      var centrifugeTube = this.centrifugeTube, dish = this.dish;

      centrifugeTube.refresh();

      if (this.flags[0]) {
        var delta = event.delta/1000*30;

        var volume = centrifugeTube.volume;

        if (volume <= 0 /*this.store.targetVolume*/) {
          //this.stopDumping();
          //dish.save({volume: 0});
          //cylinder.toggle();

          this.stopDumping();
        } else {
          centrifugeTube.save({volume: volume - delta});
          //dish.save({volume: dish.volume + delta});
        }
      }
    }

  });

  ENJ.Step_DumpToDish = Step_DumpToDish;

})();

//##############################################################################
// src/steps/Step_HeatingBeakerAndDish.js
//##############################################################################
(function() {
  var Step = ENJ.Step;
  var Tween = CreateJS.Tween;

  var base = Step.prototype;

  function Step_HeatingBeakerAndDish() {
    Step.apply(this, arguments);
  }

  ENJ.defineClass({
    constructor: Step_HeatingBeakerAndDish, extend: Step,

    start: function() {
      base.start.call(this);

      var scene = this.lab.getScene(), store = this.store;

      var layer = scene.layer, inductionCooker = scene.inductionCooker;

      this.flags = [];

      this.onClick = this.onClick.bind(this);
      inductionCooker.cursor = 'pointer';
      inductionCooker.addEventListener('click', this.onClick);

      this.layer = layer;
      this.inductionCooker = inductionCooker;
    },

    stop: function() {
      this.inductionCooker.removeEventListener('click', this.onClick);
      this.inductionCooker.cursor = 'auto';
      base.stop.call(this);
    },

    update: function(event) {
      var flags = this.flags;

      if (flags[0] && !flags[3]) {
        this.time += event.delta;
        if (this.time > 5000 && !flags[1]) {
          flags[1] = true;
          this.inductionCooker.cursor = 'pointer';

          var board = this.lab.blackBoard, store = this.store, layer = this.layer;

          layer.visible = true;

          board.save({'title': store.title});
          board.visible = true;
          board.alpha = 1.0;
          Tween.get(board)
            //.to({ alpha: 1.0 }, 500)
            .wait(1000)
            .to({ alpha: 0.0 }, 500)
            .call(function() {
              board.visible = false;
              flags[2] = true;
            });
        }
      }

    },

    startHeating: function() {
      this.time = 0;
      this.flags[0] = true;
      this.inductionCooker.start();
    },

    stopHeating: function() {
      //this.flags[0] = false;
      this.flags[3] = true;
      this.inductionCooker.stop();

      this.stop();
    },

    onClick: function() {

      //this.startShaking();


      if (!this.flags[2]) {
        this.inductionCooker.cursor = 'auto';
        this.startHeating();
      } else {
        this.stopHeating();
      }

    }
  });

  ENJ.Step_HeatingBeakerAndDish = Step_HeatingBeakerAndDish;

})();

//##############################################################################
// src/steps/Step_ClipPaper.js
//##############################################################################
(function() {
  var Step = ENJ.Step;
  var Tween = CreateJS.Tween;

  var base = Step.prototype;

  function Step_ClipPaper() {
    Step.apply(this, arguments);
  }

  ENJ.defineClass({
    constructor: Step_ClipPaper, extend: Step,

    start: function() {
      base.start.call(this);

      var scene = this.lab.getScene(), store = this.store, self = this;

      var paper = scene.paper, nodes = scene.nodes, clipWithRope = scene.clipWithRope;

      this.flags = [];
      this.paper = paper;
      this.nodes = nodes;
      this.clipWithRope = clipWithRope;

      this.flags[0] = true;
    },

    clip: function() {
      var self = this, nodes = this.nodes, flags = this.flags;

      flags[1] = true;
      Tween.get(nodes[0])
        .to({x: 455, y: 170}, 500);
      Tween.get(nodes[1])
        .to({x: 425, y: 225}, 550)
        .to({x: 390, y: 150}, 500)
        .call(function() {
          flags[1] = false;
          self.dip();
        })
    },

    dip: function() {
      var scene = this.lab.getScene(), nodes = this.nodes, flags = this.flags;

      flags[2] = true;

      var stop = this.stop.bind(this);
      var cap2 = scene.cap2;

      Tween.get(cap2)
        .wait(1000)
        .to({rotation: 180, x: 1100, y: 500}, 500)
        .call(function() {
          Tween.get(nodes[0])
            .to({x: 800, y: -200}, 500)
            .to({x: 800, y: 125}, 2000);
          Tween.get(nodes[1])
            .to({x: 700, y: 50}, 500)
            .wait(2000)
            .to({x: 700, y: 100}, 500)
            .call(function() {
              Tween.get(cap2)
                .wait(1000)
                .to({rotation: 0, x: cap2.location.x, y: cap2.location.y}, 500)
                .call(stop);
            });
        });
    },

    update: function(event) {
      var paper = this.paper, nodes = this.nodes, flags = this.flags;

      if (flags[0]) {
        paper.save({dxy: [paper.dxy[0] - event.delta * 0.02, paper.dxy[1] - event.delta * 0.2]});
        if (paper.dxy[0] <= 0 ) {
          flags[0] = false;
          this.clip();
        }
      }

      if (flags[1] || flags[2]) {
        this.clipWithRope.update(nodes[0].x, nodes[0].y, nodes[1].x, nodes[1].y);
      }

      if (flags[2]) {
        paper.x = nodes[0].x - 55;
        paper.y = nodes[0].y + 30;
      }

      if (flags[3]) {
        this.stop();
      }
    }
  });

  ENJ.Step_ClipPaper = Step_ClipPaper;

})();

//##############################################################################
// src/steps/Step_RecordResults.js
//##############################################################################
(function() {
  var Step = ENJ.Step;
  //var Tween = CreateJS.Tween;

  var base = Step.prototype;

  function Step_RecordResults() {
    Step.apply(this, arguments);
  }

  ENJ.defineClass({

    constructor: Step_RecordResults, extend: Step,

    start: function() {
      base.start.call(this);

      var store = this.store;
      var scene = this.lab.getScene();
      var reporter = this.reporter = scene.reporter;//, liquid = scene.liquid;

      this.onClose = this.onClose.bind(this);


      reporter.save(store);
      reporter.visible = true;

      reporter.addEventListener('close', this.onClose)

    },

    onClose: function() {
      this.reporter.removeEventListener('close', this.onClose);
      this.reporter.visible = false;
      this.stop();
    },

    stop: function() {

      base.stop.call(this);
    }

  });

  ENJ.Step_RecordResults = Step_RecordResults;

})();

//######################################################################################################################
//######################################################################################################################
(function() {
  var EventDispatcher = CreateJS.EventDispatcher;

  function Script(lab) {
    EventDispatcher.call(this);

    this.register();

    this.lab = lab;

    this.ready();
  }

  ENJ.defineClass({
    /**
     * @class Script
     * @extends EventDispatcher
     * @constructor
     */
    constructor: Script, extend: EventDispatcher,
    ///**
    // * @property numSteps
    // * @type {Number}
    // */
    //get numSteps() {
    //  return this.currentIndex + 1;
    //},
    /**
     * Register somethings.
     *
     * @method register
     */
    register: function() {
      this.lab = null;

      this.steps = null;
      this.stores = null;

      this.currentStep = null;
      this.currentIndex = 0;

      this.update = this.update.bind(this);
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
      this.step(0);
      this.lab.addEventListener('tick', this.update);
    },

    /**
     * @method stop
     */
    stop: function() {
      this.lab.removeEventListener('tick', this.update);
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
      //console.log(StepClass);
      currentStep = new StepClass({
        lab: this.lab,
        //scene: this.lab.getScene(),
        store: this.stores[currentIndex]
      });

      var tip = this.tips[currentIndex];
      if (tip) {
        this.lab.tip.text = '提示：' + tip;
      } /*else {
        this.lab.tip.text = '';
      }*/

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

  ENJ.Script = Script;
})();

//######################################################################################################################
// src/scripts/Script_10.js
//######################################################################################################################
(function() {
  var Script = ENJ.Script;

  function Script_10(lab) {
    Script.call(this, lab);
    //
    ////this.lab = lab;
    //
    //this.register();
    //this.ready();
  }

  ENJ.defineClass({
    /**
     * @class Script
     * @extends EventDispatcher
     * @constructor
     */
    constructor: Script_10, extend: Script,


    ready: function() {
      var i, n, config, configs, steps = [], stores = [], tips = [];

      configs  = [
        //
        [ENJ.Step_Interlude_1, { title: "称取第一份样品" }, ''],
        [ENJ.Step_WeightingSugarBalls, { }, '称取约10g左右的糖球'],
        [ENJ.Step_Interlude_1, { title: "称取第二份样品" }, ''],
        [ENJ.Step_WeightingSugarBalls, {autoPlay: true }, '称取约10g左右的糖球'],

        //
        [ENJ.Step_Interlude_2, { no: 2, title: "浸洗柠檬黄色素" }, ''],
        [ENJ.Step_DumpWaterToCylinder, { angleFrom: -30, angleTo: -45 }, '量取30ml热水'],
        [ENJ.Step_DumpWaterToBeaker, { beakerId: 0 }, '倒入小烧杯中'],
        [ENJ.Step_DumpWaterToCylinder, { angleFrom: -40, angleTo: -50 }, '量取30ml热水'],
        [ENJ.Step_DumpWaterToBeaker, { beakerId: 1 }, '倒入另一个小烧杯中'],
        [ENJ.Step_PickSugarBall, { beakerId: 1 }, '取一颗糖球，放入小烧杯中'],
        [ENJ.Step_DipSugarBall, { beakerId: 1 }, '摇晃烧杯，浸洗糖球'],
        [ENJ.Step_PickSugarBall_2, {}, '将糖球移入另一个小烧杯中'],
        [ENJ.Step_DipSugarBall, { beakerId: 0 }, '摇晃烧杯，浸洗糖球'],
        [ENJ.Step_PickSugarBall_3, {}, '取出糖球并扔掉'],
        [ENJ.Step_PickSugarBall, { beakerId: 1 }, '取一颗糖球，放入小烧杯中'],
        [ENJ.Step_DipSugarBall, { beakerId: 1, autoPlay: true }, '摇晃烧杯，浸洗糖球'],
        [ENJ.Step_PickSugarBall_2, {}, '将糖球移入另一个小烧杯中'],
        [ENJ.Step_DipSugarBall, { beakerId: 0, autoPlay: true }, '摇晃烧杯，浸洗糖球'],
        [ENJ.Step_PickSugarBall_3, {}, '取出糖球并扔掉'],
        [ENJ.Step_PickSugarBall, { beakerId: 1 }, '取一颗糖球，放入小烧杯中'],
        [ENJ.Step_DipSugarBall, { beakerId: 1, autoPlay: true }, '摇晃烧杯，浸洗糖球'],
        [ENJ.Step_PickSugarBall_2, {}, '将糖球移入另一个小烧杯中'],
        [ENJ.Step_DipSugarBall, { beakerId: 0, autoPlay: true }, '摇晃烧杯，浸洗糖球'],
        [ENJ.Step_PickSugarBall_3, {}, '取出糖球并扔掉'],
        [ENJ.Step_PickSugarBall, { beakerId: 1 }, '取一颗糖球，放入小烧杯中'],
        [ENJ.Step_DipSugarBall, { beakerId: 1, autoPlay: true }, '摇晃烧杯，浸洗糖球'],
        [ENJ.Step_PickSugarBall_2, {}, '将糖球移入另一个小烧杯中'],
        [ENJ.Step_DipSugarBall, { beakerId: 0, autoPlay: true }, '摇晃烧杯，浸洗糖球'],
        [ENJ.Step_PickSugarBall_3, {}, '取出糖球并扔掉'],
        [ENJ.Step_PickSugarBall, { beakerId: 1 }, '取一颗糖球，放入小烧杯中'],
        [ENJ.Step_DipSugarBall, { beakerId: 1, autoPlay: true }, '摇晃烧杯，浸洗糖球'],
        [ENJ.Step_PickSugarBall_2, {}, '将糖球移入另一个小烧杯中'],
        [ENJ.Step_DipSugarBall, { beakerId: 0, autoPlay: true }, '摇晃烧杯，浸洗糖球'],
        [ENJ.Step_PickSugarBall_3, {}, '取出糖球并扔掉'],
        [ENJ.Step_PickSugarBall, { beakerId: 1 }, '取一颗糖球，放入小烧杯中'],
        [ENJ.Step_DipSugarBall, { beakerId: 1, autoPlay: true }, '摇晃烧杯，浸洗糖球'],
        [ENJ.Step_PickSugarBall_2, {}, '将糖球移入另一个小烧杯中'],
        [ENJ.Step_DipSugarBall, { beakerId: 0, autoPlay: true }, '摇晃烧杯，浸洗糖球'],
        [ENJ.Step_PickSugarBall_3, {}, '取出糖球并扔掉'],
        [ENJ.Step_PickSugarBall, { beakerId: 1 }, '取一颗糖球，放入小烧杯中'],
        [ENJ.Step_DipSugarBall, { beakerId: 1, autoPlay: true }, '摇晃烧杯，浸洗糖球'],
        [ENJ.Step_PickSugarBall_2, {}, '将糖球移入另一个小烧杯中'],
        [ENJ.Step_DipSugarBall, { beakerId: 0, autoPlay: true }, '摇晃烧杯，浸洗糖球'],
        [ENJ.Step_PickSugarBall_3, {}, '取出糖球并扔掉'],[ENJ.Step_PickSugarBall, { beakerId: 1 }, '取一颗糖球，放入小烧杯中'],
        [ENJ.Step_DipSugarBall, { beakerId: 1, autoPlay: true }, '摇晃烧杯，浸洗糖球'],
        [ENJ.Step_PickSugarBall_2, {}, '将糖球移入另一个小烧杯中'],
        [ENJ.Step_DipSugarBall, { beakerId: 0, autoPlay: true }, '摇晃烧杯，浸洗糖球'],
        [ENJ.Step_PickSugarBall_3, {}, '取出糖球并扔掉'],
        [ENJ.Step_MergeEluent, {}, '合并洗脱液'],

        //
        [ENJ.Step_Interlude_2, { no: 3, title: "加热样品，加入聚酰胺粉" }, ''],
        [ENJ.Step_DropToBeaker, {  }, '滴入20%柠檬酸溶液'],
        [ENJ.Step_TestPH, {  }, '用玻棒沾取浸洗液滴在PH试纸测试'],
        [ENJ.Step_HeatingBeaker, {  }, '样品加热至70℃左右'],
        [ENJ.Step_WeightingPowder, {}, '称取1克左右的聚酰胺粉'],
        [ENJ.Step_AddPowder, {}, '向烧杯中加入聚酰胺粉'],

        //
        [ENJ.Step_Interlude_2, { no: 4, title: "洗脱柠檬黄色素" }, ''],
        [ENJ.Step_DumpToFunnel, { targetAngle: 60, targetVolume: 30 }, '倒入部分样品到砂芯漏斗中'],
        [ENJ.Step_DropToTube, {display: true}, '进行洗脱'],
        [ENJ.Step_DumpToFunnel, { targetAngle: 60, targetVolume: 30, autoPlay: true }, '倒入余下样品到砂芯漏斗中'],
        [ENJ.Step_DropToTube, {autoPlay: true }, '进行洗脱'],
        [ENJ.Step_EmptyTube, { }, '倒掉具支试管中的流出液'],

        [ENJ.Step_DumpToCylinder_1, { targetAngle: 60}, '量取20ml的70℃、PH为4的水'],
        [ENJ.Step_DumpToBeaker, { targetAngle: -85, color: 0x22ffffff}, '倒入到烧杯中'],
        [ENJ.Step_StirringBeaker, {}, '搅拌一下'],
        [ENJ.Step_DumpToFunnel, { targetAngle: 60, targetVolume: 30, autoPlay: true }, '倒入到砂芯漏斗中'],
        [ENJ.Step_DropToTube, {color: 0x66ffffff, autoPlay: true }, '进行洗脱'],
        [ENJ.Step_DumpToCylinder_1, { targetAngle: 60, autoPlay: true}, '量取20ml的70℃、PH为4的水'],
        [ENJ.Step_DumpToBeaker, { targetAngle: -85, color: 0x22ffffff, autoPlay: true}, '倒入到烧杯中'],
        [ENJ.Step_StirringBeaker, {}, '搅拌一下'],
        [ENJ.Step_DumpToFunnel, { targetAngle: 60, targetVolume: 30, autoPlay: true }, '倒入到砂芯漏斗中'],
        [ENJ.Step_DropToTube, {color: 0x66ffffff, autoPlay: true}, '进行洗脱'],
        [ENJ.Step_EmptyTube, { }, '倒掉具支试管中的流出液'],

        [ENJ.Step_DumpToCylinder_2, { targetAngle: -60}, '量取20ml的PH为4的水'],
        [ENJ.Step_DumpToFunnel_2, { targetAngle: -80 }, '倒入到砂芯漏斗中'],
        [ENJ.Step_DropToTube, { color: 0x22ffff00, autoPlay: true }, '进行洗脱'],
        [ENJ.Step_DumpToCylinder_2, { targetAngle: -60, autoPlay: true}, '量取20ml的PH为4的水'],
        [ENJ.Step_DumpToFunnel_2, { targetAngle: -80, autoPlay: true }, '倒入到砂芯漏斗中'],
        [ENJ.Step_DropToTube, { color: 0x22ffff00, autoPlay: true }, '进行洗脱'],
        [ENJ.Step_TestPH_2, {ph: 5.0}, '测下PH，看是否在6.5~7之间'],
        [ENJ.Step_DumpToCylinder_2, { targetAngle: -60, autoPlay: true}, '量取20ml的PH为4的水'],
        [ENJ.Step_DumpToFunnel_2, { targetAngle: -80, autoPlay: true }, '倒入到砂芯漏斗中'],
        [ENJ.Step_DropToTube, { color: 0x22ffff00, autoPlay: true }, '进行洗脱'],
        [ENJ.Step_TestPH_2, {ph: 7.0}, '测下PH，看是否在6.5~7之间'],
        [ENJ.Step_EmptyTube, { }, '倒掉具支试管中的流出液'],

        [ENJ.Step_DumpToCylinder_3, { targetAngle: -60}, '量取20ml乙醇-氨溶液'],
        [ENJ.Step_DumpToFunnel_2, { targetAngle: -80 }, '倒入到砂芯漏斗中'],
        [ENJ.Step_DropToTube, { color: 0x22ffff00, autoPlay: true }, '进行洗脱'],
        [ENJ.Step_DumpToCylinder_3, { targetAngle: -60, autoPlay: true}, '量取20ml乙醇-氨溶液'],
        [ENJ.Step_DumpToFunnel_2, { targetAngle: -80, autoPlay: true }, '倒入到砂芯漏斗中'],
        [ENJ.Step_DropToTube, { color: 0x11ffff00, autoPlay: true }, '进行洗脱'],
        [ENJ.Step_DumpToCylinder_3, { targetAngle: -60, autoPlay: true}, '量取20ml乙醇-氨溶液'],
        [ENJ.Step_EmptyTube, { }, '倒掉具支试管中的流出液'],
        [ENJ.Step_DumpToFunnel_2, { targetAngle: -80, autoPlay: true }, '倒入到砂芯漏斗中'],
        [ENJ.Step_DropToTube, { color: 0x11ffffff, autoPlay: true }, '进行洗脱'],

        //
        [ENJ.Step_Interlude_2, {no: 5, title: '准备离心' }, ''],
        [ENJ.Step_DumpToCentrifugeTube, {no: 1}, '将具支试管中的流出液倒入离心管中'],
        [ENJ.Step_WeightingCentrifugeTube, {no:1, weight: Math.random()*10}, '放到电子秤上'], //TODO: weight
        [ENJ.Step_AddWaterToCentrifugeTube, {targetWeight: 20}, '加水至g左右'], //TODO: weight
        [ENJ.Step_BalanceTubes, {}, '向另一支离心管中加水至天平平衡'],

        [ENJ.Step_Interlude_2, {no: '5_2', title: '离心' }, ''],
        [ENJ.Step_Centrifuging, {}, '设置离心机4000转每分钟，离心10分钟'],
        [ENJ.Step_FinishCentrifuging, {title: '10分钟后...'}, '取出含样品的离心管'],

        //
        [ENJ.Step_Interlude_2, {no: 6, title: '蒸发' }, ''],
        [ENJ.Step_DumpToDish, {}, '将离心管中的样品倒入蒸发皿中'],
        [ENJ.Step_HeatingBeakerAndDish, {title: '几分钟后...'}, '打开电磁炉加热；几分钟后样品蒸干，关闭电磁炉。'],

        //
        [ENJ.Step_Interlude_2, {no: 7, title: '' }, ''],
        [ENJ.Step_AddWaterToDish, { no: 0 }, '用低于10ml水多次洗涤第一个蒸发皿，合并洗涤液至1号比色管'],
        [ENJ.Step_StirringDish, { no: 0 }, ''],
        [ENJ.Step_DumpToTube, { no: 0, color: 0xffffff00, targetOpacity: 1, targetVolume: 3 }, ''],
        [ENJ.Step_AddWaterToDish, { no: 0, autoPlay: true }, ''],
        [ENJ.Step_ShakeDish, { no: 0 }, ''],
        [ENJ.Step_DumpToTube, { no: 0, color: 0x88ffff00, targetOpacity: 0.5, targetVolume: 6, autoPlay: true }, ''],
        [ENJ.Step_AddWaterToDish, { no: 0, autoPlay: true }, ''],
        [ENJ.Step_ShakeDish, { no: 0 }, ''],
        [ENJ.Step_DumpToTube, { no: 0, color: 0x88ffffff, targetOpacity: 0.25, targetVolume: 9, autoPlay: true }, ''],
        [ENJ.Step_AddWaterToTube, { no: 0, targetVolume: 10 }, '加水至10ml刻度线'],
        [ENJ.Step_ExchangeDishes, {}, ''],
        [ENJ.Step_AddWaterToDish, { no: 1 , autoPlay: true}, '用低于10ml水多次洗涤第二个蒸发皿，合并洗涤液至2号比色管'],
        [ENJ.Step_StirringDish, { no: 1 }, ''],
        [ENJ.Step_DumpToTube, { no: 1, color: 0xffffff00, targetOpacity: 1, targetVolume: 3, autoPlay: true }, ''],
        [ENJ.Step_AddWaterToDish, { no: 1, autoPlay: true }, ''],
        [ENJ.Step_ShakeDish, { no: 1 }, ''],
        [ENJ.Step_DumpToTube, { no: 1, color: 0x88ffff00, targetOpacity: 0.5, targetVolume: 6, autoPlay: true }, ''],
        [ENJ.Step_AddWaterToDish, { no: 1, autoPlay: true }, ''],
        [ENJ.Step_ShakeDish, { no: 1 }, ''],
        [ENJ.Step_DumpToTube, { no: 1, color: 0x88ffffff, targetOpacity: 0.25, targetVolume: 9, autoPlay: true }, ''],
        [ENJ.Step_AddWaterToTube, { no: 1, targetVolume: 10, autoPlay: true }, '加水至10ml刻度线'],

        [ENJ.Step_Interlude_2, { no: 8, title: '标准系列制备' }, ''],
        [ENJ.Step_SuckFromFlask, {}, '取一支干净的移液管，吸取足量的柠檬黄标准溶液'],
        [ENJ.Step_BlowToFlask, {targetVolume: 5}, '留下5.0ml'],
        [ENJ.Step_BlowToTube, {no: 1, targetVolume: 4.5}, '向1号比色管中加入0.5ml的标准溶液'],
        [ENJ.Step_SuckFromFlask, {autoPlay: true}, '取一支干净的移液管，吸取足量的柠檬黄标准溶液'],
        [ENJ.Step_BlowToFlask, {targetVolume: 5, autoPlay: true}, '留下5ml'],
        [ENJ.Step_BlowToTube, {no: 2, targetVolume: 4.0, autoPlay: true}, '向2号比色管中加入1.0ml的标准溶'],
        [ENJ.Step_SuckFromFlask, {autoPlay: true}, '取一支干净的移液管，吸取足量的柠檬黄标准溶液'],
        [ENJ.Step_BlowToFlask, {targetVolume: 5, autoPlay: true}, '留下5ml'],
        [ENJ.Step_BlowToTube, {no: 3, targetVolume: 3.5, autoPlay: true}, '向3号比色管中加入1.5ml的标准溶'],
        [ENJ.Step_SuckFromFlask, {autoPlay: true}, '取一支干净的移液管，吸取足量的柠檬黄标准溶液'],
        [ENJ.Step_BlowToFlask, {targetVolume: 5, autoPlay: true}, '留下5ml'],
        [ENJ.Step_BlowToTube, {no: 4, targetVolume: 3.0, autoPlay: true}, '向4号比色管中加入2.0ml的标准溶'],
        [ENJ.Step_SuckFromFlask, {autoPlay: true}, '取一支干净的移液管，吸取足量的柠檬黄标准溶液'],
        [ENJ.Step_BlowToFlask, {targetVolume: 5, autoPlay: true}, '留下5ml'],
        [ENJ.Step_BlowToTube, {no: 5, targetVolume: 2.5, autoPlay: true, last: true}, '向5号比色管中加入2.5ml的标准溶'],
        //TODO: empty the pipet
        [ENJ.Step_AddWaterToTube, { no: 0 , targetVolume: 10, autoPlay: false}, '全部加水定容至10ml'],
        [ENJ.Step_AddWaterToTube, { no: 1 , targetVolume: 10, autoPlay: true, targetOpacity: 0.30}, ''],
        [ENJ.Step_AddWaterToTube, { no: 2 , targetVolume: 10, autoPlay: true, targetOpacity: 0.35}, ''],
        [ENJ.Step_AddWaterToTube, { no: 3 , targetVolume: 10, autoPlay: true, targetOpacity: 0.40}, ''],
        [ENJ.Step_AddWaterToTube, { no: 4 , targetVolume: 10, autoPlay: true, targetOpacity: 0.45}, ''],
        [ENJ.Step_AddWaterToTube, { no: 5 , targetVolume: 10, autoPlay: true, targetOpacity: 0.50}, ''],

        //
        [ENJ.Step_Interlude_2, {no: 9, title: '标准系列吸光度测定' }, ''],
        [ENJ.Step_DumpToCuvette, { no: 0, targetVolume: 1 }, '向比色皿中加入少量0号比色管中的样品'],
        [ENJ.Step_WashCuvette, { no: 0}, '润洗一下'],
        [ENJ.Step_DumpToCuvette, { no: 0, targetVolume: 2 }, '向比色皿中加入足量1号比色管中的样品'],
        [ENJ.Step_WipeCuvette, { no: 0}, '擦拭比色皿的光滑面'],
        [ENJ.Step_InstallCuvette, { no: 0, ox: 0, oy: 0}, '放入分光光度计的第一个槽中'],
        [ENJ.Step_DumpToCuvette, { no: 1, targetVolume: 1, autoPlay: true }, '向比色皿中加入少量1号比色管中的样品'],
        [ENJ.Step_WashCuvette, { no: 1}, '润洗一下'],
        [ENJ.Step_DumpToCuvette, { no: 1, targetVolume: 2, autoPlay: true }, '向比色皿中加入足量1号比色管中的样品'],
        [ENJ.Step_WipeCuvette, { no: 1}, '擦拭比色皿的光滑面'],
        [ENJ.Step_InstallCuvette, { no: 1, ox: 1, oy: 5}, '放入分光光度计的第二个槽中'],
        [ENJ.Step_DumpToCuvette, { no: 2, targetVolume: 1, autoPlay: true }, '向比色皿中加入少量2号比色管中的样品'],
        [ENJ.Step_WashCuvette, { no: 2}, '润洗一下'],
        [ENJ.Step_DumpToCuvette, { no: 2, targetVolume: 2, autoPlay: true }, '向比色皿中加入足量2号比色管中的样品'],
        [ENJ.Step_WipeCuvette, { no: 2}, '擦拭比色皿的光滑面'],
        [ENJ.Step_InstallCuvette, { no: 2, ox: 2, oy: 10}, '放入分光光度计的第三个槽中'],
        [ENJ.Step_DumpToCuvette, { no: 3, targetVolume: 1, autoPlay: true }, '向比色皿中加入少量3号比色管中的样品'],
        [ENJ.Step_WashCuvette, { no: 3}, '润洗一下'],
        [ENJ.Step_DumpToCuvette, { no: 3, targetVolume: 2, autoPlay: true }, '向比色皿中加入足量3号比色管中的样品'],
        [ENJ.Step_WipeCuvette, { no: 3}, '擦拭比色皿的光滑面'],
        [ENJ.Step_InstallCuvette, { no: 3, ox: 3, oy: 15}, '放入分光光度计的第四个槽中'],
        [ENJ.Step_CorrectSpectrophotometer, {indices:[0,1,2,3]}, '盖上盖子，校准分光光度计'],
        [ENJ.Step_MeasureLuminosity, { luminosities: [0.230, 0.429, 0.643]}, '拉动拉杆，测定吸光度'],
        [ENJ.Step_RecordResults, { A1: 50, A2: 100, A3: 150, Y1: 0.230, Y2: 0.429, Y3: 0.643}, '记录结果'],
        //[ENJ.Step_DumpToCuvette, { no: 0, targetVolume: 1, autoPlay: true }, ''],
        //[ENJ.Step_WashCuvette, { no: 0}, ''],
        //[ENJ.Step_DumpToCuvette, { no: 0, targetVolume: 2, autoPlay: true }, ''],
        //[ENJ.Step_WipeCuvette, { no: 0}, ''],
        //[ENJ.Step_InstallCuvette, { no: 0, ox: 0, oy: 0}, ''],
        [ENJ.Step_ResetSpectrophotometer, {indices:[1,2,3]}, '打开盖子，拿出样品'],
        [ENJ.Step_DumpToCuvette, { no: 4, targetVolume: 1, autoPlay: true }, '向比色皿中加入少量4号比色管中的样品'],
        [ENJ.Step_WashCuvette, { no: 4}, '润洗一下'],
        [ENJ.Step_DumpToCuvette, { no: 4, targetVolume: 2, autoPlay: true }, '向比色皿中加入足量4号比色管中的样品'],
        [ENJ.Step_WipeCuvette, { no: 4}, '擦拭比色皿的光滑面'],
        [ENJ.Step_InstallCuvette, { no: 4, ox: 1, oy: 5}, '放入分光光度计的第二个槽中'],
        [ENJ.Step_DumpToCuvette, { no: 5, targetVolume: 1, autoPlay: true }, '向比色皿中加入少量5号比色管中的样品'],
        [ENJ.Step_WashCuvette, { no: 5}, '润洗一下'],
        [ENJ.Step_DumpToCuvette, { no: 5, targetVolume: 2, autoPlay: true }, '向比色皿中加入足量5号比色管中的样品'],
        [ENJ.Step_WipeCuvette, { no: 5}, '擦拭比色皿的光滑面'],
        [ENJ.Step_InstallCuvette, { no: 5, ox: 2, oy: 10}, '放入分光光度计的第三个槽中'],
        [ENJ.Step_CorrectSpectrophotometer, {indices:[4,5]}, '盖上盖子，校准分光光度计'],
        [ENJ.Step_MeasureLuminosity, { luminosities: [0.837, 1.050]}, '拉动拉杆，测定吸光度'],
        [ENJ.Step_RecordResults, { A4: 200, A5: 250, Y4: 0.837, Y5: 1.050}, '记录结果'],

        ////
        [ENJ.Step_Interlude_2, { no: 10, title: '样品吸光度测定' }, ''],
        [ENJ.Step_DumpToCuvette, { no: 0, targetVolume: 1, autoPlay: false }, '向比色皿中加入少量0号比色管中的样品'],
        [ENJ.Step_WashCuvette, { no: 0}, '润洗一下'],
        [ENJ.Step_DumpToCuvette, { no: 0, targetVolume: 2, autoPlay: false }, '向比色皿中加入足量0号比色管中的样品'],
        [ENJ.Step_WipeCuvette, { no: 0}, '擦拭比色皿的光滑面'],
        [ENJ.Step_InstallCuvette, { no: 0, ox: 0, oy: 0}, '放入分光光度计的第一个槽中'],
        [ENJ.Step_DumpToCuvette, { no: 1, targetVolume: 1, autoPlay: true }, '向比色皿中加入少量1号比色管中的样品'],
        [ENJ.Step_WashCuvette, { no: 1}, '润洗一下'],
        [ENJ.Step_DumpToCuvette, { no: 1, targetVolume: 2, autoPlay: true }, '向比色皿中加入足量1号比色管中的样品'],
        [ENJ.Step_WipeCuvette, { no: 1}, '擦拭比色皿的光滑面'],
        [ENJ.Step_InstallCuvette, { no: 1, ox: 1, oy: 5}, '放入分光光度计的第二个槽中'],
        [ENJ.Step_DumpToCuvette, { no: 2, targetVolume: 1, autoPlay: true }, '向比色皿中加入少量2号比色管中的样品'],
        [ENJ.Step_WashCuvette, { no: 2}, '润洗一下'],
        [ENJ.Step_DumpToCuvette, { no: 2, targetVolume: 2, autoPlay: true }, '向比色皿中加入足量2号比色管中的样品'],
        [ENJ.Step_WipeCuvette, { no: 2}, '擦拭比色皿的光滑面'],
        [ENJ.Step_InstallCuvette, { no: 2, ox: 2, oy: 10}, '放入分光光度计的第三个槽中'],
        [ENJ.Step_CorrectSpectrophotometer, {indices:[0,1,2]}, '盖上盖子，校准分光光度计'],
        [ENJ.Step_MeasureLuminosity, {luminosities: [0.508, 0.526]}, '拉动拉杆，测定吸光度'],
        [ENJ.Step_RecordResults, { A6: 118.31, A7: 122.60, Y6: 0.508, Y7: 0.526}, '记录结果'],
        [ENJ.Step_RecycleToDish, { }, '测定完毕，将1号样品收集到蒸发皿中'],

        [ENJ.Step_Interlude_2, {no: '11', title: '薄层层析定性' }, ''],
        [ENJ.Step_AddEthanolToDish, { }, '吸取一定量的乙醇，加入到含蒸干样品的蒸发皿中'],
        [ENJ.Step_StirringDish_2, { }, '搅拌、溶解样品'],
        [ENJ.Step_DipCapillary, {containerId: 'dish' }, '取一支点样毛细管，蘸取少量样品'],
        [ENJ.Step_SpotSample, {point: {x: 415, y: 485}, index: 0 }, '在右侧1cm处点样'],
        [ENJ.Step_BlowSample, {point: {x: 415, y: 485}, index: 0 }, '用吹风机吹干'],
        [ENJ.Step_SpotSample, {point: {x: 415, y: 485}, index: 0 }, '在右侧1cm处点样'],
        [ENJ.Step_BlowSample, {point: {x: 415, y: 485}, index: 0 }, '用吹风机吹干'],
        [ENJ.Step_SpotSample, {point: {x: 415, y: 485}, index: 0 }, '在右侧1cm处点样'],
        [ENJ.Step_BlowSample, {point: {x: 415, y: 485}, index: 0 }, '用吹风机吹干'],
        [ENJ.Step_SpotSample, {point: {x: 415, y: 485}, index: 0, last: true }, '在右侧1cm处点样'],
        [ENJ.Step_BlowSample, {point: {x: 415, y: 485}, index: 0 }, '用吹风机吹干'],
        [ENJ.Step_DumpToBeaker_2, { }, '向小烧杯中倒入一定量的柠檬黄标准溶液'],
        [ENJ.Step_DipCapillary, {containerId: 'beaker' }, '取一支点样毛细管，蘸取少量标准溶液'],
        [ENJ.Step_SpotSample, {point: {x: 535, y: 485}, index: 1 }, '在左侧1cm处点样'],
        [ENJ.Step_BlowSample, {point: {x: 535, y: 485}, index: 1 }, '用吹风机吹干'],
        [ENJ.Step_SpotSample, {point: {x: 535, y: 485}, index: 1 }, '在左侧1cm处点样'],
        [ENJ.Step_BlowSample, {point: {x: 535, y: 485}, index: 1 }, '用吹风机吹干'],
        [ENJ.Step_SpotSample, {point: {x: 535, y: 485}, index: 1 }, '在左侧1cm处点样'],
        [ENJ.Step_BlowSample, {point: {x: 535, y: 485}, index: 1 }, '用吹风机吹干'],
        [ENJ.Step_SpotSample, {point: {x: 535, y: 485}, index: 1, last: true }, '在左侧1cm处点样'],
        [ENJ.Step_BlowSample, {point: {x: 535, y: 485}, index: 1 }, '用吹风机吹干'],

        [ENJ.Step_Interlude_2, {no: '12', title: '薄层层析定性' }, ''],
        [ENJ.Step_ClipPaper, {}, ''],
        [ENJ.Step_RecordResults, { X: 11.07}, '实验结果']
      ];

      for(i = 0, n = configs.length; i < n; ++i) {
        config = configs[i];
        steps.push(config[0]);
        stores.push(config[1]);
        tips.push(config[2]);
      }

      this.steps = steps;
      this.stores = stores;
      this.tips = tips;

      this.start();
    }
  });

  ENJ.Script_10 = Script_10;
})();

//##############################################################################
// src/Lab.js
//##############################################################################
(function() {
  var Stage = CreateJS.Stage;
  var Shape = CreateJS.Shape;
  var Graphics = CreateJS.Graphics;

  function Lab(canvas) {
    Stage.apply(this,  arguments);

    this.register();

    this.ready();
  }

  ENJ.defineClass({
    constructor: Lab,
    extend: Stage,

    register: function() {
      //this._renderers = [];
      this.progressBar = null;
      this.snapToPixelEnabled = false;
    },

    ready: function() {
      this.enableMouseOver();

      var tip = new CreateJS.Text();
      tip.set({x: 50, y: 50, color: "#fff", font: "bold 18px Arial"});
      this.addChild(tip);

      this.tip = tip;

      var blackBoard = new ENJ.BlackBoard();
      blackBoard.visible = false;
      this.addChild(blackBoard);

      this.blackBoard = blackBoard;

      var progressBar = new ENJ.ProgressBar({length: 600});
      progressBar.set({x: 180, y: 250});
      this.addChild(progressBar);

      this.progressBar = progressBar;

      if ('development' === 'development') {
        var container = new CreateJS.Container();

        var coordinate = new CreateJS.Text();
        coordinate.set({ x:820,  y:20 });
        coordinate.color='#fff';
        coordinate.text = 'x: \n\ny: ';
        //this.text = text;
        container.addChild(coordinate);

        //var self = this;
        //this.addEventListener('tick',  this.refresh.bind(this));
        this.addEventListener('stagemousemove',  function(evt){
          coordinate.text='x: '+ evt.stageX + '\n\ny: ' +evt.stageY;
        });

        var i,  g,  line;

        g = new Graphics();
        g.beginStroke('#ffffff').moveTo(0, 0).lineTo(0, 640);
        for(i = 0; i < 10; ++ i) {
          line = new Shape(g);
          line.x = i * 100;
          container.addChild(line);
        }

        g = new Graphics();
        g.beginStroke('#ffffff', 1).moveTo(0, 0).lineTo(960, 0);
        for(i = 0; i < 7; ++ i) {
          line = new Shape(g);
          line.y = i * 100;
          container.addChild(line);
        }

        this.addChild(container);
      }
    },

    setProgress: function(value) {
      this.progressBar.save({progress: value});// =  value;
    },

    getScene: function() {
      return this.scene;
    },

    putScene: function(scene) {

      if (this.scene) {
        this.removeChild(this.scene);
      } else {
        //this.removeAllChildren();
        this.removeChild(this.progressBar);

      }

      this.scene = scene;

      this.addChildAt(scene, 0);

    }
  });

  ENJ.Lab = Lab;
})();

//######################################################################################################################
// src/exit.js
//######################################################################################################################
(function() {
  var Ticker = CreateJS.Ticker;
//
  var lab = new ENJ.Lab('stage');
  lab.active=true;

  if (window.requestAnimationFrame
    || window.webkitRequestAnimationFrame
    || window.mozRequestAnimationFrame
    || window.oRequestAnimationFrame
    || window.msRequestAnimationFrame) {
    Ticker.timingMode = 'raf';
  }

  Ticker.addEventListener('tick' , update);

  function update(event) {
//    if (CRE.Tween.hasActiveTweens() || ENJ.invalid) {
//        lab.update();
//        ENJ.invalid = false;
//    }

    if (lab && lab.active) {
      lab.update(event);
    }

    //stats.update();
    //requestAnimationFrame(update);
  }
//update();

  RES.addEventListener('complete', function() {
    lab.setProgress(1.0);


//  var scene = new ENJ.Scene_2();
//  var script = new ENJ.Script_2();

//  var scene = new ENJ.Scene_3();
//  var script = new ENJ.Script_3();
//
//  scene.set({
//    x: 60, scaleX: ENJ.scaleY, scaleY: ENJ.scaleY
//  });


    //new ENJ.Experiment(lab, scene, script);

    //lab.putScene(new ENJ.Scene_10());

    new ENJ.Script_10(lab);
  });

  RES.addEventListener('progress', function(evt) {
    //console.log(evt.progress);
    lab.setProgress(evt.progress);
    //bar.style.width = '' + evt.progress * 100 +'%';
  });

  RES.loadManifest({
    path: './assets/',
    manifest: [
      { id: "手", src: "手.png" },
      { id: "标签", src: "标签.png" },
      { id: "数字标签", src: "数字标签.png" },
      { id: "糖球", src: "糖球.png" },
      //{ id: "粉末", src: "粉末.png" },
      { id: "药勺", src: "药勺.png" },
      { id: "一勺粉末", src: "一勺粉末.png" },
      { id: "一沓擦镜纸", src: "一沓擦镜纸.png" },
      { id: "擦镜纸", src: "擦镜纸.png" },
      { id: "玻璃棒", src: "玻璃棒.png" },
      { id: "温度计", src: "温度计.png" },
      { id: "电磁炉", src: "电磁炉.png" },
      { id: "烧杯", src: "烧杯.png" },
      { id: "烧杯液体", src: "烧杯液体.png" },
      { id: "大烧杯", src: "大烧杯.png" },
      { id: "大烧杯液体", src: "大烧杯液体.png" },
      { id: "量筒", src: "量筒.png" },
      { id: "量筒液体", src: "量筒液体.png" },
      { id: "电磁炉旋钮", src: "电磁炉旋钮.png" },
      { id: "聚酰胺粉", src: "聚酰胺粉.png" },
      { id: "聚酰胺粉称量纸上", src: "聚酰胺粉称量纸上.png" },
      { id: "广口瓶瓶塞", src: "广口瓶瓶塞.png" },
      { id: "广口瓶瓶身", src: "广口瓶瓶身.png" },
      { id: "细口瓶", src: "细口瓶.png" },
      { id: "细口瓶液体", src: "细口瓶液体.png" },
      { id: "称量纸平摊", src: "称量纸平摊.png" },
      { id: "称量纸折边", src: "称量纸折边.png" },
      { id: "称量纸对折", src: "称量纸对折.png" },
      { id: "结果报告", src: "结果报告.png" },
      { id: "关闭按钮", src: "关闭按钮.png" },
      { id: "具支试管", src: "具支试管.png" },
      { id: "具支试管液体", src: "具支试管液体.png" },
      { id: "砂芯漏斗", src: "砂芯漏斗.png" },
      { id: "砂芯漏斗2", src: "砂芯漏斗2.png" },
      { id: "电子数字", src: "电子数字.png" },
      { id: "分光光度计", src: "分光光度计.png" },
      { id: "分光光度计拉杆", src: "分光光度计拉杆.png" },
      { id: "天平底座", src: "天平底座.png" },
      { id: "天平横杆", src: "天平横杆.png" },
      { id: "天平托盘", src: "天平托盘.png" },
      { id: "比色管身", src: "比色管身.png" },
      { id: "比色管塞", src: "比色管塞.png" },
      { id: "比色管液", src: "比色管液.png" },
      { id: "蒸馏水瓶", src: "蒸馏水瓶.png" },
      { id: "试管架1", src: "试管架1.png" },
      { id: "试管架2", src: "试管架2.png" },
      { id: "移液管架", src: "移液管架.png" },
      { id: "移液管", src: "移液管.png" },
      { id: "移液管液体", src: "移液管液体.png" },
      { id: "容量瓶", src: "容量瓶.png" },
      { id: "容量瓶盖", src: "容量瓶盖.png" },
      { id: "容量瓶液体", src: "容量瓶液体.png" },
      { id: "蒸发皿流出液", src: "蒸发皿流出液.png" },
      { id: "蒸发皿", src: "蒸发皿.png" },
      { id: "PH试纸", src: "PH试纸.png" },
      { id: "比色卡", src: "比色卡.png" },
      { id: "比色卡2", src: "比色卡2.png" },
      { id: "比色皿", src: "比色皿.png" },
      { id: "比色皿液体", src: "比色皿液体.png" },
      { id: "离心机", src: "离心机.png" },
      { id: "离心管壳", src: "离心管壳.png" },
      { id: "离心管芯", src: "离心管芯.png" },
      { id: "离心管液", src: "离心管液.png" },
      { id: "层析缸主体", src: "层析缸主体.png" },
      { id: "层析缸盖子", src: "层析缸盖子.png" },
      { id: "毛细管罐身", src: "毛细管罐身.png" },
      { id: "毛细管盖子", src: "毛细管盖子.png" },
      { id: "毛细管", src: "毛细管.png" },
      { id: "电吹风", src: "电吹风.png" },
      { id: "玻璃塞", src: "玻璃塞.png" },
      { id: "吸管", src: "吸管.png" },
      { id: "吸管液体", src: "吸管液体.png" },
      { id: "水流", src: "水流.png" },
      { id: "色块", src: "色块.png" },
      { id: "色块2", src: "色块2.png" },
      { id: "台秤", src: "台秤.png" },
      { id: "夹子", src: "夹子.png" },
      { id: "塞子", src: "塞子.png" },
      { id: "吸球", src: "吸球.png" },
      { id: "水滴", src: "水滴.png" },
      { id: "滴管", src: "滴管.png" },
      { id: "背景", src: "背景.png" }
    ]
  });
})();
//######################################################################################################################
// src/exit.js
//######################################################################################################################
//(function() {
//  'use strict';
//
//  var CRT = createjs;
//
//  var RES = new CRT.LoadQueue();
//  RES.getRes = RES.getResult;
//
//  var ENJ = {version: '0.0.3'};
//
})();
