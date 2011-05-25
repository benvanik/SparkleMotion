// Copyright 2011 Ben Vanik. All Rights Reserved.

goog.provide('sm.runtime.CssRuntime');

goog.require('sm.Scope');
goog.require('sm.Timeline');
goog.require('sm.runtime.Runtime');



/**
 * An animation runtime using CSS Animations.
 *
 * @constructor
 * @extends {sm.runtime.Runtime}
 */
sm.runtime.CssRuntime = function() {
  goog.base(this);
}
goog.inherits(sm.runtime.CssRuntime, sm.runtime.Runtime);


/**
 * Detect if the CSS runtime is supported in the current browser.
 * @return {boolean} True if the CSS runtime is supported on this browser.
 */
sm.runtime.CssRuntime.detect = function() {
  // TODO: detect if CSS Animations are supported
  return false;
};


/**
 * @override
 */
sm.runtime.CssRuntime.prototype.prepare =  function(timeline, scope) {
  console.log('prepare');
  return {};
};


/**
 * @override
 */
sm.runtime.CssRuntime.prototype.play = function(state, opt_callback) {
  console.log('play');
};


/**
 * @override
 */
sm.runtime.CssRuntime.prototype.stop = function(state) {
  console.log('stop');
};
