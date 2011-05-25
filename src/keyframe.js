// Copyright 2011 Ben Vanik. All Rights Reserved.

goog.provide('sm.Keyframe');

goog.require('sm.KeyframeAttribute');



/**
 * An individual keyframe in an animation.
 *
 * @constructor
 * @param {number} time Start time of the keyframe.
 */
sm.Keyframe = function(time) {
  /**
   * The time, relative to the timeline start, that this keyframe is at.
   * @private
   * @type {number}
   */
  this.time_ = time;

  /**
   * All attributes the keyframe targets.
   * @private
   * @type {Array.<sm.KeyframeAttribute>}
   */
  this.attributes_ = [];

  /**
   * Whether the keyframe is dirty and needs re-rendering.
   * @private
   * @type {boolean}
   */
  this.dirty_ = false;
};


/**
 * Get the timeline-relative time the keyframe is at, in seconds.
 * @return {number} The keyframe time.
 */
sm.Keyframe.prototype.getTime = function() {
  return this.time_;
}


/**
 * Set the timeline-relative time the keyframe is at, in seconds.
 * @param {number} time Time the keyframe is at, in seconds.
 * @return {sm.Keyframe} The keyframe, for chaining.
 */
sm.Keyframe.prototype.setTime = function(time) {
  this.time_ = time;
  this.dirty_ = true;
  return this;
};


/**
 * Create and add an attribute.
 * @param {string} name Target attribute name.
 * @param {string|number=} opt_value Target attribute value.
 * @param {sm.TimingFunction=} opt_timingFunction Timing function used to
 *     evaluate the keyframe.
 * @return {sm.Keyframe} The keyframe, for chaining.
 */
sm.Keyframe.prototype.attribute = function(name, opt_value,
    opt_timingFunction) {
  var attribute = new sm.KeyframeAttribute(name, opt_value, opt_timingFunction);
  this.addAttribute(attribute);
  return this;
};


/**
 * Add an attribute to the keyframe.
 * @param {sm.KeyframeAttribute} attribute An attribute to add.
 * @return {sm.Keyframe} The keyframe, for chaining.
 */
sm.Keyframe.prototype.addAttribute = function(attribute) {
  this.attributes_.push(attribute);
  this.dirty_ = true;
  return this;
};


/**
 * Get the list of attributes in the keyframe.
 * @return {Array.<sm.KeyframeAttribute>} All attributes in the keyframe.
 *     Do not mutate.
 */
sm.Keyframe.prototype.getAttributes = function() {
  return this.attributes_;
};


/**
 * Remove an attribute from the keyframe.
 * @param {sm.KeyframeAttribute} attribute An attribute to remove.
 * @return {sm.Keyframe} The keyframe, for chaining.
 */
sm.Keyframe.prototype.removeAttribute = function(attribute) {
  if (goog.array.remove(this.attributes_, attribute)) {
    this.dirty_ = true;
  }
  return this;
};


/**
 * Remove all attributes from the keyframe.
 * @return {sm.Keyframe} The keyframe, for chaining.
 */
sm.Keyframe.prototype.removeAllAttributes = function() {
  this.attributes_.length = 0;
  this.dirty_ = true;
  return this;
};


/**
 * Deserialize a keyframe from a previously-serialized JSON object.
 * @param {Object} data JSON-format serialized keyframe.
 * @return {sm.Keyframe} A new keyframe initialized with the given data.
 */
sm.Keyframe.deserialize = function(data) {
  var keyframe = new sm.Keyframe(data.time);
  for (var n = 0; n < data.attributes.length; n++) {
    var attribute = sm.KeyframeAttribute.deserialize(data.attributes[n]);
    keyframe.addAttribute(attribute);
  }
  return keyframe;
};


/**
 * Serialize the keyframe to a compact and round-trippable JSON object.
 * @return {Object} A JSON-format serialization of the entire keyframe.
 */
sm.Keyframe.prototype.serialize = function() {
  var data = {
    time: this.time_,
    attributes: new Array(this.attributes_.length)
  };
  for (var n = 0; n < this.attributes_.length; n++) {
    var attribute = this.attributes_[n];
    data.attributes[n] = attribute.serialize();
  }
  return data;
};

