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

goog.provide('sm.runtime.Runtime');

goog.require('goog.array');
goog.require('goog.string');
goog.require('sm.Scope');
goog.require('sm.Timeline');
goog.require('sm.TimingFunction');
goog.require('sm.runtime.PlaybackState');
goog.require('sm.runtime.NumericTween');
goog.require('sm.runtime.Timer');
goog.require('sm.runtime.Tween');
goog.require('sm.runtime.UserAgent');



/**
 * Animation runtime engine.
 *
 * @constructor
 * @param {boolean=} opt_allowCss Whether to enable CSS Animations for
 *     animations that support it; default true.
 * @param {number=} opt_tickHz Ticks/second; default 60.
 */
sm.runtime.Runtime = function(opt_allowCss, opt_tickHz) {
  /**
   * Shared user agent utility instance.
   * @private
   * @type {sm.runtime.UserAgent}
   */
  this.userAgent_ = new sm.runtime.UserAgent();

  /**
   * Whether to enable CSS Animations.
   * @private
   * @type {boolean}
   */
  this.allowCss_ = goog.isDef(opt_allowCss) ? opt_allowCss : true;

  /**
   * Runtime timer.
   * @private
   * @type {sm.runtime.Timer}
   */
  this.timer_ = new sm.runtime.Timer(this.userAgent_,
      goog.isDef(opt_tickHz) ? opt_tickHz : 60);
  this.timer_.addCallback(this.tick_, this);

  /**
   * Unique token used to keep track of playback state runs.
   * @private
   * @type {number}
   */
  this.nextPlayToken_ = 1;

  /**
   * Active playback states that need ticking.
   * @private
   * @type {Array.<sm.runtime.PlaybackState>}
   */
  this.tickableStates_ = [];
};


/**
 * Timer callback for processing Javascript animations.
 * @private
 */
sm.runtime.Runtime.prototype.tick_ = function(time) {
  for (var n = 0; n < this.tickableStates_.length; n++) {
    var state = this.tickableStates_[n];
    if (!state.tick(time)) {
      // Finished
      this.tickableStates_.splice(n, 1);
      n--;
    }
  }

  return (this.tickableStates_.length > 0);
};


/**
 * Prepare a timeline for playback.
 * @param {sm.Timeline} timeline Timeline for this playback sequence.
 * @param {sm.Scope} scope The target scope for the timeline.
 * @return {sm.runtime.PlaybackState} Runtime-specific state information.
 */
sm.runtime.Runtime.prototype.prepare = function(timeline, scope) {
  var state = new sm.runtime.PlaybackState(this.userAgent_, timeline, scope,
      this.allowCss_);
  return state;
};


/**
 * Begin playback of a timeline.
 * @param {sm.runtime.PlaybackState} state Runtime-specific state information.
 * @param {function(): void|undefined} opt_callback Function called when the
 *     timeline ends.
 */
sm.runtime.Runtime.prototype.play = function(state, opt_callback) {
  // Query if already playing and stop
  var alreadyPlaying = state.playing;
  if (alreadyPlaying) {
    state.ended();
  }

  // Reset/start
  state.start(this.nextPlayToken_++, opt_callback);

  // Add to tick list and start the timer (if needed)
  if (state.needsTick) {
    if (!alreadyPlaying) {
      this.tickableStates_.push(state);
    }
    this.timer_.start();
  }
};


/**
 * Stop a currently playing timeline.
 * @param {sm.runtime.PlaybackState} state Runtime-specific state information.
 */
sm.runtime.Runtime.prototype.stop = function(state) {
  if (!state.playing) {
    return;
  }

  // Remove from tick list (if required)
  if (state.needsTick) {
    goog.array.remove(this.tickableStates_, state);
  }

  // Stop the timer if nothing else needs to be ticked
  if (!this.tickableStates_.length) {
    this.timer_.stop();
  }

  // End the state (fire callbacks/etc)
  // Done at the end in case the callback re-queues animations
  state.ended();
};
