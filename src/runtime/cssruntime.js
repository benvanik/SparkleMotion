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

goog.provide('sm.runtime.CssRuntime');

goog.require('sm.Scope');
goog.require('sm.Timeline');
goog.require('sm.runtime.Runtime');



/**
 * An animation runtime using CSS Animations.
 *
 * @constructor
 * @extends {sm.runtime.Runtime}
 */
sm.runtime.CssRuntime = function() {
  goog.base(this);
}
goog.inherits(sm.runtime.CssRuntime, sm.runtime.Runtime);


/**
 * Detect if the CSS runtime is supported in the current browser.
 * @return {boolean} True if the CSS runtime is supported on this browser.
 */
sm.runtime.CssRuntime.detect = function() {
  // TODO: detect if CSS Animations are supported
  return false;
};


/**
 * @override
 */
sm.runtime.CssRuntime.prototype.prepare =  function(timeline, scope) {
  console.log('prepare');
  return {};
};


/**
 * @override
 */
sm.runtime.CssRuntime.prototype.play = function(state, opt_callback) {
  console.log('play');
};


/**
 * @override
 */
sm.runtime.CssRuntime.prototype.stop = function(state) {
  console.log('stop');
};
