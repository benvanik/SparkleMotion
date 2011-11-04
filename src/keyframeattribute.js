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

goog.provide('sm.KeyframeAttribute');

goog.require('sm.TimingFunction');



/**
 * Per-keyframe attribute data.
 *
 * @constructor
 * @param {string} name Target attribute name.
 * @param {string|number=} opt_value Target attribute value.
 * @param {sm.TimingFunction=} opt_timingFunction Timing function used to
 *     evaluate the keyframe.
 */
sm.KeyframeAttribute = function(name, opt_value, opt_timingFunction) {
  /**
   * Target attribute name.
   * @private
   * @type {string}
   */
  this.name_ = name;

  /**
   * Value of the attribute at the keyframe.
   * @private
   * @type {string|number|undefined}
   */
  this.value_ = opt_value;

  /**
   * Timing function used for the attribute animation.
   * @private
   * @type {!sm.TimingFunction}
   */
  this.timingFunction_ = opt_timingFunction || sm.TimingFunction.EASE;

  /**
   * Whether the attribute is dirty and needs re-rendering.
   * @private
   * @type {boolean}
   */
  this.dirty_ = false;
};


/**
 * Gets the target attribute name.
 * @return {string} The target attribute name.
 */
sm.KeyframeAttribute.prototype.getName = function() {
  return this.name_;
}


/**
 * Sets the target attribute name.
 * @param {string} name The target attribute name.
 * @return {!sm.KeyframeAttribute} The attribute, for chaining.
 */
sm.KeyframeAttribute.prototype.setName = function(name) {
  this.name_ = name;
  this.dirty_ = true;
  return this;
};


/**
 * Gets the target attribute value.
 * @return {!string|number|undefined} The target attribute value.
 */
sm.KeyframeAttribute.prototype.getValue = function() {
  return this.value_;
}


/**
 * Sets the target attribute value.
 * @param {string|number|undefined} value The target attribute value.
 * @return {!sm.KeyframeAttribute} The attribute, for chaining.
 */
sm.KeyframeAttribute.prototype.setValue = function(value) {
  this.value_ = value;
  this.dirty_ = true;
  return this;
};


/**
 * Gets the timing function used to evaluate the keyframe.
 * @return {!sm.TimingFunction} The timing function.
 */
sm.KeyframeAttribute.prototype.getTimingFunction = function() {
  return this.timingFunction_;
}


/**
 * Sets the timing function used to evaluate the keyframe.
 * @param {!sm.TimingFunction} timingFunction The timing function.
 * @return {!sm.KeyframeAttribute} The attribute, for chaining.
 */
sm.KeyframeAttribute.prototype.setTimingFunction = function(timingFunction) {
  this.timingFunction_ = timingFunction;
  this.dirty_ = true;
  return this;
};


/**
 * Deserializes an attribute from a previously-serialized JSON object.
 * @param {!Object} data JSON-format serialized attribute.
 * @return {!sm.KeyframeAttribute} A new attribute initialized with the given
 *     data.
 */
sm.KeyframeAttribute.deserialize = function(data) {
  var name = /** @type {string} */ (data['name']);
  var value = /** @type {string|number|undefined} */ (data['value']);
  var timingFunction = new sm.TimingFunction(
      /** @type {string|!Array.<number>} */ (data['timingFunction']));
  var attribute = new sm.KeyframeAttribute(name, value, timingFunction);
  return attribute;
};


/**
 * Serializes the attribute to a compact and round-trippable JSON object.
 * @return {!Object} A JSON-format serialization of the entire attribute.
 */
sm.KeyframeAttribute.prototype.serialize = function() {
  var data = {
    'name': this.name_,
    'value': this.value_,
    'timingFunction': this.timingFunction_.value
  };
  return data;
};
