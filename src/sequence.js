/**
 * @license
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
