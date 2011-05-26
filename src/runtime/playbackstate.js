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

goog.provide('sm.runtime.PlaybackState');

goog.require('goog.asserts');



/**
 * Actively playing sequence state.
 * Intelligently decides, for each animation, if it needs to use CSS Animations
 * or the fallback Javascript runtime.
 *
 * @constructor
 * @param {sm.runtime.UserAgent} userAgent User-agent utility.
 * @param {sm.Timeline} timeline Timeline for this playback sequence.
 * @param {sm.Scope} scope The target scope for the timeline.
 * @param {boolean} allowCss Whether to enable CSS Animations.
 */
sm.runtime.PlaybackState = function(userAgent, timeline, scope, allowCss) {
  /**
   * Shared user agent utility.
   * @type {sm.runtime.UserAgent}
   */
  this.userAgent = userAgent;
  /**
   * Timeline being played.
   * @type {sm.Timeline}
   */
  this.timeline = timeline;
  /**
   * Scope for timeline lookups.
   * @type {sm.Scope}
   */
  this.scope = scope;

  /**
   * Total duration of the timeline, in seconds.
   */
  this.duration = 0;
  /**
   * Whether the state needs to be ticked.
   * @type {boolean}
   */
  this.needsTick = false;

  /**
   * Whether the state is actively being played.
   * @type {boolean}
   */
  this.playing = false;
  /**
   * Unique play token for the given playback.
   * @type {number}
   */
  this.playToken = 0;
  /**
   * Time the playback was started.
   * @type {number}
   */
  this.startTime = 0;
  /**
   * Callback for when playback completes.
   * @type {?function(): void}
   */
  this.callback = null;

  // allowCss
};


/**
 * Start playback.
 * @param {number} playToken Unique playback token.
 * @param {function(): void|undefined} opt_callback Function to call when
 *     completed.
 */
sm.runtime.PlaybackState.prototype.start = function(playToken, opt_callback) {
  this.playing = true;
  this.playToken = playToken;
  this.startTime = goog.now();
  this.callback = opt_callback || null;

  // CSS:
  /*
  // TODO: callback on event instead of guessing
  window.setTimeout(function() {
    if (state.playToken === playToken) {
      if (state.callback) {
        state.callback();
      }
      state.reset();
    }
  }, state.totalDuration * 1000);

  goog.array.forEach(state.animations, function(value) {
    value.clearStyle(false);
  });
  window.setTimeout(function() {
    goog.array.forEach(state.animations, function(value) {
      value.setStyle();
    });
  }, 0);
  */
};


/**
 * Called once per tick, if needsTick is true.
 * @param {number} time The current time.
 */
sm.runtime.PlaybackState.prototype.tick = function(time) {
  goog.asserts.assert(this.needsTick);
};


/**
 * Called when the state has ended playback.
 */
sm.runtime.PlaybackState.prototype.ended = function() {
  var callback = this.callback;
  this.playing = false;
  this.playToken = 0;
  this.startTime = 0;
  this.callback = null;

  // CSS:
  /*
  goog.array.forEach(state.animations, function(value) {
    value.clearStyle(false);
  });
  */

  if (callback) {
    callback();
  }
};

