//##############################################################################
// src/entry.js
//##############################################################################

'use strict';

/**
 * @copyright Copyright 2016 Enjolras. All rights reserved.
 * @namespace
 */
var ENJ = {};

var CRE = createjs;

//ENJ.invalid = false;

var RES = new CRE.LoadQueue();
RES.getRes = RES.getResult;

ENJ.assign = function(target/*,..sources*/) {
  if (typeof target !== "object" && typeof target !== "function") {
    throw new TypeError("target must be object or function");
  }

  var source, prop, i, len = arguments.length;

  for (i = 1; i < len; i++) {
    source = arguments[i];
    for (prop in source) {
      if (source.hasOwnProperty(prop )) {
        Object.defineProperty(target, prop, Object.getOwnPropertyDescriptor(source, prop));
      }
    }
  }

  return target;
};


ENJ.defineClass = function (protoProps, staticProps) {
  var subClass, superClass;

  if ('extend' in protoProps) {
    superClass = protoProps.extend;
    if (typeof superClass !== 'function') {
      throw new TypeError("superClass must be a function");
    }
  } else {
    superClass = Object;
  }

  if ('constructor' in protoProps) {
    subClass = protoProps.constructor;
    if (typeof subClass !== 'function') {
      throw new TypeError("subClass must be a function");
    }
  } else {
    subClass = function() {
      superClass.apply(this, arguments);
    }
  }

  subClass.prototype = Object.create(superClass.prototype);

  if (protoProps) { ENJ.assign(subClass.prototype, protoProps); }
  if (staticProps) { ENJ.assign(subClass, superClass, staticProps); }

  Object.defineProperty(subClass.prototype, 'constructor', {
    value: subClass, enumerable: false, writable: true, configurable: true
  });

  return subClass;
};