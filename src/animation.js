// Copyright 2011 Ben Vanik. All Rights Reserved.

goog.provide('sm.Animation');

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
  this.repeat_ = goog.isDef(opt_repeat) ? opt_repeat : false;

  /**
   * Whether to alternate direction on repeats.
   * @private
   * @type {boolean}
   */
  this.alternate_ = goog.isDef(opt_alternate) ? opt_alternate : false;

  /**
   * All keyframes in the animation.
   * @private
   * @type {Array.<sm.Keyframe>}
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
 * Get the specifier of the target object.
 * @return {string} Target object specifier.
 */
sm.Animation.prototype.getTarget = function() {
  return this.target_;
}


/**
 * Get the flag indicating whether the animation should repeat.
 * @return {boolean} Whether or not the animation should repeat indefinitely.
 */
sm.Animation.prototype.getRepeat = function() {
  return this.repeat_;
};


/**
 * Set the repeat flag.
 * @param {boolean} repeat Whether to repeat indefinitely.
 * @return {sm.Animation} The animation, for chaining.
 */
sm.Animation.prototype.setRepeat = function(repeat) {
  this.repeat_ = repeat;
  this.dirty_ = true;
  return this;
};


/**
 * Get the flag indicating whether the animation should alternate direction on
 * repeat.
 * @return {boolean} Whether or not the animation should alternate on repeat.
 */
sm.Animation.prototype.getAlternate = function() {
  return this.alternate_;
};


/**
 * Set the repeat alternate direction flag.
 * @param {boolean} alternate Whether to alternate direction on repeats.
 * @return {sm.Animation} The animation, for chaining.
 */
sm.Animation.prototype.setAlternate = function(alternate) {
  this.alternate_ = alternate;
  this.dirty_ = true;
  return this;
};


/**
 * Create and add a new keyframe.
 * @return {sm.Keyframe} A new keyframe instance.
 */
sm.Animation.prototype.keyframe = function(time) {
  var keyframe = new sm.Keyframe(time);
  this.addKeyframe(keyframe);
  return keyframe;
};


/**
 * Add a keyframe to the animation.
 * @param {sm.Keyframe} keyframe A keyframe to add.
 * @return {sm.Animation} The animation, for chaining.
 */
sm.Animation.prototype.addKeyframe = function(keyframe) {
  this.keyframes_.push(keyframe);
  this.dirty_ = true;
  return this;
};


/**
 * Get the list of keyframes in the animation.
 * @return {Array.<sm.Keyframe>} All keyframes in the animation. Do not mutate.
 */
sm.Animation.prototype.getKeyframes = function() {
  return this.keyframes_;
};


/**
 * Remove a keyframe from the animation.
 * @param {sm.Keyframe} keyframe A keyframe to remove.
 * @return {sm.Animation} The animation, for chaining.
 */
sm.Animation.prototype.removeKeyframe = function(keyframe) {
  if (goog.array.remove(this.keyframes_, keyframe)) {
    this.dirty_ = true;
  }
  return this;
};


/**
 * Remove all keyframes from the animation.
 * @return {sm.Animation} The animation, for chaining.
 */
sm.Animation.prototype.removeAllKeyframes = function() {
  this.keyframes_.length = 0;
  this.dirty_ = true;
  return this;
};


/**
 * Deserialize an animation from a previously-serialized JSON object.
 * @param {Object} data JSON-format serialized animation.
 * @return {sm.Animation} A new animation initialized with the given data.
 */
sm.Animation.deserialize = function(data) {
  var animation = new sm.Animation(data.target, data.repeat, data.alternate);
  for (var n = 0; n < data.keyframes.length; n++) {
    var keyframe = sm.Keyframe.deserialize(data.keyframes[n]);
    animation.addKeyframe(keyframe);
  }
  return animation;
};


/**
 * Serialize the animation to a compact and round-trippable JSON object.
 * @return {Object} A JSON-format serialization of the entire animation.
 */
sm.Animation.prototype.serialize = function() {
  var data = {
    target: this.target_,
    repeat: this.repeat_,
    alternate: this.alternate_,
    keyframes: new Array(this.keyframes_.length)
  };
  for (var n = 0; n < this.keyframes_.length; n++) {
    var keyframe = this.keyframes_[n];
    data.keyframes[n] = keyframe.serialize();
  }
  return data;
};

