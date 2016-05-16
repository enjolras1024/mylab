//##############################################################################
// src/elements/Board.js
//##############################################################################
ENJ.Board = (function() {
  var Element = ENJ.Element,
    Shape = CRE.Shape,
    Text = CRE.Text,
    Graphics = CRE.Graphics;

  return ENJ.defineClass({
    /**
     *
     * @class Board
     * @extends Element
     *
     * @constructor
     */
    constructor: function Board(store) {
      Element.call(this, store);
    }, extend: Element,
    /**
     * @override
     */
    ready: function() {
      var self = this, graphics, rect, label;

      graphics = new Graphics();
      graphics.beginFill('#000')
        .drawRect(-80, 0, 1250, 640);

      rect = new Shape(graphics);

      label = new Text();
      label.set({
        x: 510 , y: 300, color: "#fff", font: "bold 36px Arial", textAlign: 'center'
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
    storeChanged: function(key) {
      var self = this, value = self.store(key), label = self.label;
      switch (key) {
        case 'title':
          label.text = value;
//          var bounds = label.getBounds();
//          console.log(bounds);
//          label.set({x: 480 , y: 320 });
          break;
      }
    }

  });
})();
