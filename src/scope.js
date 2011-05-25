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
 * Get a target object by ID.
 * @param {string} id The unique ID of the object.
 * @return {?Object} Target object, or null if not found.
 */
sm.Scope.prototype.get = function(id) {
  var value = this[id];
  if (value) {
    return value;
  } else if (this.browserScope_) {
    return document.getElementById(id);
  }
  return null;
};


/**
 * The default browser scope, falling back to document.getElementById.
 * @type {sm.Scope}
 */
sm.Scope.browserScope = new sm.Scope(true);
