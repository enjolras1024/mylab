//##############################################################################
// src/expts/Experiment.js
//##############################################################################
ENJ.Experiment = ( function () {
  /**
   *
   * @class Experiment
   *
   * @param {Lab} lab
   * @param {Scene} scene
   * @param {Script} script
   * @constructor
   */
  function Experiment ( lab, scene, script ) {
    this.lab = lab;
    this.scene = scene;
    this.script = script;

    lab.put( scene );

    script.scene = scene;
    script.start();

//        lab.addEventListener( 'prev', this.onStepChange.bind( this ) );
//        lab.addEventListener( 'next', this.onStepChange.bind( this ) );
//        lab.addEventListener( 'skip', this.onStepChange.bind( this ) );
//        lab.addEventListener( 'restart', this.onStepChange.bind( this ) );
  }

  /*Experiment.prototype.onStepChange = function ( event ) {
   var script = this.script;
   switch ( event.type ) {
   case 'prev':
   script.prev();
   break;
   case 'next':
   script.next();
   break;
   case 'restart':
   script.restart();
   break;
   case 'skip':
   script.skip( event.body[ 'to' ] - 1 );
   break;
   }
   };*/

  return Experiment;
} )();


