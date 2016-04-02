//##############################################################################
// src/scenes/Scene_3.js
//##############################################################################
ENJ.Scene_3 = (function() {
  var Scene = ENJ.Scene,
    Bitmap = CRE.Bitmap,
    Point = CRE.Point;

  return ENJ.defineClass({
    /**
     * @class Scene_3
     * @extends Scene
     * @constructor
     */
    constructor: function Scene_3() {
      Scene.apply(this, arguments);
    }, extend: Scene,
    /**
     * @override
     */
    ready: function() {
      var self = this, bg, paper, curve, data, sheet, drop, tip, board, table,
        rotor, hand, beaker, i,
        pipetStand, waterBottle, volumetricFlask, drainageBar, bigBeaker,
        beakers = [], volumetricFlasks = [], rotors = [],
        cylinder, stirrer, phInstrument, buret, titrationStand,
        phElectrode, reagenBottle, formaldehyde,
        suckBall, soySauce, pipet, pipet2, bigPipet;

      // @todo CSS background maybe better.
      bg = new Bitmap(RES.getRes("背景"));

      paper = new Bitmap(RES.getRes("纸巾"));
      paper.visible = false;

      drainageBar = new Bitmap(RES.getRes("引流棒"));

      curve = new ENJ.Curve();//new CRE.Shape(new CRE.Graphics());

      drop = new Bitmap(RES.getRes("水滴"));
      drop.visible = false;

//      data = {
//        images: [RES.getRes("剪刀")],
//        frames: { width: 133, height: 73 },
//        animations: { close: 1, open: 0 }
//      };
//      sheet = new CRE.SpriteSheet(data);

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

      //beaker = new Bitmap(RES.getRes("烧杯"));
      //beaker.set({ x: 200, y: 500 });

      stirrer = new ENJ.MagneticStirrer();

      waterBottle = new ENJ.WaterBottle(RES.getRes("蒸馏水瓶"));

      //cap = new Bitmap(RES.getRes("盖子甲"));

      reagenBottle = new ENJ.ReagenBottle({ volume: 500, color: 0x22ffffff, icon: "氢氧化钠标签", cap: "盖子甲" } );
      formaldehyde = new ENJ.ReagenBottle({ volume: 500, color: 0x66330000, icon: "甲醛标签", cap: "盖子甲" } );


      pipetStand = new Bitmap(RES.getRes("移液管架"));

      titrationStand = new ENJ.TitrationStand();
      titrationStand.scaleX = -1;

      buret = new ENJ.Buret({ volume: 0, color: 0x22ffffff });
      //buret.scaleX = -1;


      suckBall = new ENJ.SuckBall();
      soySauce = new ENJ.SoySauce({ volume: 180, color: 0xdd330000 });

      pipet = new ENJ.Pipet({ volume: 0, color: 0x66330000 });
      pipet2 = new ENJ.Pipet({ volume: 0, color: 0x66330000 });
      bigPipet = new ENJ.Pipet({ volume: 0, color: 0x66330000, ratio: 5 });

      pipet.rotation = -90;
      pipet2.rotation = -90;
      bigPipet.set({ rotation: -90, scaleY: 1.20});
      drainageBar.rotation = -90;

      phElectrode = new ENJ.PHElectrode();

      phInstrument = new ENJ.PHInstrument();//new Bitmap(RES.getRes ("PH仪"));

      cylinder = new ENJ.Cylinder({ volume: 0, color: 0x22ffffff });

      //volumetricFlask = new ENJ.VolumetricFlask({ volume: 0, color: 0x990000ff });

      var colors = [0x22ffffff,0x66330000,0x22ffffff];
      for (i = 0; i < 3; ++ i) {
        volumetricFlask = new ENJ.VolumetricFlask({ volume: 100, color: colors[i] });
        //this.place(volumetricFlask, new Point(130 + 50 * i, 200 + i * 10));
        volumetricFlasks.push(volumetricFlask);
      }

      for (i = 0; i < 4; ++ i) {
        beaker = new ENJ.Beaker({ volume: 0, color: 0x22ffffff });
        this.place(beaker, new Point(100 - 30 * i,450 + 20 * i));
        beakers.push(beaker);
      }

      bigBeaker = new ENJ.Beaker({ volume: 10, color: 0x66330000 });
      bigBeaker.set({ scaleX: 1.25, scaleY: 1.25 });

      table = new ENJ.ResultTable_3();
      table.set({regX: 360, regY: 200});
      table.set({x: 480, y: 320, visible: false});

      tip = new CRE.Text();
      tip.set({x: 50, y: 50, color: "#fff", font: "bold 18px Arial"});

      board = new ENJ.Board(/*{title:"校准PH计"}*/);
      board.visible = false;


      self.addChild(
        bg,
        pipetStand,

        //cap,

        stirrer,

        reagenBottle,
        formaldehyde,

        cylinder,
        waterBottle,

        pipet,
        pipet2,
        bigPipet,
        suckBall,

        titrationStand,


        drainageBar,

        rotors[0],
        rotors[1],

        curve,
        phInstrument,

        volumetricFlasks[0],
        volumetricFlasks[1],
        volumetricFlasks[2],

        //powder,

        soySauce,



        phElectrode,

        buret,

        beakers[0],
        beakers[1],
        beakers[2],
        beakers[3],

        bigBeaker,


        paper,
        hand,
        drop,

        table,

        tip,
        board
      );

      for (i = 0; i < 3; ++ i) {
        self.place(volumetricFlasks[i], new Point(130 + 50 * i, 200 + i * 10));
      }
      volumetricFlasks[1].visible = false;

      for (i = 0; i < 4; ++ i) {
        self.place(beakers[i], new Point(100 - 30 * i,450 + 20 * i));
      }
      //TODO
      beakers[1].visible = false;
      beakers[3].visible = false;

      for (i = 0; i < 2; ++ i) {
        self.place(rotors[i],{ x: 600 + 20 * i, y: 470 + 10 * i });
      }

      self.place(bigBeaker, new Point(100, 1000));



      self.place(bg, new Point(0, 0));
      self.place(waterBottle, new Point(370, 270));
      self.place(pipetStand, new Point(700, 270));

//    this.place(titrationStand, new Point(520,160));
//    this.place(buret, new Point(650,100));
      self.place(titrationStand, new Point(520,1000));
      self.place(buret, new Point(650,1000));

      self.place(phInstrument, new Point(680, 380));
      self.place(drainageBar, new Point(680, 375));




      self.place(stirrer, new Point(600, 500));

      //self.place(cap, new Point(592,290));
      self.place(reagenBottle, new Point(580, 300));
      self.place(formaldehyde, new Point(490, 300));
      self.place(pipet, new Point(700, 300));
      self.place(pipet2, new Point(700, 325));
      self.place(bigPipet, new Point(650, 350));

      self.place(suckBall, new Point(670, 440));
      self.place(cylinder, new Point(310, 180));
      self.place(soySauce, new Point(40, 210));

      self.place(phElectrode, new Point(690, 330));

      curve.update(phElectrode, new CRE.Point(800,480));
      //beakers[0].set({x:625,y:450});
      self.set({
        curve: curve,
        hand: hand,
        stirrer: stirrer,
        drainageBar: drainageBar,
        titrationStand: titrationStand,
        phElectrode: phElectrode,
        phInstrument: phInstrument,
        bigBeaker: bigBeaker,
        beaker: beakers[3],
        pipet: pipet,
        pipet2: pipet2,
        bigPipet: bigPipet,
        waterBottle: waterBottle,
        soySauce: soySauce,
        suckBall: suckBall,
        //powder: powder,
        paper: paper,
        cylinder: cylinder,
        beakers: beakers,
        rotors: rotors,
        volumetricFlasks: volumetricFlasks,
        volumetricFlask: volumetricFlasks[1],
        reagenBottle: reagenBottle,
        formaldehyde: formaldehyde,
        //cap: cap,
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
