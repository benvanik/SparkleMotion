// Copyright 2011 Ben Vanik. All Rights Reserved.

goog.provide('sm.Sequence');

goog.require('sm.Scope');
goog.require('sm.Timeline');
goog.require('sm.runtime.Runtime');



/**
 * A playback sequence for a given timeline.
 *
 * @constructor
 * @param {sm.runtime.Runtime} runtime Playback runtime.
 * @param {sm.Timeline} timeline Timeline for this playback sequence.
 * @param {sm.Scope} scope The target scope for the timeline.
 */
sm.Sequence = function(runtime, timeline, scope) {
  /**
   * Playback runtime.
   * @private
   * @type {sm.runtime.Runtime}
   */
  this.runtime_ = runtime;
  
  /**
   * The timeline this sequence is playing back.
   * @private
   * @type {sm.Timeline}
   */
  this.timeline_ = timeline;

  /**
   * Target scope for the timeline.
   * @private
   * @type {sm.Scope}
   */
  this.scope_ = scope;

  /**
   * State used by the runtime.
   * @private
   * @type {Object}
   */
  this.state_ = this.runtime_.prepare(timeline, scope);
};


/**
 * Begin playback of the timeline.
 */
sm.Sequence.prototype.play = function(opt_callback) {
  this.runtime_.play(this.state_, opt_callback);
};


/**
 * Stop playback of the timeline.
 */
sm.Sequence.prototype.stop = function() {
  this.runtime_.stop(this.state_);
};
