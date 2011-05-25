// Copyright 2011 Ben Vanik. All Rights Reserved.

goog.provide('sm.TimingFunction');



/**
 * A built-in or user-defined timing function.
 *
 * @constructor
 * @param {string|Array.<number>} value The named timing function or 4 number
 *     number values specifying the P1 and P2 points on the curve as
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
