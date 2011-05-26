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

goog.provide('sm.runtime.Timer');

goog.require('sm.runtime.UserAgent');



/**
 * A generic update timer.
 * The timer will use setInterval unless the browser supports 
 * requestAnimationFrame.
 *
 * @constructor
 * @param {sm.runtime.UserAgent} userAgent User-Agent utility.
 * @param {number} tickHz Desired ticks/second.
 */
sm.runtime.Timer = function(userAgent, tickHz) {
  /**
   * @private
   * @type {sm.runtime.UserAgent}
   */
  this.userAgent_ = userAgent;

  /**
   * @private
   * @type {number}
   */
  this.tickHz_ = tickHz;

  /**
   * @private
   * @type {boolean}
   */
  this.running_ = false;

  /**
   * @private
   * @type {?number}
   */
  this.intervalId_ = null;

  /**
   * @private
   * @type {Array.<function(number): boolean>}
   */
  this.callbacks_ = [];

  /**
   * @private
   * @type {function(number=): void}
   */
  this.boundTick_ = goog.bind(this.tick_, this);
};


/**
 * Add an update callback and potentially start the timer.
 * The callback should return true if it needs to be called back again.
 *
 * @param {function(number): boolean} callback Function to be called each tick.
 * @param {Object=} opt_this This scope for the callback.
 */
sm.runtime.Timer.prototype.addCallback = function(callback, opt_this) {
  if (goog.isDef(opt_this)) {
    callback = goog.bind(callback, opt_this);
  }
  this.callbacks_.push(callback);
}


/**
 * Start timer, if required.
 */
sm.runtime.Timer.prototype.start = function() {
  if (this.running_) {
    return;
  }
  if (this.userAgent_.requestAnimationFrame) {
    this.userAgent_.requestAnimationFrame.call(window, this.boundTick_);
  } else {
    this.intervalId_ = window.setInterval(this.boundTick_, 1000 / this.tickHz_);
  }
};


/**
 * Stop timer, if required.
 */
sm.runtime.Timer.prototype.stop = function() {
  if (!this.running_) {
    return;
  }
  if (this.intervalId_) {
    window.clearInterval(this.intervalId_);
    this.intervalId_ = null;
  } else {
    // No-op clear requestAnimationFrame
  }
  this.running_ = false;
};


/**
 * Tick handler to dispatch all callbacks.
 * @private
 * @param {number=} opt_time Current time, if the underlying timer gives it.
 */
sm.runtime.Timer.prototype.tick_ = function(opt_time) {
  // Ignore if not running
  if (!this.running_) {
    return;
  }

  // Issue callbacks
  var anyUpdating = false;
  var time = goog.isDef(opt_time) ? opt_time : goog.now();
  for (var n = 0; n < this.callbacks_.length; n++) {
    anyUpdating = this.callbacks_[n](time) || anyUpdating;
  }

  // Check state
  if (anyUpdating) {
    // Keep running
    if (this.userAgent_.requestAnimationFrame) {
      this.userAgent_.requestAnimationFrame.call(window, this.boundTick_);
    }
  } else {
    // Stop
    this.stop();
  }
};
