// Copyright 2011 Ben Vanik. All Rights Reserved.

goog.provide('sm');

goog.require('sm.Scope');
goog.require('sm.Sequence');
goog.require('sm.Timeline');
goog.require('sm.runtime.CssRuntime');
goog.require('sm.runtime.JavascriptRuntime');
goog.require('sm.runtime.Runtime');


/**
 * Global runtime singleton.
 * @private
 * @type {sm.runtime.Runtime}
 */
sm.runtime_ = null;


/**
 * Setup the global runtime singleton.
 */
sm.setupRuntime_ = function() {
  if (sm.runtime.CssRuntime.detect()) {
    sm.runtime_ = new sm.runtime.CssRuntime();
  } else {
    sm.runtime_ = new sm.runtime.JavascriptRuntime();
  }
};


/**
 * Create a new timeline. Optionally use the given map for
 * all target lookups (otherwise, document.getElementById will be used).
 * @param {string} name Unique timeline name.
 * @return {sm.Timeline} A new timeline instance.
 */
sm.createTimeline = function(name) {
  var timeline = new sm.Timeline(name);
  return timeline;
};


/**
 * Load a timeline from the given JSON data. Optionally use the given map for
 * all target lookups (otherwise, document.getElementById will be used).
 * @param {Object} data JSON-serialized timeline.
 * @return {sm.Timeline} The timeline instance.
 */
sm.loadTimeline = function(data) {
  var timeline = sm.Timeline.deserialize(data);
  return timeline;
};


/**
 * Setup a playback sequence.
 * @param {sm.Timeline} timeline Timeline to start playing.
 * @param {Object.<string, Object>=} opt_scope Target lookup map.
 * @return {sm.runtime.Controller} A new playback sequence.
 */
sm.sequenceTimeline = function(timeline, opt_scope) {
  if (!sm.runtime_) {
    sm.setupRuntime_();
  }

  var scope = goog.isDef(opt_scope) ? new sm.Scope(false, opt_scope) :
      sm.Scope.browserScope;
  var sequence = new sm.Sequence(sm.runtime_, timeline, scope);
  return sequence;
};
