/**
 * Copyright 2011 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
 * @return {sm.Sequence} A new playback sequence.
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
