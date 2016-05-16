//##############################################################################
// src/scenes/Scene_2.js
//##############################################################################
ENJ.Scene_2 = (function() {
  var Scene = ENJ.Scene,
    Bitmap = CRE.Bitmap,
    Point = CRE.Point;

  return ENJ.defineClass({
    /**
     * @class Scene_2
     * @extends Scene
     * @constructor
     */
    constructor: function Scene_2() {
      Scene.apply(this, arguments);
    }, extend: Scene,
    /**
     * @override
     */
    ready: function() {
      var self = this, bg, paper, curve, data, sheet, bag, drop, tip,
        rotor, hand, scissors, beaker, i, board, table,
        pipetStand, waterBottle, volumetricFlask, drainageBar, bigBeaker,
        bags = [], beakers = [], volumetricFlasks = [], rotors = [],
        cylinder, stirrer, phInstrument, powder, buret, titrationStand,
        phElectrode, reagenBottle,
        suckBall, soySauce, pipet;

      // @todo CSS background maybe better.
      bg = new Bitmap(RES.getRes("背景"));

      paper = new Bitmap(RES.getRes("纸巾"));
      paper.visible = false;


      drainageBar = new Bitmap(RES.getRes("引流棒"));

      curve = new ENJ.Curve();//new CRE.Shape(new CRE.Graphics());


      drop = new Bitmap(RES.getRes("水滴"));
      drop.visible = false;

      data = {
        images: [RES.getRes("剪刀")],
        frames: { width: 133, height: 73 },
        animations: { close: 1, open: 0 }
      };
      sheet = new CRE.SpriteSheet(data);

      scissors = new CRE.Sprite(sheet);
      scissors.gotoAndStop('open');
      scissors.set({ /*rotation: 45, */regX: 73, regY: 36 });

      data = {
        images: [RES.getRes("手")],
        frames: { width: 100, height: 129 },
        animations: { up: 0, down: 1 }
      };
      sheet = new CRE.SpriteSheet(data);

      hand = new CRE.Sprite(sheet);
      hand.gotoAndStop('up');
      hand.visible = false;


      data = {
        images: [RES.getRes("转子")],
        frames: { width: 40, height: 19 }
      };
      sheet = new CRE.SpriteSheet(data);

      for (i = 0; i < 2; ++ i) {
        rotor = new CRE.Sprite(sheet);
        rotor.gotoAndStop(0);
        //rotor.set({ x: 600 + 20 * i, y: 470 + 10 * i });
        //this.place(rotor,{ x: 600 + 20 * i, y: 470 + 10 * i });
        rotors.push(rotor);
      }

      data = {
        images: [RES.getRes("袋子")],
        frames: { width: 100, height: 96 },
        animations: { normal: 0, open: 1 }
      };
      sheet = new CRE.SpriteSheet(data);

      for(i = 0; i < 2; ++ i) {
        bag = new CRE.Sprite(sheet);
        bag.gotoAndStop('normal');
        bag.set({ scaleY: 0.4, skewX: 50, regX: 50, regY: 48 });

        bags.push(bag);
      }

      powder = new Bitmap(RES.getRes("粉末"));
      powder.visible = false;

      //beaker = new Bitmap(RES.getRes("烧杯"));
      //beaker.set({ x: 200, y: 500 });

      stirrer = new ENJ.MagneticStirrer();

      waterBottle = new ENJ.WaterBottle(RES.getRes("蒸馏水瓶"));

//      cap = new Bitmap(RES.getRes("盖子甲"));

      reagenBottle = new ENJ.ReagenBottle({ volume: 500, color: 0x22ffffff, icon: "氢氧化钠标签", cap: "盖子甲" } );


      pipetStand = new Bitmap(RES.getRes("移液管架"));

      titrationStand = new ENJ.TitrationStand();
      titrationStand.scaleX = -1;

      buret = new ENJ.Buret({ volume: 0, color: 0x22ffffff });
      //buret.scaleX = -1;


      suckBall = new ENJ.SuckBall();
      soySauce = new ENJ.SoySauce({ volume: 180, color: 0x66330000 });
      pipet = new ENJ.Pipet({ volume: 0, color: 0x22ffffff });

      pipet.rotation = -90;
      drainageBar.rotation = -90;

      phElectrode = new ENJ.PHElectrode();

      phInstrument = new ENJ.PHInstrument();//new Bitmap(RES.getRes ("PH仪"));

      cylinder = new ENJ.Cylinder({ volume: 0, color: 0x22ffffff });

      //volumetricFlask = new ENJ.VolumetricFlask({ volume: 0, color: 0x22ffffff });

      for (i = 0; i < 2; ++ i) {
        volumetricFlask = new ENJ.VolumetricFlask({ volume: 0, color: 0x22ffffff });
        this.place(volumetricFlask, new Point(130 + 100 * i, 200 + i * 20));
        volumetricFlasks.push(volumetricFlask);
      }

      for (i = 0; i < 4; ++ i) {
        beaker = new ENJ.Beaker({ volume: 0, color: 0x22ffffff });
        this.place(beaker, new Point(100 - 30 * i,450 + 20 * i));
        beakers.push(beaker);
      }

      bigBeaker = new ENJ.Beaker({ volume: 10, color: 0x660000ff });
      bigBeaker.set({ scaleX: 1.25, scaleY: 1.25 });

      table = new ENJ.ResultTable_2();
      table.set({regX: 360, regY: 200});
      table.set({x: 480, y: 320, visible: false});

      tip = new CRE.Text();
      tip.set({x: 50, y: 50, color: "#fff", font: "bold 18px Arial"});


      board = new ENJ.Board(/*{title:"校准PH计"}*/);
      board.visible = false;

      self.addChild(
        bg,
        pipetStand,

//        cap,

        bags[0],
        bags[1],

        stirrer,
        reagenBottle,

        cylinder,
        waterBottle,

        suckBall,
        pipet,

        volumetricFlasks[0],
        volumetricFlasks[1],

        titrationStand,


        drainageBar,

        rotors[0],
        rotors[1],

        curve,
        phInstrument,

        powder,

        soySauce,
        phElectrode,



        beakers[0],
        beakers[1],
        beakers[2],
        beakers[3],

        bigBeaker,

        buret,

        scissors,

        paper,
        hand,
        drop,

        table,

        tip,
        board
      );

      for (i = 0; i < 2; ++ i) {
        self.place(volumetricFlasks[i], new Point(130 + 100 * i, 200 + i * 20));
      }

      for (i = 0; i < 2; ++ i) {
        self.place(bags[i],{ x: 510 - i * 60, y: 480 + i * 10});
      }

      for (i = 0; i < 2; ++ i) {
        self.place(rotors[i],{ x: 600 + 20 * i, y: 470 + 10 * i });
      }

      for (i = 0; i < 4; ++ i) {
        self.place(beakers[i], new Point(100 - 30 * i,450 + 20 * i));
      }

      self.place(bigBeaker, new Point(100, 1000));



      bg.set({regX: 600, regY: 320, scaleX: 1.2});
      self.place(bg, new Point(480, 320));

      self.place(waterBottle, new Point(425, 230));
      self.place(pipetStand, new Point(700, 270));

//    this.place(titrationStand, new Point(520,160));
//    this.place(buret, new Point(650,100));
      self.place(titrationStand, new Point(520,1000));
      self.place(buret, new Point(650,1000));

      self.place(phInstrument, new Point(680, 380));
      self.place(drainageBar, new Point(680, 320));

      self.place(stirrer, new Point(600, 500));

//      self.place(cap, new Point(572,290));
      self.place(reagenBottle, new Point(560, 300));
      self.place(pipet, new Point(700, 300));

      self.place(suckBall, new Point(670, 440));
      self.place(cylinder, new Point(340, 180));
      self.place(soySauce, new Point(40, 210));

      self.place(phElectrode, new Point(690, 330));

      curve.update(phElectrode, new CRE.Point(800,480));
      //beakers[0].set({x:625,y:450});
      self.set({
        curve: curve,
        hand: hand,
        stirrer: stirrer,
        scissors: scissors,
        drainageBar: drainageBar,
        titrationStand: titrationStand,
        phElectrode: phElectrode,
        phInstrument: phInstrument,
        bigBeaker: bigBeaker,
        beaker: beakers[3],
        pipet: pipet,
        waterBottle: waterBottle,
        soySauce: soySauce,
        suckBall: suckBall,
        powder: powder,
        paper: paper,
        cylinder: cylinder,
        bags: bags,
        beakers: beakers,
        rotors: rotors,
        volumetricFlasks: volumetricFlasks,
        reagenBottle: reagenBottle,
//        cap: cap,
        drop: drop,
        buret: buret,
        tip: tip,
        board: board,
        table: table
      });

      /*stirrer.addEventListener('click', function() {
       if(stirrer.active) {
       stirrer.stop();
       //phElectrode.close();
       }else{
       stirrer.start();
       //phElectrode.open();
       }
       });*/


      // CRE.Tween.get(hand,{loop:true}).to({x:100},500).to({x:0},500);

      //this.addEventListener('tick', this.refresh.bind(this));

      /*var shape = new CRE.Shape();
       var g = shape.graphics;
       g.beginFill('#f00').drawRect(0,0,100,100).drawCircle(0,0,50);
       this.addChild(shape);
       shape.x=200;shape.y=200;*/


    }
  });
})();
