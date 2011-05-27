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

// TODO: repeat
// TODO: reverse
// TODO: cull redundant
// TODO: diff timings per attribute:
//   - slice in and out of animation css list
//     animation-name: a, b, c;
//     animation-delay: 0, 1, 2;
//     -> remove b/1/etc

goog.provide('sm.runtime.PlaybackState');

goog.require('goog.asserts');
goog.require('goog.cssom');
goog.require('goog.string');
goog.require('sm.Scope');
goog.require('sm.Timeline');
goog.require('sm.TimingFunction');
goog.require('sm.runtime.CssAnimation');
goog.require('sm.runtime.NumericTween');
goog.require('sm.runtime.Tween');
goog.require('sm.runtime.Timer');
goog.require('sm.runtime.UserAgent');



/**
 * Actively playing sequence state.
 * Intelligently decides, for each animation, if it needs to use CSS Animations
 * or the fallback Javascript runtime.
 * The state can run in one of 3 modes:
 *   - Javascript only - ends when all ticks complete
 *   - CSS Animations only - ends when the last animation ends
 *   - Mixed - ends when the last tween and the last animation ends
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
  this.playToken_ = 0;
  /**
   * Time the playback was started.
   * @type {number}
   */
  this.startTime_ = 0;
  /**
   * Callback for when playback completes.
   * @type {?function(): void}
   */
  this.callback_ = null;

  // Javascript:

  /**
   * All tweens to run in Javascript.
   * @private
   * @type {Array.<sm.runtime.Tween>}
   */
  this.tweens_ = [];
  /**
   * Starting index in the tween list when iterating the list.
   * @private
   * @type {number}
   */
  this.tweenIndex_ = 0;

  // CSS:

  /**
   * All CSS Animations to run.
   * @private
   * @type {Array.<sm.runtime.CssAnimation>}
   */
  this.cssAnimations_ = [];
  /**
   * Whether or not any CSS Animations are running.
   * @private
   * @type {boolean}
   */
  this.anyCssAnimationsRunning_ = false;

  // Construct the tweens/animations
  this.construct_(allowCss && userAgent.hasAnimations);
};


/**
 * Sort routine to order Tweens by starting time.
 * @private
 * @param {sm.runtime.Tween} a Tween A.
 * @param {sm.runtime.Tween} b Tween B.
 * @return {number} Sort result
 */
sm.runtime.PlaybackState.tweenSort_ = function(a, b) {
  return a.startTime - b.startTime;
};


/**
 * Construct the tweens/animations for the given timeline.
 * @private
 * @param {boolean} allowCss Whether to enable CSS Animations.
 */
sm.runtime.PlaybackState.prototype.construct_ = function(allowCss) {
  var animations = this.timeline.getAnimations();

  // Calculate total timeline duration
  /** @type {number} */
  var totalDuration = 0;
  for (var n = 0; n < animations.length; n++) {
    var animation = animations[n];
    var keyframes = animation.getKeyframes();
    for (var m = 0; m < keyframes.length; m++) {
      var keyframe = keyframes[m];
      var time = keyframe.getTime();
      totalDuration = Math.max(totalDuration, time);
    }
  }
  this.duration = totalDuration;

  // Generate appropriate animation type
  var styleSheet = '';
  for (var n = 0; n < animations.length; n++) {
    var animation = animations[n];

    // Resolve target
    var targetSpec = animation.getTarget();
    var target = this.scope.get(targetSpec);
    var useCssAnimations = false;
    if (target instanceof CSSStyleDeclaration) {
      useCssAnimations = allowCss;

    }

    // If CSS, we also need the element (for getComputedStyle)
    /** @type {?HTMLElement} */
    var targetElement = null;
    if (useCssAnimations) {
      goog.asserts.assert(goog.string.endsWith(targetSpec, '.style'));
      var elementSpec = targetSpec.substr(0, targetSpec.length - 6);
      targetElement = /** @type {HTMLElement} */(this.scope.get(elementSpec));
      goog.asserts.assert(targetElement);
    }

    // Add the animation
    if (useCssAnimations) {
      styleSheet += this.addCssAnimation_(animation, targetElement);
    } else {
      this.addJavascriptAnimation_(animation, target);
    }
  }

  // Javascript post-processing
  if (this.tweens_.length) {
    // Let the runtime know we need ticking
    this.needsTick = true;

    // Sort tweens by starting time
    this.tweens_.sort(sm.runtime.PlaybackState.tweenSort_);
  }

  // CSS post-processing
  if (this.cssAnimations_.length) {
    // Add a new stylesheet to the document
    // TODO: profile new <style> vs. appending rules
    if (styleSheet.length) {
      goog.cssom.addCssText(styleSheet);
    }
  }
};


