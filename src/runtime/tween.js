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

goog.provide('sm.runtime.NumericTween');
goog.provide('sm.runtime.Tween');

goog.require('goog.asserts');



/**
 * A generic property tween.
 *
 * @constructor
 * @param {Object} target Target object.
 * @param {string} key Property key on the target object.
 * @param {number} startTime Timeline-relative time to start tweening.
 * @param {number} duration Duration of the tween, in ms.
 * @param {function(number): number} timingFunction Timing function.
 */
sm.runtime.Tween = function(target, key, startTime, duration,
    timingFunction) {
  /** @type {Object} */
  this.target = target;
  /** @type {string} */
  this.key = key;
  /** @type {number} */
  this.startTime = startTime;
  /** @type {number} */
  this.duration = duration;
  /** @type {number} */
  this.epsilon = 1 / (200 * this.duration / 1000);
  /**
   * @type {function(number, number): number} timingFunction Timing function.
   */
  this.timingFunction = timingFunction;
};


/**
 * Update the tween value.
 * @param {number} time Current timeline-relative time, in ms.
 * @return {boolean} True if still updating.
 */
sm.runtime.Tween.prototype.tick = goog.abstractMethod;



/**
 * A numerical property (with unit) tween specialization.
 *
 * @extends {sm.runtime.Tween}
 * @constructor
 * @param {Object} target Target object.
 * @param {string} key Property key on the target object.
 * @param {number} startTime Timeline-relative time to start tweening, in ms.
 * @param {number} duration Duration of the tween, in ms.
 * @param {function(number): number} timingFunction Timing function.
 * @param {string|number} from The starting value.
 * @param {string|number} to The target value.
 */
sm.runtime.NumericTween = function(target, key, startTime, duration,
    timingFunction, from, to) {
  goog.base(this, target, key, startTime, duration, timingFunction);

  /** @type {?string} */
  this.unit = null;
  /** @type {number} */
  this.from;
  /** @type {number} */
  this.to;

  if (goog.isString(from)) {
    for (var n = 0; n < from.length; n++) {
      var c = from.charCodeAt(n);
      if (!(c >= 48 && c <= 57) && c != 46 && c != 101 && c != 69 && c != 45) {
        this.unit = from.substr(n);
        from = from.substr(0, n);
        to = to.substr(0, to.length - this.unit.length);
        break;
      }
    }
    this.from = parseFloat(from);
    this.to = parseFloat(to);
  } else {
    this.from = from;
    goog.asserts.assert(goog.isNumber(to));
    this.to = /** @type {number} */(to);
  }
};
goog.inherits(sm.runtime.NumericTween, sm.runtime.Tween);


/**
 * @override
 */
sm.runtime.NumericTween.prototype.tick = function(time) {
  if (!this.duration) {
    this.target[this.key] = this.unit ? (this.to + this.unit) : this.to;
    return false;
  }

  // [0-1]
  var ta = (time - this.startTime) / this.duration;
  ta = ta > 1 ? 1 : ta;
  var fa = this.timingFunction(ta, this.epsilon);
  var v = this.from + fa *(this.to - this.from);
  if (this.unit) {
    v = v + this.unit;
  }
  this.target[this.key] = v;
  return (fa < 1.0);
};
