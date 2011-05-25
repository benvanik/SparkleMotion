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
   * @type {string|number=}
   */
  this.value_ = opt_value;

  /**
   * Timing function used for the attribute animation.
   * @private
   * @type {sm.TimingFunction}
   */
  this.timingFunction_ = goog.isDef(opt_timingFunction) ? opt_timingFunction :
      sm.TimingFunction.EASE;

  /**
   * Whether the attribute is dirty and needs re-rendering.
   * @private
   * @type {boolean}
   */
  this.dirty_ = false;
};


/**
 * Get the target attribute name.
 * @return {string} The target attribute name.
 */
sm.KeyframeAttribute.prototype.getName = function() {
  return this.name_;
}


/**
 * Set the target attribute name.
 * @param {string} name The target attribute name.
 * @return {sm.KeyframeAttribute} The attribute, for chaining.
 */
sm.KeyframeAttribute.prototype.setName = function(name) {
  this.name_ = name;
  this.dirty_ = true;
  return this;
};


/**
 * Get the target attribute value.
 * @return {string|number=} The target attribute value.
 */
sm.KeyframeAttribute.prototype.getValue = function() {
  return this.value_;
}


/**
 * Set the target attribute value.
 * @param {string|number=} value The target attribute value.
 * @return {sm.KeyframeAttribute} The attribute, for chaining.
 */
sm.KeyframeAttribute.prototype.setValue = function(value) {
  this.value_ = value;
  this.dirty_ = true;
  return this;
};


/**
 * Get the timing function used to evaluate the keyframe.
 * @return {sm.TimingFunction} The timing function.
 */
sm.KeyframeAttribute.prototype.getTimingFunction = function() {
  return this.timingFunction_;
}


/**
 * Set the timing function used to evaluate the keyframe.
 * @param {sm.TimingFunction} timingFunction The timing function.
 * @return {sm.KeyframeAttribute} The attribute, for chaining.
 */
sm.KeyframeAttribute.prototype.setTimingFunction = function(timingFunction) {
  this.timingFunction_ = timingFunction;
  this.dirty_ = true;
  return this;
};


/**
 * Deserialize an attribute from a previously-serialized JSON object.
 * @param {Object} data JSON-format serialized attribute.
 * @return {sm.Animation} A new attribute initialized with the given data.
 */
sm.KeyframeAttribute.deserialize = function(data) {
  var attribute = new sm.KeyframeAttribute(data.name, data.value,
      new sm.TimingFunction(data.timingFunction));
  return attribute;
};


/**
 * Serialize the attribute to a compact and round-trippable JSON object.
 * @return {Object} A JSON-format serialization of the entire attribute.
 */
sm.KeyframeAttribute.prototype.serialize = function() {
  var data = {
    name: this.name_,
    value: this.value_,
    timingFunction: this.timingFunction_.value
  };
  return data;
};

