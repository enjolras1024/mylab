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
      var self = this, bg, paper, curve, data, sheet, bag, drop,
        rotor, hand, scissors, beaker, i,
        pipetStand, waterBottle, volumetricFlask, drainageBar, bigBeaker,
        bags = [], beakers = [], volumetricFlasks = [], rotors = [],
        cylinder, stirrer, phInstrument, powder, buret, titrationStand,
        phElectrode, reagenBottle, cap, reagenBottle2, pipet2,
        suckBall, soySauce, pipet;

      // @todo CSS background maybe better.
      bg = new Bitmap(RES.getRes("背景"));

      paper = new Bitmap(RES.getRes("纸巾"));


      drainageBar = new Bitmap(RES.getRes("引流棒"));

      curve = new CRE.Shape(new CRE.Graphics());

      drop = new Bitmap(RES.getRes("磁力搅拌器旋钮"));
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


      data = {
        images: [RES.getRes("转子")],
        frames: { width: 40, height: 19 }
      };
      sheet = new CRE.SpriteSheet(data);

      for (i = 0; i < 2; ++ i) {
        rotor = new CRE.Sprite(sheet);
        rotor.gotoAndStop(0);
        //rotor.set({ x: 600 + 20 * i, y: 470 + 10 * i });
        this.place(rotor,{ x: 600 + 20 * i, y: 470 + 10 * i });
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
        bag.set({ x: 510 - i * 60, y: 480 + i * 10, scaleY: 0.4, skewX: 50, regX: 50, regY: 48 });

        bags.push(bag);
      }

      powder = new Bitmap(RES.getRes("粉末"));
      powder.visible = false;

      //beaker = new Bitmap(RES.getRes("烧杯"));
      //beaker.set({ x: 200, y: 500 });

      stirrer = new ENJ.MagneticStirrer();

      waterBottle = new ENJ.WaterBottle(RES.getRes("蒸馏水瓶"));

      cap = new Bitmap(RES.getRes("盖子甲"));

      reagenBottle = new ENJ.ReagenBottle({ volume: 500, color: 0x990000ff, icon: "费林试剂甲液" } );


      pipetStand = new Bitmap(RES.getRes("移液管架"));

      titrationStand = new ENJ.TitrationStand();
      titrationStand.scaleX = -1;

      buret = new ENJ.Buret({ volume: 0, color: 0x990000ff });
      //buret.scaleX = -1;


      suckBall = new ENJ.SuckBall();
      soySauce = new ENJ.SoySauce({ volume: 180, color: 0xdd111100 });
      pipet = new ENJ.Pipet({ volume: 0, color: 0x990000ff });

      pipet.rotation = -90;
      drainageBar.rotation = -90;

      phElectrode = new ENJ.PHElectrode();

      phInstrument = new Bitmap(RES.getRes ("PH仪"));

      cylinder = new ENJ.Cylinder({ volume: 0, color: 0x990000ff });

      //volumetricFlask = new ENJ.VolumetricFlask({ volume: 0, color: 0x990000ff });

      for (i = 0; i < 2; ++ i) {
        volumetricFlask = new ENJ.VolumetricFlask({ volume: 0, color: 0x990000ff });
        this.place(volumetricFlask, new Point(130 + 100 * i, 200 + i * 20));
        volumetricFlasks.push(volumetricFlask);
      }

      for (i = 0; i < 4; ++ i) {
        beaker = new ENJ.Beaker({ volume: 0, color: 0x660000ff });
        this.place(beaker, new Point(100 - 30 * i,450 + 20 * i));
        beakers.push(beaker);
      }

      bigBeaker = new ENJ.Beaker({ volume: 10, color: 0x660000ff });
      bigBeaker.set({ scaleX: 1.25, scaleY: 1.25 });


      self.addChild(
        bg,
        pipetStand,

        cap,

        bags[0],
        bags[1],

        phInstrument,
        stirrer,
        reagenBottle,
        pipet,
        suckBall,
        cylinder,
        waterBottle,

        volumetricFlasks[0],
        volumetricFlasks[1],

        titrationStand,


        drainageBar,

        rotors[0],
        rotors[1],

        powder,

        soySauce,
        phElectrode,

        buret,

        beakers[0],
        beakers[1],
        beakers[2],
        beakers[3],

        bigBeaker,



        scissors,
        curve,
        paper,
        hand,
        drop
      );

      for (i = 0; i < 2; ++ i) {
        self.place(volumetricFlasks[i], new Point(130 + 100 * i, 200 + i * 20));
      }

      for (i = 0; i < 4; ++ i) {
        self.place(beakers[i], new Point(100 - 30 * i,450 + 20 * i));
      }

      self.place(bigBeaker, new Point(100, 1000));



      self.place(bg, new Point(0, 0));
      self.place(waterBottle, new Point(425, 230));
      self.place(pipetStand, new Point(700, 270));

//    this.place(titrationStand, new Point(520,160));
//    this.place(buret, new Point(650,100));
      self.place(titrationStand, new Point(520,1000));
      self.place(buret, new Point(650,1000));

      self.place(phInstrument, new Point(680, 380));
      self.place(drainageBar, new Point(680, 320));




      self.place(stirrer, new Point(600, 500));

      self.place(cap, new Point(572,290));
      self.place(reagenBottle, new Point(560, 300));
      self.place(pipet, new Point(700, 300));

      self.place(suckBall, new Point(670, 440));
      self.place(cylinder, new Point(340, 180));
      self.place(soySauce, new Point(60, 240));

      self.place(phElectrode, new Point(690, 330));


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
        cap: cap,
        drop: drop,
        buret: buret
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
