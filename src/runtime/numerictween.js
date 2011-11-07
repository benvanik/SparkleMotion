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

goog.require('sm.runtime.Tween');



/**
 * A numerical property (with unit) tween specialization.
 *
 * @extends {sm.runtime.Tween}
 * @constructor
 * @param {!Object} target Target object.
 * @param {string} key Property key on the target object.
 * @param {?function(Object, *): void} setter Property value setter.
 * @param {number} startTime Timeline-relative time to start tweening, in ms.
 * @param {number} duration Duration of the tween, in ms.
 * @param {function(number): number} timingFunction Timing function.
 * @param {number|undefined} from The starting value.
 * @param {number|undefined} to The target value.
 * @param {?string} unit The unit of the values.
 */
sm.runtime.NumericTween = function(target, key, setter, startTime, duration,
    timingFunction, from, to, unit) {
  goog.base(this, target, key, setter, startTime, duration, timingFunction);

  /**
   * The starting value, if defined.
   * @type {number|undefined}
   */
  this.from = from;

  /**
   * The target value, if defined.
   * @type {number|undefined}
   */
  this.to = to;

  /**
   * The unit of the values.
   * @type {?string}
   */
  this.unit = unit;
};
goog.inherits(sm.runtime.NumericTween, sm.runtime.Tween);


/**
 * @override
 */
sm.runtime.NumericTween.prototype.tick = function(time) {
  if (!this.duration) {
    var targetValue = this.unit ? (this.to + this.unit) : this.to;
    if (this.setter) {
      this.setter(this.target, targetValue);
    } else {
      this.target[this.key] = targetValue;
    }
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

  if (this.setter) {
    this.setter(this.target, v);
  } else {
    this.target[this.key] = v;
  }
  return (fa < 1.0);
};
