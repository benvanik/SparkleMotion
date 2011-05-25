// Copyright 2011 Ben Vanik. All Rights Reserved.

goog.provide('sm.runtime.Runtime');



/**
 * Base animation runtime.
 *
 * @constructor
 */
sm.runtime.Runtime = function() {
};


/**
 * Prepare a timeline for playback.
 * @param {sm.Timeline} timeline Timeline for this playback sequence.
 * @param {sm.Scope} scope The target scope for the timeline.
 * @return {Object} Runtime-specific state information.
 */
sm.runtime.Runtime.prototype.prepare = goog.abstractMethod;


/**
 * Begin playback of a timeline.
 * @param {Object} state Runtime-specific state information.
 * @param {function=} opt_callback Function called when the timeline ends.
 */
sm.runtime.Runtime.prototype.play = goog.abstractMethod;


/**
 * Stop a currently playing timeline.
 * @param {Object} state Runtime-specific state information.
 */
sm.runtime.Runtime.prototype.stop = goog.abstractMethod;