/**
 * Add an animation using Javascript tweens.
 * @private
 * @param {sm.Animation} animation The animation to add.
 * @param {Object} target Object being animated.
 */
sm.runtime.PlaybackState.prototype.addJavascriptAnimation_ =
    function(animation, target) {
  //
};


/**
 * Add an animation using CSS Animations.
 * @private
 * @param {sm.Animation} animation The animation to add.
 * @param {HTMLElement} element Element being animated.
 * @return {string} A CSS fragment to add to the style sheet or an empty string.
 */
sm.runtime.PlaybackState.prototype.addCssAnimation_ =
    function(animation, element) {
  //
  return '';
};


/**
 * Start playback.
 * @param {number} playToken Unique playback token.
 * @param {function(): void|undefined} opt_callback Function to call when
 *     completed.
 */
sm.runtime.PlaybackState.prototype.start = function(playToken, opt_callback) {
  this.playing = true;
  this.playToken_ = playToken;
  this.startTime_ = goog.now();
  this.callback_ = opt_callback || null;

  // Javascript:
  this.tweenIndex_ = 0;

  // CSS:
  if (this.cssAnimations_.length) {
    this.anyCssAnimationsRunning_ = true;

    // TODO: callback on event instead of guessing
    var self = this;
    window.setTimeout(function() {
      if (self.playToken_ === playToken) {
        self.ended();
      }
    }, this.duration * 1000);

    // Set all initial state/clear current animations
    for (var n = 0; n < this.cssAnimations_.length; n++) {
      var animation = this.cssAnimations_[n];
      animation.clearStyle(false);
    }

    // After 1 browser tick, set all animations
    // This is required because one cannot clearStyle and setStyle in the same
    // pass as the browser will coalesce style updates
    window.setTimeout(function() {
      goog.array.forEach(self.cssAnimations_, function(value) {
        value.setStyle();
      });
    }, 0);
  } else {
    this.anyCssAnimationsRunning_ = false;
  }
};


/**
 * Called once per tick, if needsTick is true.
 * @param {number} time The current time.
 * @return {boolean} True if the state is still ticking.
 */
sm.runtime.PlaybackState.prototype.tick = function(time) {
  goog.asserts.assert(this.needsTick);

  var t = time - this.startTime_;

  var anyUpdating = false;

  var firstIndex = this.tweens_.length - 1;
  for (var n = this.tweenIndex_; n < this.tweens_.length; n++) {
    var tween = this.tweens_[n];
    if (tween.startTime > t) {
      break;
    }
    if (tween.tick(t)) {
      anyUpdating = true;
      firstIndex = Math.min(firstIndex, n);
    }
  }
  this.tweenIndex_ = firstIndex;

  if (!anyUpdating && firstIndex < this.tweens_.length) {
    if (!this.anyCssAnimationsRunning_) {
      // Done
      this.ended();
    }
  }

  return anyUpdating;
};


/**
 * Called when the state has ended playback.
 */
sm.runtime.PlaybackState.prototype.ended = function() {
  var callback = this.callback_;
  this.playing = false;
  this.playToken_ = 0;
  this.startTime_ = 0;
  this.callback_ = null;

  // Javascript:
  this.tweenIndex_ = 0;

  // CSS:
  this.anyCssAnimationsRunning_ = false;
  if (this.cssAnimations_.length) {
    goog.array.forEach(this.cssAnimations_, function(value) {
      value.clearStyle(false);
    });
  }

  if (callback) {
    callback();
  }
};

