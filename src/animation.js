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

goog.provide('sm.Animation');

goog.require('goog.array');
goog.require('sm.Keyframe');



/**
 * An animation defined against a target object.
 *
 * @constructor
 * @param {string} target Target object specifier.
 * @param {boolean=} opt_repeat Whether to repeat indefinitely.
 * @param {boolean=} opt_alternate Whether to alternate direction on repeats.
 */
sm.Animation = function(target, opt_repeat, opt_alternate) {
  /**
   * Target object specifier.
   * @private
   * @type {string}
   */
  this.target_ = target;

  /**
   * Whether to repeat once the animation completes until the timeline ends.
   * @private
   * @type {boolean}
   */
  this.repeat_ = opt_repeat || false;

  /**
   * All keyframes in the animation.
   * @private
   * @type {!Array.<!sm.Keyframe>}
   */
  this.keyframes_ = [];

  /**
   * Whether the animation is dirty and needs re-rendering.
   * @private
   * @type {boolean}
   */
  this.dirty_ = false;
};


/**
 * Gets the specifier of the target object.
 * @return {string} Target object specifier.
 */
sm.Animation.prototype.getTarget = function() {
  return this.target_;
}


/**
 * Gets the flag indicating whether the animation should repeat.
 * @return {boolean} Whether or not the animation should repeat indefinitely.
 */
sm.Animation.prototype.getRepeat = function() {
  return this.repeat_;
};


/**
 * Sets the repeat flag.
 * @param {boolean} repeat Whether to repeat indefinitely.
 * @return {!sm.Animation} The animation, for chaining.
 */
sm.Animation.prototype.setRepeat = function(repeat) {
  this.repeat_ = repeat;
  this.dirty_ = true;
  return this;
};


/**
 * Creates and adds a new keyframe.
 * @return {!sm.Keyframe} A new keyframe instance.
 */
sm.Animation.prototype.keyframe = function(time) {
  var keyframe = new sm.Keyframe(time);
  this.addKeyframe(keyframe);
  return keyframe;
};


/**
 * Alias for keyframe - creates and adds a new keyframe.
 * @return {!sm.Keyframe} A new keyframe instance.
 */
sm.Animation.prototype.k = sm.Animation.prototype.keyframe;


/**
 * Adds a keyframe to the animation.
 * @param {!sm.Keyframe} keyframe A keyframe to add.
 * @return {!sm.Animation} The animation, for chaining.
 */
sm.Animation.prototype.addKeyframe = function(keyframe) {
  this.keyframes_.push(keyframe);
  this.dirty_ = true;
  return this;
};


/**
 * Gets the list of keyframes in the animation.
 * @return {!Array.<!sm.Keyframe>} All keyframes in the animation.
 *     Do not mutate.
 */
sm.Animation.prototype.getKeyframes = function() {
  return this.keyframes_;
};


/**
 * Gets the total duration of the animation.
 * @return {number} Total duration, in ms.
 */
sm.Animation.prototype.getDuration = function() {
  var totalDuration = 0;
  goog.array.forEach(this.keyframes_,
      /**
       * @param {!sm.Keyframe} keyframe Keyframe.
       */
      function (keyframe) {
        var time = keyframe.getTime();
        totalDuration = Math.max(totalDuration, time);
      });
  return totalDuration;
};


/**
 * Removes a keyframe from the animation.
 * @param {!sm.Keyframe} keyframe A keyframe to remove.
 * @return {!sm.Animation} The animation, for chaining.
 */
sm.Animation.prototype.removeKeyframe = function(keyframe) {
  if (goog.array.remove(this.keyframes_, keyframe)) {
    this.dirty_ = true;
  }
  return this;
};


/**
 * Removes all keyframes from the animation.
 * @return {!sm.Animation} The animation, for chaining.
 */
sm.Animation.prototype.removeAllKeyframes = function() {
  this.keyframes_.length = 0;
  this.dirty_ = true;
  return this;
};


/**
 * Deserializes an animation from a previously-serialized JSON object.
 * @param {!Object} data JSON-format serialized animation.
 * @return {!sm.Animation} A new animation initialized with the given data.
 */
sm.Animation.deserialize = function(data) {
  var target = /** @type {string} */ (data['target']);
  var repeat = /** @type {boolean|undefined} */ (data['repeat']);
  var animation = new sm.Animation(target, repeat);

  var dataKeyframes = /** @type {!Array.<!Object>} */ (data['keyframes']);
  goog.array.forEach(dataKeyframes,
      /**
       * @param {!Object} dataKeyframe Keyframe JSON.
       */
      function(dataKeyframe) {
        var keyframe = sm.Keyframe.deserialize(dataKeyframe);
        animation.addKeyframe(keyframe);
      });

  return animation;
};


/**
 * Serializes the animation to a compact and round-trippable JSON object.
 * @return {!Object} A JSON-format serialization of the entire animation.
 */
sm.Animation.prototype.serialize = function() {
  var data = {
    'target': this.target_,
    'repeat': this.repeat_,
    'keyframes': new Array(this.keyframes_.length)
  };

  var dataKeyframes = data['keyframes'];
  goog.array.forEach(this.keyframes_,
      /**
       * @param {!sm.Keyframe} keyframe Source keyframe.
       * @param {number} n Index.
       */
      function(keyframe, n) {
        dataKeyframes[n] = keyframe.serialize();
      });

  return data;
};

