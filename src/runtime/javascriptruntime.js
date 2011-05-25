// Copyright 2011 Ben Vanik. All Rights Reserved.

goog.provide('sm.runtime.JavascriptRuntime');

goog.require('sm.Scope');
goog.require('sm.Timeline');
goog.require('sm.runtime.Runtime');



/**
 * An animation runtime using native Javascript math.
 *
 * @constructor
 * @extends {sm.runtime.Runtime}
 */
sm.runtime.JavascriptRuntime = function() {
  goog.base(this);
}
goog.inherits(sm.runtime.JavascriptRuntime, sm.runtime.Runtime);


/**
 * @override
 */
sm.runtime.JavascriptRuntime.prototype.prepare =  function(timeline, scope) {
  console.log('prepare');
  return {};
};


/**
 * @override
 */
sm.runtime.JavascriptRuntime.prototype.play = function(state) {
  console.log('play');
};


/**
 * @override
 */
sm.runtime.JavascriptRuntime.prototype.stop = function(state) {
  console.log('stop');
};
