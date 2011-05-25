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

goog.provide('sm.TimingFunction');



/**
 * A built-in or user-defined timing function.
 * More: http://matthewlein.com/ceaser/
 *
 * @constructor
 * @param {string|Array.<number>} value The named timing function or 4 number
 *     values specifying the P1 and P2 points on the curve as
 *     [x1, y1, x2, y2] in the range [0-1].
 */
sm.TimingFunction = function(value) {
  /**
   * Value of the timing function.
   * @type {string|Array.<number>}
   */
  this.value = value;
};


/**
 * cubic-bezier(0.25, 0.1, 0.25, 1.0)
 * @const
 */
sm.TimingFunction.EASE = new sm.TimingFunction('ease');


/**
 * cubic-bezier(0.0, 0.0, 1.0, 1.0)
 * @const
 */
sm.TimingFunction.LINEAR = new sm.TimingFunction('linear');


/**
 * cubic-bezier(0.42, 0.0, 1.0, 1.0)
 * @const
 */
sm.TimingFunction.EASE_IN = new sm.TimingFunction('ease-in');


/**
 * cubic-bezier(0.0, 0.0, 0.58, 1.0)
 * @const
 */
sm.TimingFunction.EASE_OUT = new sm.TimingFunction('ease-out');


/**
 * cubic-bezier(0.42, 0.0, 0.58, 1.0)
 * @const
 */
sm.TimingFunction.EASE_IN_OUT = new sm.TimingFunction('ease-in-out');


/**
 * Generate a custom cubic-bezier evaluator.
 * @param {number} p1x Control point 1 X.
 * @param {number} p1y Control point 1 Y.
 * @param {number} p2x Control point 2 X.
 * @param {number} p2y Control point 2 Y.
 * @return {function(number, number=): number} Timing function evaluator.
 */
sm.TimingFunction.generateCubicBezier = function(p1x, p1y, p2x, p2y) {
  // From WebKit's UnitBezier.h
  // http://opensource.apple.com/source/WebCore/WebCore-955.66/platform/graphics/UnitBezier.h

  var cx = 3 * p1x;
  var bx = 3 * (p2x - p1x) - cx;
  var ax = 1 - cx - bx;
  var cy = 3 * p1y;
  var by = 3 * (p2y - p1y) - cy;
  var ay = 1 - cy - by;

  function solveCurveX(x, epsilon) {
    var t0, t1, t2, x2, d2;
    // Newton's method
    for (var i = 0, t2 = x; i < 8; i++) {
      x2 = (((ax * t2 + bx) * t2 + cx) * t2) - x; // sampleCurveX(t2) - x
      if (Math.abs(x2) < epsilon) {
        return t2;
      }
      d2 = (3 * ax * t2 + 2 * bx) * t2 + cx; // sampleCurveDerivativeX(t2)
      if (Math.abs(d2) < 1e-6) {
        break;
      }
      t2 = t2 - x2 / d2;
    }
    // Fallback
    t0 = 0;
    t1 = 1;
    t2 = x;
    if (t2 < t0) {
      return t0;
    } else if (t2 > t1) {
      return t1;
    }
    while(t0 < t1) {
      x2 = (((ax * t2 + bx) * t2 + cx) * t2); // sampleCurveX(t2)
      if (Math.abs(x2 - x) < epsilon) {
        return t2;
      }
      if (x > x2) {
        t0 = t2;
      } else {
        t1 = t2;
      }
      t2 = (t1 - t0) * 0.5 + t0;
    }
    // Failed
    return t2;
  };

  // sampleCurveY
  return function(x, epsilon) {
    var t = solveCurveX(x, epsilon);
    return ((ay * t + by) * t + cy) * t;
  };
};


/**
 * A cache of evaluator functions.
 * @private
 * @type {Object.<string, function(number, number=): number>}
 */
sm.TimingFunction.evaluators_ = {};


/**
 * Get a cached timing function evaluator function.
 * @param {sm.TimingFunction} timingFunction The timing function to query for.
 * @return {function(number, number): number} An evaluator function for the
 *     given timing function.
 */
sm.TimingFunction.getEvaluator = function(timingFunction) {
  var key = timingFunction.value;
  if (goog.isArray(key)) {
    key = key.join(',');
  }
  var value = sm.TimingFunction.evaluators_[key];
  if (!value) {
    value = sm.TimingFunction.evaluators_[key] =
        sm.TimingFunction.generateCubicBezier(
            timingFunction.value[0], timingFunction.value[1],
            timingFunction.value[2], timingFunction.value[3]);
  }
  return value;
};


/**
 * cubic-bezier(0.25, 0.1, 0.25, 1.0)
 * @param {number} a [0-1] Input alpha.
 * @param {number=} opt_epsilon Maximum error value.
 * @return {number} Modified alpha.
 */
sm.TimingFunction.evaluators_['ease'] =
    sm.TimingFunction.generateCubicBezier(0.25, 0.1, 0.25, 1.0);


/**
 * cubic-bezier(0.0, 0.0, 1.0, 1.0)
 * @param {number} a [0-1] Input alpha.
 * @param {number=} opt_epsilon Maximum error value.
 * @return {number} Modified alpha.
 */
sm.TimingFunction.evaluators_['linear'] = function(a, opt_epsilon) {
  return a;
};


/**
 * cubic-bezier(0.42, 0.0, 1.0, 1.0)
 * @param {number} a [0-1] Input alpha.
 * @param {number=} opt_epsilon Maximum error value.
 * @return {number} Modified alpha.
 */
sm.TimingFunction.evaluators_['ease-in'] = function(a, opt_epsilon) {
  return a * a * a;
};


/**
 * cubic-bezier(0.0, 0.0, 0.58, 1.0)
 * @param {number} a [0-1] Input alpha.
 * @param {number=} opt_epsilon Maximum error value.
 * @return {number} Modified alpha.
 */
sm.TimingFunction.evaluators_['ease-out'] = function(a, opt_epsilon) {
  a--;
  return a * a * a + 1;
};


/**
 * cubic-bezier(0.42, 0.0, 0.58, 1.0)
 * @param {number} a [0-1] Input alpha.
 * @param {number=} opt_epsilon Maximum error value.
 * @return {number} Modified alpha.
 */
sm.TimingFunction.evaluators_['ease-in-out'] = function(a, opt_epsilon) {
  a *= 2;
  if (a < 1) {
    return 0.5 * a * a * a;
  } else {
    a -= 2;
    return 0.5 * a * a * a + 2;
  }
};
