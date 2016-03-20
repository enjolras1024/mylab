/**
 * Created by Enjolras on 2016/1/12.
 */

( function () {

  'use strict';

  //TODO: TextNode, HTMLElement, SVGElement, DocumentFragment, HTMLDocument...

  /**
   * Quick version of jQuery.
   *
   * @copyright Copyright 2016 Enjolras. All rights reserved.
   * @version 0.0.1
   *
   * @class
   * @constructor
   * @param {Element|String} element
   * @param {Object} options
   */
  var $ = function jQuick ( element, options ) {
    if ( this === undefined ||  this === window ) {
      return $.select( element, options );
    }
    //console.log(jQuick.caller);
    //console.log(arguments.callee);
    this.element = null; //TODO: How about this.node
    this._events = {};
    this.length = 0;

    if ( !element ) { return; }

    if ( typeof element === 'string' ) {
      var expr = element.trim();
      if ( expr[ 0 ] === '<' && expr[ expr.length - 1 ] === '>' && expr.length >= 3 ) {
        element = $.parse( expr );
      }else{
        element = $doc.query( expr );
      }
    }
    //para.nodeType == 1 or 9 or 11, or it is window
    if ( $.asParent( element ) || $.isWindow( element ) ) {
      this.element = this[ 0 ] = element;
      this.length = element ? 1 : 0;
    }

    this.update( options );
  };

  //############################################################
  // Statics methods
  //############################################################

  //var $ = jQuick;


//    $.type = function ( obj ) {
//        return typeof obj;
//    };

  /**
   * Check if obj is instance of jQuick.
   *
   * @static
   * @param {*} obj
   * @returns {Boolean}
   */
  $.isjQuick = function ( obj ) {
    return obj instanceof $;
  };

  /**
   * @todo Why can not use DocumentFragment?
   * @todo <option></option>
   */
  var $doc, doc = window.document,
      table = doc.createElement( 'table' ),
      tableRow = doc.createElement( 'tr' );
  var containers = {
    '*': doc.createElement( 'div' ),
    'tr': doc.createElement( 'tbody' ),
    'td': tableRow, 'th': tableRow,
    'tbody': table, 'thead': table, 'tfoot': table
  };

  /**
   * Parse HTML string.
   *
   * @static
   * @param {String} html
   * @returns {Node}
   */
  $.parse = function ( html ) {
    var idx = html.indexOf( ' ' ), name = html.slice( 1, idx );
    //var div = doc.createElement( 'div' );
    if ( !( name in containers ) ) { name = '*'; }
    var container = containers[ name ];
    container.innerHTML = html;
    return container.firstChild;
  };

  /**
   * to-camel-case => toCamelCase.
   *
   * @static
   * @param {String} expr
   * @returns {String}
   */
  $.toCamelCase = function ( expr ) {
    return expr.replace( /-(.)?/g, function ( match, char ) {
      return char ? char.toUpperCase() : '';
    } );
  };


  $.isWindow = function ( element ) {
    return element === window;
  };

  /**
   * Check if child is Element. HTMLElement or SVGElement.
   *
   * @static
   * @param {*} child
   * @returns {Boolean}
   */
  $.isElement = function ( child ) {
    return child instanceof Element;
    //return child instanceof HTMLElement;
  };

  /**
   * Check if child is Element or DocumentFragment. para.nodeType == 1 or 11.
   *
   * @static
   * @param {*} child
   * @returns {Boolean} - can be as child or not.
   */
  $.asChild = function ( child ) {
    return child instanceof Element || child instanceof DocumentFragment;
    //return child instanceof HTMLElement || child instanceof DocumentFragment;
  };

  /**
   * Check if parent is Element, Document or DocumentFragment. para.nodeType == 1, 9 or 11.
   *
   * @static
   * @param parent
   * @returns {Boolean} - can be as parent or not.
   */
  $.asParent = function ( parent ) {
    //return parent && ( 'childNodes' in parent );
    return parent instanceof Element
        || parent instanceof Document
        || parent instanceof DocumentFragment;
  };

  /*$.bear = function () {

  };*/

  /**
   * Get the Element or DocumentFragment as child.
   *
   * @static
   * @param {Element|DocumentFragment|jQuick} child
   * @returns {Element|DocumentFragment}
   */
  $.extract = function ( child ) {
    if ( $.isjQuick( child ) ) {
      child =  child.element;
    }
    if ( $.asChild( child ) ) {
      return child;
    }
    return null;
  };

  /**
   * Get classList from className.
   *
   * @static
   * @param {String} className
   * @returns {Array}
   */
  $.classList = function ( className ) {
    if ( typeof className === 'string' ) {
      return className.trim().split( /\s+/ );
      //return className.trim().replace( /\s+/, ' ' ).split( ' ' );
    }
  };

  /**
   * Get the proxy of func in context.
   *
   * @todo return func.bind( context );
   * @static
   * @param {Object} context
   * @param {String|Function} func
   * @returns {Function}
   */
  $.proxy = function( context, func ) {
    if ( typeof func === "string" ) {
      func = context[ func ];
    }

    if ( typeof func !== "function") {
      return null;//undefined;
    }

    return function() {
      return func.apply( context, arguments );
    };

  };

  /**
   * Select or create element and return jQuick instance.
   *
   * @static
   * @param {Element|String} element
   * @param {Object} options
   * @returns {jQuick}
   */
  $.select = function ( element, options ) {
    return new $( element, options );
  };

  /**
   * Create fragment and return jQuick instance.
   *
   * @static
   * @param {Object} options
   * @returns {jQuick}
   */
  $.fragment = function ( options ) {
    return new $( doc.createDocumentFragment(), options );
  };

//    $.fragment = function ( html ) {
//        var fragment = doc.createDocumentFragment();
//        var div = doc.createElement( 'div' );
//
//        fragment.appendChild( div );
//        div.innerHTML = html;
//    };

  var $pt = $.prototype;

  $pt.isEmpty = function () {
    return !!this.element;
  };

  //############################################################
  // Get child or self
  //############################################################

  /**
   * Get the childNode at given position.
   *
   * @todo Maybe unnecessary
   * @alias get()
   * @param {Number} idx
   * @returns {Node}
   */
  $pt.at = function ( idx ) {
    var element = this.element;
    //return element ? element.children[ idx ] : null;
    return $.asParent( element ) ? element.childNodes[ idx ] : null;
  };

  /**
   * Get the child at given position.
   *
   * @param {Number} idx
   * @returns {jQuick}
   */
  $pt.child = function ( idx ) {
    var element = this.at( idx );
    return element ? new $( element ) : null;
  };

  /**
   * Get all the children or some by selector.
   *
   * @param {undefined|String} selector
   * @returns {Array}
   */
  $pt.children = function ( selector ) {
    var element = this.element;
    if ( !$.asParent( element ) ) { return null; }

    var i, n, matches, anyway = selector === undefined,
        elements = element.childNodes, children = [];

    element = elements[ 0 ];

    if ( element ) {
      matches = element.matches || element.matchesSelector;
    }

    for ( i = 0, n = elements.length; i < n; ++ i ) {
      element = elements[ i ];
      if ( anyway ||  matches.call( element, selector ) ) {
        children.push( new $( element ) );
      }
    }

    return children;
  };

  /**
   * Clone this instance.
   *
   * @returns {self}
   */
  $pt.clone = function () {
    var element = this.element;
    return ( element instanceof Node ) ? new $( element.cloneNode( true ) ) : new $();
  };

  /**
   * Query element by selector.
   *
   * @todo How about getElementById and getElementByClassName.
   * @param {String} selector
   * @returns {Element}
   */
  $pt.query = function ( selector ) {
    var element = this.element;
    return $.asParent( element ) ? element.querySelector( selector ) : null;
  };
  /**
   * Query all elements by selector.
   *
   * @param {String} selector
   * @returns {Array}
   */
  $pt.queryAll = function ( selector ) {
    var element = this.element;
    return $.asParent( element ) ? element.querySelectorAll( selector ) : [];
  };

  /**
   * Find the jQuick child.
   *
   * @alias select()
   * @param {String}  selector
   * @returns {self}
   */
  $pt.find = function ( selector ) {
    return new $( this.query( selector ) );
  };

  /**
   * Find all the jQuick children.
   *
   * @param {String} selector
   * @returns {Array}
   */
  $pt.findAll = function ( selector ) {
    var i, n, children = [], elements = this.queryAll( selector );
    for ( i = 0, n = elements.length; i < n; ++ i ) {
      children.push( new $( elements[ i ] ) );
    }
    return children;
  };

  //############################################################
  // Update properties, attributes, value and style ...
  //############################################################

  /**
   * Initialize or update the properties, etc., of this instance.
   *
   * @alias set(), init()
   * @param {Object} options
   * @returns {self}
   */
  $pt.update = function ( options ) {
    options = options || {};
    var key, value, func;
    for ( key in options ) {
      if ( !options.hasOwnProperty( key ) ) { continue; }
      func = this[ key ];
      value = options[ key ];
      if ( typeof func === "function" ) {
        func.call( this, value );
        /**
         * @todo
         * var args = Array.isArray( value ) ? value : [ value ];
         * func.apply( this, args );
        */
      } else {
        this.attr( key, value );
      }
    }
    return this;
  };

  var fixHTML = { 'for': 'htmlFor', 'class': 'className'}

  /**
   * Get or set standard properties.
   *
   * @param {String|Object} key
   * @param {undefined|*} value
   * @returns {*|jQuick}
   */
  $pt.prop = function ( key, value ) {
    var element = this.element, existed = value !== undefined;
    if ( !element ) {
      return existed ? this : null;
    }
    if ( typeof key === 'string' ) {
      if ( key in fixHTML ) { key = fixHTML[ key ]; }
      if ( !existed ) {
        return element[ key ];
      } else {
        element[ key ] = value;
      }
    } else if ( typeof key === 'object' ) {
      var options = key;
      for ( key in options ) {
        if ( !options.hasOwnProperty( key ) ) { continue; }
        if ( key in fixHTML ) { key = fixHTML[ key ]; }
        element[ key ] = options[ key ];
      }
    } else {
      throw new TypeError( 'key should be string or object! ' );
    }
    return this;
  };

  /**
   * Get or set attributes. Maybe custom.
   *
   * @param {String|Object} key
   * @param {undefined|*} value
   * @returns {*|jQuick}
   */
  $pt.attr = function ( key, value ) {
    var element = this.element, existed = value !== undefined;
    if ( !element ) {
      return existed ? this : null;
    }
    if ( !element.attributes ) {
      return this.prop( key, value );
    }
    else if ( typeof key === 'string' ) {
      if ( !existed ) {
        return element.getAttribute( key );
      } else {
        element.setAttribute( key, value );
      }
    } else if ( typeof key === 'object' ) {
      var options = key;
      for ( key in options ) {
        if ( options.hasOwnProperty( key ) ) {
          element.setAttribute( key, options[ key ] );
        }
      }
    } else {
      throw new TypeError( 'key should be string or object! ' );
    }
    return this;
  };

  /**
   * Get or set data item. Maybe custom.
   *
   * @param {String|Object} key
   * @param {undefined|*} value
   * @returns {*|jQuick}
   */
  $pt.data = function ( key, value ) {
    return this.attr( 'data-' + key, value );
  };

  /**
   * Get or set value.
   *
   * @todo How about nodeValue, option, select
   * @param {undefined|*} value
   * @returns {*|jQuick}
   */
  $pt.val = function ( value ) {
    var element = this.element;
    if ( element.nodeName === 'select' ) {}//todo
    if ( value === undefined ) {
      return element && element.value;// || element.nodeValue;
    } else if ( element ) {
      element.value = value;
    }
    return this;
  };

  var fixCSS = { 'float': 'cssFloat' };
  /**
   * Get or set style. Maybe computed.
   *
   * @param {String|Object} key
   * @param {undefined|*} value
   * @returns {*|jQuick}
   */
  $pt.css = function ( key, value ) {
    var element = this.element, existed = value !== undefined,
      style = $.isElement( element ) ? element.style : null;

    if ( !style ) {
      //throw new Error( 'there is no style! ' );
      return existed ? this : null;
    }

    if ( typeof key === 'string' ) {
      key = fixCSS[ key ] || $.toCamelCase( key );
      if ( !existed ) {
        return style[ key ] || window.getComputedStyle( element )[ key ];
      } else {
        style[ key ] = value;
      }
    } else if ( typeof key === 'object' ) {
      var options = key;
      for ( key in options ) {
          if ( options.hasOwnProperty( key ) ) {
            key = fixCSS[ key ] || $.toCamelCase( key );
            style[ key ] = options[ key ];
          }
      }
    } else {
      throw new TypeError( 'key should be string or object! ' );
    }
    return this;
  };

  $pt.focus = function () {
    var element = this.element;
    if ( $.isElement( element) || $.isWindow( element) ) {
      element.focus();
    }
    return this;
  };

  //############################################################
  // Class
  //############################################################

  /**
   * It is a shim class for element.classList.
   * @todo more APIs, like item(), length...
   * @class
   * @constructor
   * @param {Element} element
   */
  function ClassList ( element ) {
    this.element = element;
    this.items = element.className.trim().split( /\s+/ );
  }

  ClassList.prototype = {
    constructor: ClassList,

    get length () {
      return this.items.length;
    },

    item: function ( index ) {
      return this.items[ index ];
    },

    /**
     * Check if this classList has given className.
     *
     * @param {String} name
     * @returns {Boolean}
     */
    contains: function ( name ) {
      var i, len, items = this.items;
      for ( i = 0, len = items.length; i < len; ++i ) {
        if ( items[ i ] === name ) { return true; }
      }
      return false;
    },

    /**
     * Add given className into classList.
     *
     * @param {String} name
     * @param {Boolean} sure
     * @returns {Boolean}
     */
    add: function ( name,/*INTERNAL*/sure ) {
      var items = this.items;
      if ( sure || !this.has( name ) ) {
        items.push( name );
        this.element.className += ' ' + name;
        return true;
      }
      return false;
    },

    /**
     * Remove given className from classList.
     *
     * @param {String} name
     * @returns {Boolean}
     */
    remove: function ( name ) {
      var i, len, items = this.items;//, className = this.element.className;
      for ( i = 0, len = items.length; i < len; ++i ) {
        if ( items[ i ] === name ) {
          items.splice( i, 1 );
          this.element.className = this.element.className.replace( name, '' );
          return true;
        }
      }
      return false;
    },

    /**
     * Toggle given className in classList.
     *
     * @param {String} name
     * @returns {Boolean}
     */
    toggle: function ( name ) {
      if ( !this.remove( name ) ) {
        this.add( name, true );
      }
    }
  };

  /**
   * Update classList and className with given method.
   *
   * todo As internal method, or check if func is a function.
   * @static
   * @param {ClassList|DOMTokenList} classList
   * @param {String} className - like 'btn' or 'btn active'
   * @param {String} method - 'add', 'remove' and 'toggle'
   */
  ClassList._update = function ( classList, className, method ) {
    var i, len, func, names = className.trim().split( /\s+/ );
    func = classList[ method ];
    for ( i = 0, len = names.length; i < len; ++i ) {
      func.call( classList, names[ i ] )
    }
  };

  /**
   * Get the classList of element. Maybe created.
   *
   * @returns {ClassList|DOMTokenList}
   */
  $pt.classList = function () {
    var element = this.element;
    if ( !element ) { return null; }
    // IE11 do not support classList methods
    if ( !( 'classList' in element) || !( 'add' in element.classList ) ) {
      element.classList = new ClassList( element );
    }
    return element.classList;
  };

  /**
   * Check if this element has given class name.
   *
   * @param name - 'btn' but not 'btn active'
   * @returns {Boolean}
   */
  $pt.hasClass = function ( name ) {
    return this.classList().contains( name );
  };

  /**
   * Add given class name.
   *
   * @param {String} name - like 'btn' or 'btn active'
   * @returns {self}
   */
  $pt.addClass = function ( name ) {
    ClassList._update( this.classList(), name, 'add' );
    return this;
  };

  /**
   * Remove given class name.
   *
   * @param {String} name - like 'btn' or 'btn active'
   * @returns {self}
   */
  $pt.removeClass = function ( name ) {
    ClassList._update( this.classList(), name, 'remove' );
    return this;
  };

  /**
   * Toggle given class name.
   *
   * @param {String} name - like 'btn' or 'btn active'
   * @returns {self}
   */
  $pt.toggleClass = function ( name ) {
    ClassList._update( this.classList(), name, 'toggle' );
    return this;
  };


  //############################################################
  // Adjust content
  //############################################################

  /**
   * Get or set content by key.
   *
   * @param {String} key
   * @param {undefined|String} value
   * @returns {String|jQuick}
   */
  $pt._content = function ( key, value ) {
    var element = this.element;
    if ( value === undefined ) {
      return element ? element[ key ] : null;
    }

    if ( element && ( key in element ) ) {
      element[ key ] = value;
    }
    return this;
  };

  /**
   * Get or set innerHTML.
   *
   * @param {undefined|String} value
   * @returns {String|jQuick}
   */
  $pt.html = function ( value ) {
    return this._content( 'innerHTML', value );
    /*var element = this.element;
    if ( typeof value === 'string' && 'innerHTML' in element ) {
      element.innerHTML = value;
      return this;
    }
    return element ? element.innerHTML : null;*/
  };

  /**
   * Get or set textContent.
   *
   * @param {undefined|String} value
   * @returns {String|jQuick}
   */
  $pt.text = function ( value ) {
    return this._content( 'textContent', value );
    /*var element = this.element;
    if ( typeof value === 'string' && 'textContent' in element ) {
      element.textContent = value;
      return this;
    }
    return element ? element.textContent : null;*/
  };

  /**
   * Empty the content.
   *
   * @returns {self}
   */
  $pt.empty = function () {
      //this.text( '' );
    return this.html( '' );
//        var element = this.element;
//        if ( element ) {
//            element.innerHTML = '';
//        }
//        return this;
  };

  /**
   * Adjust the structure in this element.
   *
   * @todo As internal method, or check if func is a function.
   * @param {Element|DocumentFragment|jQuick} child
   * @param {Element|DocumentFragment|jQuick|undefined} node
   * @param {String} method - 'insertBefore','appendChild','removeChild',...
   * @returns {self}
   */
  $pt._adjust = function ( node, child, method ) {
    node = $.extract( node ); child = $.extract( child );
    var element = this.element, func;// = element ? element[ method ] : null;
    if ( element &&  node && ( func = element[ method ] ) ) {
      //func = element[ method ];
      func.call( element, node, child );
    }
    return this;
  };

  /**
   * Insert child before node in this element.
   *
   * @alias prepend()
   * @param {Element|DocumentFragment|jQuick|String} node
   * @param {Element|DocumentFragment|jQuick} child
   * @returns {self}
   */
  $pt.insert = function ( node, child ) {
    if ( typeof node === 'string' ) {
      node = $.parse( node );
    }
    return this._adjust( node, child, 'insertBefore');
    /*child = $.extract( child ); node = $.extract( node );
    var element = this.element;
    if ( element &&  child ) {
      element.insertBefore( child, node );
    }
    return this;*/
  };

  /**
   * Append child to this element.
   *
   * @param {Element|DocumentFragment|jQuick|String} node
   * @returns {self}
   */
  $pt.append = function ( node ) {
    if ( typeof node === 'string' ) {
      node = $.parse( node );
    }
    return this._adjust( node, undefined, 'appendChild' );
    /*child = $.extract( child );
    var element = this.element;
    if ( element && child ) {
      element.appendChild( child );
    }
    return this;*/
  };

  /**
   * Remove child from this element.
   *
   * @param {Element|DocumentFragment|jQuick} child
   * @returns {self}
   */
  $pt.depart = function ( child ) {
    return this._adjust( child, undefined, 'removeChild' );
    /*child = $.extract( child );
    var element = this.element;
    if ( element && child ) {
      element.removeChild( child );
    }
    return this;*/
  };

  /**
   * Remove this element from its parent.
   *
   * @todo 'destroy' is better.
   * @returns {self}
   */
  $pt.remove = function () {
    var element = this.element;
    var parent = element ? element.parentNode : null;
    if ( parent ) {
      parent.removeChild( element );
    }
    return this;
  };

  /**
   * Replace child with node in this element.
   *
   * @param {Element|DocumentFragment|jQuick|String} node
   * @param {Element|DocumentFragment|jQuick} child
   * @returns {self}
   */
  $pt.replace = function ( node, child ) {
    if ( typeof node === 'string' ) {
      node = $.parse( node );
    }
    return this._adjust( node, child, 'replaceChild' );
    /*child = $.extract( child ); node = $.extract( node );
    var element = this.element;
    if ( element && child && node ) {
      element.replaceChild( child, node );
    }
    return this;*/
  };

  /**
   * Replace this element with node in its parent.
   *
   * @todo Not nice.
   * @param {Element|DocumentFragment|jQuick|String} node
   * @returns {self}
   */
  $pt.replaceWith = function ( node ) {
    var element = this.element;
    var parent = element ? element.parentNode : null;
    if ( parent ) {
      ( new $( parent ) ).replace( element, node );
    }
    /*var parent = element ? element.parentNode : null;
    if ( parent ) {
      if ( typeof node === 'string' ) {
        node = $.parse( node );
      }
      parent.replaceChild( element, $.extract( node ) );
    }*/
    return this;
  };
  // (new jQuick(parent)).adjust(element,undefined,'replaceChild');
  // or (new jQuick(parent)).replace( element );

  //############################################################
  // Raw event
  //############################################################
  $pt.on = function ( type, func ) {
    var element = this.element;
    if ( element && ( 'on' + type ) in element ) {
      element.addEventListener( type, func, false );
    }
    return this;
  };

  $pt.off = function ( type, func ) {
    var element = this.element;
    if ( element && ( 'on' + type ) in element ) {
      element.removeEventListener( type, func, false );
    }
    return this;
  };

  /**
   *
   * @todo document.documentElement
   */
  $doc = new $( doc );


  window.jQuick = $;
} )();
