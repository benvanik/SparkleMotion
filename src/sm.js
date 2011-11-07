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

goog.require('goog.dom');
goog.require('sm.Scope');
goog.require('sm.Sequence');
goog.require('sm.Timeline');
goog.require('sm.runtime.Runtime');


/**
 * Global runtime singleton.
 * Although it is possible to use separate runtimes in an application, is is
 * encouraged that the shared global runtime is used instead to provide better
 * resource sharing and synchronization.
 * @private
 * @type {sm.runtime.Runtime}
 */
sm.runtime_;


/**
 * Gets the default runtime instance.
 * @return {!sm.runtime.Runtime} Shared runtime.
 */
sm.getDefaultRuntime = function() {
  if (!sm.runtime_) {
    var allowCss = false;
    var tickHz = 60;
    sm.runtime_ = new sm.runtime.Runtime(allowCss, tickHz);
  }
  return sm.runtime_;
};


/**
 * Global browser scope singleton.
 * @private
 * @type {sm.Scope}
 */
sm.browserScope_;


/**
 * Gets the default browser scope instance.
 * @return {!sm.Scope}
 */
sm.getBrowserScope = function() {
  if (!sm.browserScope_) {
    sm.browserScope_ = new sm.Scope(goog.dom.getDomHelper());
  }
  return sm.browserScope_;
};


/**
 * Creates a new timeline. Optionally use the given map for
 * all target lookups (otherwise, document.getElementById will be used).
 * @param {string} name Unique timeline name.
 * @return {!sm.Timeline} A new timeline instance.
 */
sm.createTimeline = function(name) {
  return new sm.Timeline(name);
};


/**
 * Loads a timeline from the given JSON data. Optionally use the given map for
 * all target lookups (otherwise, document.getElementById will be used).
 * @param {!Object} data JSON-serialized timeline.
 * @return {!sm.Timeline} The timeline instance.
 */
sm.loadTimeline = function(data) {
  return sm.Timeline.deserialize(data);
};


/**
 * Sets up a playback sequence.
 * @param {!sm.Timeline} timeline Timeline to start playing.
 * @param {Object.<!Object>|sm.Scope=} opt_scope Target lookup scope.
 * @return {!sm.Sequence} A new playback sequence.
 */
sm.sequenceTimeline = function(timeline, opt_scope) {
  var runtime = sm.getDefaultRuntime();

  var scope = sm.getBrowserScope();
  if (opt_scope) {
    if (opt_scope instanceof sm.Scope) {
      scope = opt_scope;
    } else {
      scope = new sm.Scope(null, opt_scope);
    }
  }

  return new sm.Sequence(runtime, timeline, scope);
};
