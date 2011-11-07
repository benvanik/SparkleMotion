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

goog.provide('sm.Keyframe');

goog.require('goog.array');
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
   * @type {!Array.<!sm.KeyframeAttribute>}
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
 * Gets the timeline-relative time the keyframe is at, in seconds.
 * @return {number} The keyframe time.
 */
sm.Keyframe.prototype.getTime = function() {
  return this.time_;
}


/**
 * Sets the timeline-relative time the keyframe is at, in seconds.
 * @param {number} time Time the keyframe is at, in seconds.
 * @return {!sm.Keyframe} The keyframe, for chaining.
 */
sm.Keyframe.prototype.setTime = function(time) {
  this.time_ = time;
  this.dirty_ = true;
  return this;
};


/**
 * Creates and adds an attribute.
 * @param {string} name Target attribute name.
 * @param {string|number=} opt_value Target attribute value.
 * @param {sm.TimingFunction=} opt_timingFunction Timing function used to
 *     evaluate the keyframe.
 * @return {!sm.Keyframe} The keyframe, for chaining.
 */
sm.Keyframe.prototype.attribute = function(name, opt_value,
    opt_timingFunction) {
  var attribute = new sm.KeyframeAttribute(name, opt_value, opt_timingFunction);
  this.addAttribute(attribute);
  return this;
};


/**
 * Alias for attribute - creates and adds an attribute.
 * @param {string} name Target attribute name.
 * @param {string|number=} opt_value Target attribute value.
 * @param {sm.TimingFunction=} opt_timingFunction Timing function used to
 *     evaluate the keyframe.
 * @return {sm.Keyframe} The keyframe, for chaining.
 */
sm.Keyframe.prototype.a = sm.Keyframe.prototype.attribute;


/**
 * Adds an attribute to the keyframe.
 * @param {!sm.KeyframeAttribute} attribute An attribute to add.
 * @return {!sm.Keyframe} The keyframe, for chaining.
 */
sm.Keyframe.prototype.addAttribute = function(attribute) {
  this.attributes_.push(attribute);
  this.dirty_ = true;
  return this;
};


/**
 * Gets the list of attributes in the keyframe.
 * @return {!Array.<!sm.KeyframeAttribute>} All attributes in the keyframe.
 *     Do not mutate.
 */
sm.Keyframe.prototype.getAttributes = function() {
  return this.attributes_;
};


/**
 * Removes an attribute from the keyframe.
 * @param {!sm.KeyframeAttribute} attribute An attribute to remove.
 * @return {!sm.Keyframe} The keyframe, for chaining.
 */
sm.Keyframe.prototype.removeAttribute = function(attribute) {
  if (goog.array.remove(this.attributes_, attribute)) {
    this.dirty_ = true;
  }
  return this;
};


/**
 * Removes all attributes from the keyframe.
 * @return {!sm.Keyframe} The keyframe, for chaining.
 */
sm.Keyframe.prototype.removeAllAttributes = function() {
  this.attributes_.length = 0;
  this.dirty_ = true;
  return this;
};


/**
 * Deserializes a keyframe from a previously-serialized JSON object.
 * @param {!Object} data JSON-format serialized keyframe.
 * @return {!sm.Keyframe} A new keyframe initialized with the given data.
 */
sm.Keyframe.deserialize = function(data) {
  var time = /** @type {number} */ (data['t']);
  var keyframe = new sm.Keyframe(time);

  var dataAttributes = /** @type {!Array.<!Object>} */ (data['a']);
  goog.array.forEach(dataAttributes,
      /**
       * @param {!Object} dataAttribute Attribute JSON.
       */
      function (dataAttribute) {
        var attribute = sm.KeyframeAttribute.deserialize(dataAttribute);
        keyframe.addAttribute(attribute);
      });

  return keyframe;
};


/**
 * Serializes the keyframe to a compact and round-trippable JSON object.
 * @return {!Object} A JSON-format serialization of the entire keyframe.
 */
sm.Keyframe.prototype.serialize = function() {
  var data = {
    't': this.time_,
    'a': new Array(this.attributes_.length)
  };

  var dataAttributes = data['a'];
  goog.array.forEach(this.attributes_,
      /**
       * @param {!sm.KeyframeAttribute} attribute Source keyframe attribute.
       * @param {number} n Index.
       */
      function(attribute, n) {
        dataAttributes[n] = attribute.serialize();
      });

  return data;
};

