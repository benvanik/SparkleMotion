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

goog.provide('sm.runtime.Tween');

goog.require('goog.asserts');
goog.require('goog.string');



/**
 * A generic property tween.
 *
 * @constructor
 * @param {!Object} target Target object.
 * @param {string} key Property key on the target object.
 * @param {?function(Object, *): void} setter Property value setter.
 * @param {number} startTime Timeline-relative time to start tweening.
 * @param {number} duration Duration of the tween, in ms.
 * @param {function(number): number} timingFunction Timing function.
 */
sm.runtime.Tween = function(target, key, setter, startTime, duration,
    timingFunction) {
  /**
   * Target object.
   * @type {!Object}
   */
  this.target = target;

  /**
   * Property key on the target object.
   * @type {string}
   */
  this.key = key;

  /**
   * Property value setter.
   * @type {?function(Object, *): void}
   */
  this.setter = setter;

  /**
   * Timeline-relative time to start tweening.
   * @type {number}
   */
  this.startTime = startTime;

  /**
   * Duration of the tween, in ms.
   * @type {number}
   */
  this.duration = duration;

  /**
   * Tolerated error threshold.
   * @type {number}
   */
  this.epsilon = 1 / (200 * this.duration / 1000);

  /**
   * Timing function used to evaluate the tween values.
   * @type {function(number, number): number}
   */
  this.timingFunction = timingFunction;
};


/**
 * Updates the tween value.
 * @param {number} time Current timeline-relative time, in ms.
 * @return {boolean} True if still updating.
 */
sm.runtime.Tween.prototype.tick = goog.abstractMethod;


/**
 * Gets the unit from a value-unit (e.g. '10px' -> 'px', 10 -> null).
 * @param {string} value A value-unit to get the unit from.
 * @return {?string} The unit or null if none specified.
 */
sm.runtime.Tween.getUnit = function(value) {
  if (!goog.isString(value)) {
    return null;
  }
  // Scan backwards looking for non-alpha characters
  for (var n = value.length - 1; n >= 0; n--) {
    var c = value.charCodeAt(n);
    if ((c >= 48 && c <= 57) || c == 46 || c == 101 || c == 69 || c == 45) {
      // Number-valid value
      return value.substr(n + 1);
    }
  }
  return null;
};


// TODO: ColorTween
// TODO: TransformTween
// TODO: StateTween (display/etc?)
