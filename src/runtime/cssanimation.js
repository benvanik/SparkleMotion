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

goog.provide('sm.runtime.CssAnimation');

goog.require('goog.asserts');
goog.require('goog.object');



/**
 * CSS Animations individual animation state.
 *
 * @constructor
 * @param {!sm.runtime.UserAgent} userAgent User-agent utility.
 * @param {!HTMLElement} element Target element.
 * @param {number} delay Delay, in seconds, from timeline start.
 * @param {number} duration Duration, in seconds, of entire timeline.
 * @param {string} timingFunction CSS timing function.
 */
sm.runtime.CssAnimation = function(
    userAgent, element, delay, duration, timingFunction) {
  goog.asserts.assert(element.style);

  /**
   * Shared user agent utility.
   * @private
   * @type {!sm.runtime.UserAgent}
   */
  this.userAgent_ = userAgent;

  /**
   * @type {!HTMLElement}
   */
  this.element = element;

  /**
   * @type {!CSSStyleDeclaration}
   */
  this.style = element.style;

  /**
   * @type {string}
   */
  this.name = '';

  /**
   * @type {number}
   */
  this.delay = delay;

  /**
   * @type {number}
   */
  this.duration = duration;

  /**
   * @type {string}
   */
  this.timingFunction = timingFunction;

  /**
   * @type {!Object.<!Array.<{name: string, value}>>}
   */
  this.keyframeAttributes = {};

  /**
   * @type {!Object.<*>}
   */
  this.finalAttributes = {};

  /**
   * @type {string}
   */
  this.cssFragment = '';
};


/**
 * Adds an attribute keyframe.
 * @param {number} percent Percent through the timeline this keyframe occurs.
 * @param {string} name Attribute name.
 * @param {string|number} value Attribute value at the keyframe.
 */
sm.runtime.CssAnimation.prototype.addAttributeKeyframe = function(percent,
    name, value) {
  var attributes = this.keyframeAttributes[percent.toString()];
  if (!attributes) {
    attributes = this.keyframeAttributes[percent.toString()] = [];
  }
  attributes.push({
    name: name,
    value: value
  });
};


/**
 * Perform all final operations on the complete animation.
 */
sm.runtime.CssAnimation.prototype.finalize = function() {
  // Compute final values of each attribute
  var allKeys = goog.object.getKeys(this.keyframeAttributes);
  allKeys.sort(function(a, b) {
    return parseFloat(a) - parseFloat(b);
  });
  for (var n = 0; n < allKeys.length; n++) {
    var keyframe = this.keyframeAttributes[allKeys[n]];
    for (var m = 0; m < keyframe.length; m++) {
      this.finalAttributes[keyframe[m].name] = keyframe[m].value;
    }
  }

  // Generate CSS
  var s = '';
  goog.object.forEach(this.keyframeAttributes, function(attributes, key) {
    s += '  ' + key + '% {\n';
    for (var n = 0; n < attributes.length; n++) {
      s += '    ' + attributes[n].name + ': ' + attributes[n].value + ';\n';
    }
    s += '  }\n';
  });
  this.cssFragment = s;
};


/**
 * Clears the style for this specific animation.
 * @param {boolean} end Go to the end of the animation.
 */
sm.runtime.CssAnimation.prototype.clearStyle = function(end) {
  var finalAttributes = this.finalAttributes;
  if (!end) {
    finalAttributes = window.getComputedStyle(this.element, null);
  }
  goog.object.forEach(this.keyframeAttributes, function(attributes, key) {
    for (var n = 0; n < attributes.length; n++) {
      var name = attributes[n].name;
      this.style[name] = finalAttributes[name];
    }
  }, this);

  // TODO: remove just self
  var agent = this.userAgent_;
  this.style[agent.animationName] = '';
  this.style[agent.animationDelay] = '';
  this.style[agent.animationDuration] = '';
  this.style[agent.animationTimingFunction] = '';
  //this.style[agent.animationFillMode] = '';
};


/**
 * Sets the style to kickoff the animation.
 */
sm.runtime.CssAnimation.prototype.setStyle = function() {
  // Set final state
  goog.object.forEach(this.finalAttributes, function(value, key) {
    this.style[key] = value;
  }, this);

  // TODO: append
  var agent = this.userAgent_;
  this.style[agent.animationName] = this.name;
  this.style[agent.animationDelay] = this.delay + 's';
  this.style[agent.animationDuration] = this.duration + 's';
  this.style[agent.animationTimingFunction] = this.timingFunction;
  //this.style[agent.animationFillMode] = 'both';
};
