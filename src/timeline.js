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

goog.provide('sm.Timeline');

goog.require('sm.Animation');



/**
 * A timeline containing multiple overlapping animations.
 *
 * @constructor
 * @param {string} name Unique timeline name.
 */
sm.Timeline = function(name) {
  /**
   * Unique timeline name, used for the UI and referencing the timeline in code.
   * @private
   * @type {string}
   */
  this.name_ = name;

  /**
   * All animations in the timeline.
   * @private
   * @type {Array.<sm.Animation>}
   */
  this.animations_ = [];

  /**
   * Whether the timeline is dirty and needs re-rendering.
   * @private
   * @type {boolean}
   */
  this.dirty_ = false;
};


/**
 * Get the current unique timeline name.
 * @return {string} Unique timeline name.
 */
sm.Timeline.prototype.getName = function() {
  return this.name_;
};


/**
 * Create and add an animation to the timeline.
 * @param {string} target Target object specifier.
 * @param {boolean=} opt_repeat Whether to repeat indefinitely.
 * @param {boolean=} opt_alternate Whether to alternate direction on repeats.
 * @return {sm.Animation} A new animation instance.
 */
sm.Timeline.prototype.animate = function(target, opt_repeat, opt_alternate) {
  var animation = new sm.Animation(target, opt_repeat, opt_alternate);
  this.addAnimation(animation);
  return animation;
};


/**
 * Add an animation to the timeline.
 * @param {sm.Animation} animation An animation to add.
 * @return {sm.Timeline} The timeline, for chaining.
 */
sm.Timeline.prototype.addAnimation = function(animation) {
  this.animations_.push(animation);
  this.dirty_ = true;
  return this;
};


/**
 * Get the list of animations in the timeline.
 * @return {Array.<sm.Animation>} All animations in the timeline. Do not mutate.
 */
sm.Timeline.prototype.getAnimations = function() {
  return this.animations_;
};


/**
 * Remove an animation from the timeline.
 * @param {sm.Animation} animation An animation to remove.
 * @return {sm.Timeline} The timeline, for chaining.
 */
sm.Timeline.prototype.removeAnimation = function(animation) {
  if (goog.array.remove(this.animations_, animation)) {
    this.dirty_ = true;
  }
  return this;
};


/**
 * Remove all animations from the timeline.
 * @return {sm.Timeline} The timeline, for chaining.
 */
sm.Timeline.prototype.removeAllAnimations = function() {
  this.animations_.length = 0;
  this.dirty_ = true;
  return this;
};


/**
 * Deserialize a timeline from a previously-serialized JSON object.
 * @param {Object} data JSON-format serialized timeline.
 * @return {sm.Timeline} A new timeline initialized with the given data.
 */
sm.Timeline.deserialize = function(data) {
  var timeline = new sm.Timeline(
      /** @type {string} */(data['name']));
  /** @type {Array.<Object>} */
  var dataAnimations = data['animations'];
  for (var n = 0; n < dataAnimations.length; n++) {
    var animation = sm.Animation.deserialize(dataAnimations[n]);
    timeline.addAnimation(animation);
  }
  return timeline;
};


/**
 * Serialize the timeline to a compact and round-trippable JSON object.
 * @return {Object} A JSON-format serialization of the entire timeline.
 */
sm.Timeline.prototype.serialize = function() {
  var data = {
    'name': this.name_,
    'animations': new Array(this.animations_.length)
  };
  var dataAnimations = data['animations'];
  for (var n = 0; n < this.animations_.length; n++) {
    var animation = this.animations_[n];
    dataAnimations[n] = animation.serialize();
  }
  return data;
};

