//##############################################################################
// src/scripts/Script_3.js
//##############################################################################
ENJ.Script_3 = (function() {
  var Script = ENJ.Script;

  return ENJ.defineClass({
    /**
     * @class Script_3
     * @extends Script
     *
     * @constructor
     */
    constructor: function Script_3() {
      Script.apply( this, arguments );
    }, extend: Script,
    /**
     * @override
     */
    ready: function() {
      var i, n, config, configs, steps = [], stores = [];

      configs  = [
        // 校准1
//        [ENJ.Step_CutBag, { bag: 1 }, ""],
//        [ENJ.Step_DumpPowder, { bag: 1, beaker: 3 }, ""],
//        [ENJ.Step_WashBag, { bag: 1, beaker: 3, remain: true, volume: 5 }, ""],
//        [ENJ.Step_WashBag, { bag: 1, beaker: 3, remain: false, volume: 10 }, ""],
//        [ENJ.Step_DumpWater, { beaker: 3, volume: 20 }, ""],
//        [ENJ.Step_StirLiquid, { beaker: 3, remain: true }, ""],
//        [ENJ.Step_TransferLiquid, { beaker: 3, flask: 1, remain: true }, ""],
//        [ENJ.Step_DumpWater, { beaker: 3, volume: 20, washing: true }, ""],
//        [ENJ.Step_TransferLiquid, { beaker: 3, flask: 1, remain: true }, ""],
//        [ENJ.Step_DumpWater, { beaker: 3, volume: 20, washing: true }, ""],
//        [ENJ.Step_TransferLiquid, { beaker: 3, flask: 1 }, ""],
//        [ENJ.Step_ConstantVolume, { flask: 1, volume: 100 }, ""],
//        [ENJ.Step_ShakeUp, { flask: 1 }, ""],
//        [ENJ.Step_WashElectrode, {}, ""],
//        [ENJ.Step_WipeUpElectrode, {}, ""],
//        [ENJ.Step_DumpFromFlask, { beaker: 2, flask: 1, volume: 30 }, ""],
//        [ENJ.Step_AddRotor, { beaker: 2, rotor: 1 }, ""],
//        [ENJ.Step_StartStirrer, { beaker: 2, rotor: 1 }, ""],
//        [ENJ.Step_CorrectPHInstrument, {}, ""],
//        [ENJ.Step_StopStirrer, { beaker: 2, rotor: 1 }, ""],
//
//        // 校准2
//        [ENJ.Step_CutBag, { bag: 0 }, ""],
//        [ENJ.Step_DumpPowder, { bag: 0, beaker: 1 }, ""],
//        [ENJ.Step_WashBag, { bag: 0, beaker: 1, remain: true, volume: 5 }, ""],
//        [ENJ.Step_WashBag, { bag: 0, beaker: 1, remain: false, volume: 10 }, ""],
//        [ENJ.Step_DumpWater, { beaker: 1, volume: 20 }, ""],
//        [ENJ.Step_StirLiquid, { beaker: 1, remain: true }, ""],
//        [ENJ.Step_TransferLiquid, { beaker: 1, flask: 0, remain: true }, ""],
//        [ENJ.Step_DumpWater, { beaker: 1, volume: 20, washing: true }, ""],
//        [ENJ.Step_TransferLiquid, { beaker: 1, flask: 0, remain: true }, ""],
//        [ENJ.Step_DumpWater, { beaker: 1, volume: 20, washing: true }, ""],
//        [ENJ.Step_TransferLiquid, { beaker: 1, flask: 0 }, ""],
//        [ENJ.Step_ConstantVolume, { flask: 0, volume: 100 }, ""],
//        [ENJ.Step_ShakeUp, { flask: 0 }, ""],
//        [ENJ.Step_WashElectrode, {}, ""],
//        [ENJ.Step_WipeUpElectrode, {}, ""],
//        [ENJ.Step_DumpFromFlask, { beaker: 0, flask: 0, volume: 30 }, ""],
//        [ENJ.Step_AddRotor, { beaker: 0, rotor: 0 }, ""],
//        [ENJ.Step_StartStirrer, { beaker: 0, rotor: 0 }, ""],
//        [ENJ.Step_CorrectPHInstrument, {}, ""],
//        [ENJ.Step_StopStirrer, { beaker: 0, rotor: 0 }, ""],

        //
//        [ENJ.Step_Interlude, {}, ''],

        //取样1
        [ENJ.Step_SuckLiquid, { bottle: 'reagenBottle', volume: 2, remain: false }, ""],
        [ENJ.Step_WashPipe, { pipe: 'pipet' }, ""],
        [ENJ.Step_BlowLiquid, { bottle: 'bigBeaker', volume: 0.8, remain: 2, rightNow: true }, ""],
        [ENJ.Step_EmptyPipet, { remain: true }, ""],
        [ENJ.Step_SuckLiquid, { bottle: 'reagenBottle', volume: 2, remain: false }, ""],
        [ENJ.Step_WashPipe, { pipe: 'pipet' }, ""],
        [ENJ.Step_BlowLiquid, { bottle: 'bigBeaker', volume: 0.8, remain: 2, rightNow: true }, ""],
        [ENJ.Step_EmptyPipet, { remain: true }, ""],
        [ENJ.Step_SuckLiquid, { bottle: 'reagenBottle', volume: 6, remain: true }, ""],
        [ENJ.Step_BlowLiquid, { bottle: 'reagenBottle', volume: 4, remain: 1, rotate: true }, ""],
        [ENJ.Step_BlowLiquid, { bottle: 'beaker', volume: 2, remain: 1 }, ""],
        [ENJ.Step_BlowLiquid, { bottle: 'bigBeaker', volume: 0.8, remain: 2, rightNow: true }, ""],
        [ENJ.Step_EmptyPipet, {}, ""],



//        //取样2
//        [ENJ.Step_SuckLiquid, { bottle: 'soySauce', volume: 2, remain: false }, ""],
//        [ENJ.Step_WashPipe, { pipe: 'pipet' }, ""],
//        [ENJ.Step_BlowLiquid, { bottle: 'bigBeaker', volume: 0.8, remain: 2, rightNow: true }, ""],
//        [ENJ.Step_EmptyPipet, { remain: true }, ""],
//        [ENJ.Step_SuckLiquid, { bottle: 'soySauce', volume: 2, remain: false }, ""],
//        [ENJ.Step_WashPipe, { pipe: 'pipet' }, ""],
//        [ENJ.Step_BlowLiquid, { bottle: 'bigBeaker', volume: 0.8, remain: 2, rightNow: true }, ""],
//        [ENJ.Step_EmptyPipet, { remain: true }, ""],
//        [ENJ.Step_SuckLiquid, { bottle: 'soySauce', volume: 6, remain: true }, ""],
//        [ENJ.Step_BlowLiquid, { bottle: 'soySauce', volume: 4, remain: 1, rotate: true }, ""],
//        [ENJ.Step_BlowLiquid, { bottle: 'beaker', volume: 2, remain: 1 }, ""],
//        [ENJ.Step_BlowLiquid, { bottle: 'bigBeaker', volume: 0.8, remain: 2, rightNow: true }, ""],
//        [ENJ.Step_EmptyPipet, {}, ""],
//
//        //测定2
//        [ENJ.Step_DumpToCylinder, {volume: 20}, ""],
//        [ENJ.Step_DumpFromCylinder, {}, ""],
//        [ENJ.Step_AddRotor, { beaker: 1, rotor: 0 }, ""],
//        [ENJ.Step_StartStirrer, { beaker: 1, rotor: 0 }, ""],
//        [ENJ.Step_DumpToBuret, {volume: 20}, ""],
//        [ENJ.Step_WashPipe, { pipe: 'buret' }, ""],
//        [ENJ.Step_BlowBuret, { bottle: 'bigBeaker', volume: 0 }, ""],
//        [ENJ.Step_DumpToBuret, {volume: 20}, ""],
//        [ENJ.Step_WashPipe, { pipe: 'buret' }, ""],
//        [ENJ.Step_BlowBuret, { bottle: 'bigBeaker', volume: 0 }, ""],
//        [ENJ.Step_DumpToBuret, {volume: 82}, ""],
//        [ENJ.Step_WashPipe, { pipe: 'buret' }, ""],
//        [ENJ.Step_BlowBuret, { bottle: 'bigBeaker', volume: 80 }, ""],
//        [ENJ.Step_InstallBuret, {}, ""],
//        [ENJ.Step_DropFromBuret, {volume: 70}, ""],

//        //空白1
//        [ENJ.Step_DumpToCylinder, {volume: 22}, ""],
//        [ENJ.Step_DumpFromCylinder, {}, ""],
//        [ENJ.Step_AddRotor, { beaker: 3, rotor: 1 }, ""],
//        [ENJ.Step_StartStirrer, { beaker: 3, rotor: 1 }, ""],
//        [ENJ.Step_DumpToBuret, {volume: 20}, ""],
//        [ENJ.Step_WashPipe, { pipe: 'buret' }, ""],
//        [ENJ.Step_BlowBuret, { bottle: 'bigBeaker', volume: 0 }, ""],
//        [ENJ.Step_DumpToBuret, {volume: 20}, ""],
//        [ENJ.Step_WashPipe, { pipe: 'buret' }, ""],
//        [ENJ.Step_BlowBuret, { bottle: 'bigBeaker', volume: 0 }, ""],
//        [ENJ.Step_DumpToBuret, {volume: 82}, ""],
//        [ENJ.Step_WashPipe, { pipe: 'buret' }, ""],
//        [ENJ.Step_BlowBuret, { bottle: 'bigBeaker', volume: 80 }, ""],
//        [ENJ.Step_InstallBuret, {}, ""],
//        [ENJ.Step_DropFromBuret, {volume: 70}, ""],
//
//        //空白2
//        [ENJ.Step_DumpToCylinder, {volume: 22}, ""],
//        [ENJ.Step_DumpFromCylinder, {}, ""],
//        [ENJ.Step_AddRotor, { beaker: 3, rotor: 1 }, ""],
//        [ENJ.Step_StartStirrer, { beaker: 3, rotor: 1 }, ""],
//        [ENJ.Step_DumpToBuret, {volume: 20}, ""],
//        [ENJ.Step_WashPipe, { pipe: 'buret' }, ""],
//        [ENJ.Step_BlowBuret, { bottle: 'bigBeaker', volume: 0 }, ""],
//        [ENJ.Step_DumpToBuret, {volume: 20}, ""],
//        [ENJ.Step_WashPipe, { pipe: 'buret' }, ""],
//        [ENJ.Step_BlowBuret, { bottle: 'bigBeaker', volume: 0 }, ""],
//        [ENJ.Step_DumpToBuret, {volume: 82}, ""],
//        [ENJ.Step_WashPipe, { pipe: 'buret' }, ""],
//        [ENJ.Step_BlowBuret, { bottle: 'bigBeaker', volume: 80 }, ""],
//        [ENJ.Step_InstallBuret, {}, ""],
//        [ENJ.Step_DropFromBuret, {volume: 70}, ""],



//      [ENJ.Step_CorrectPHInstrument, {}, ""],
          [ENJ.Step_StopStirrer, { beaker: 2, rotor: 1 }, ""]
      ];

      for(i = 0, n = configs.length; i < n; ++i) {
        config = configs[i];
        steps.push(config[0]);
        stores.push(config[1]);
        //tips.push( config[2] );
      }

      this.steps = steps;
      this.stores = stores;
    }
  });
})();
