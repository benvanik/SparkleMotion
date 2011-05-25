// Copyright 2011 Ben Vanik. All Rights Reserved.

goog.provide('sm.Scope');

goog.require('goog.object');



/**
 * A target lookup scope used for resolving animation identifiers.
 *
 * @constructor
 * @param {boolean} browserScope Whether or not to fall back to the browser
 *     element scope.
 * @param {Object.<string, Object>=} opt_map Map of IDs to target objects.
 */
sm.Scope = function(browserScope, opt_map) {
  /**
   * Whether or not this scope can fall back to browser elements.
   * @private
   * @type {boolean}
   */
  this.browserScope_ = browserScope;

  if (opt_map) {
    goog.object.forEach(opt_map, function(value, key) {
      this[key] = value;
    }, this);
  }
};


/**
 * Get a target object by specifier. For example, 'foo' or 'foo.member'.
 * @param {string} specifier The specifier of the object.
 * @return {?Object} Target object, or null if not found.
 */
sm.Scope.prototype.get = function(specifier) {
  var id = specifier;
  var path = null;
  var n = specifier.indexOf('.');
  if (n > 0) {
    id = specifier.substr(0, n);
    path = specifier.substr(n + 1);
  }
  var value = this[id];
  if (!value && this.browserScope_) {
    value = document.getElementById(id);
  }
  while (value && path && path.length) {
    n = path.indexOf('.');
    if (n > 0) {
      id = path.substr(0, n);
      path = path.substr(n + 1);
    } else {
      id = path;
      path = null;
    }
    value = value[id];
  }
  return value;
};


/**
 * The default browser scope, falling back to document.getElementById.
 * @type {sm.Scope}
 */
sm.Scope.browserScope = new sm.Scope(true);
