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

goog.provide('sm.runtime.UserAgent');

goog.require('goog.userAgent');



/**
 * User-Agent utility type, providing browser-specific implementations of
 * various required functionality (such ass CSS Animations/Transforms/etc).
 *
 * @constructor
 */
sm.runtime.UserAgent = function() {
  /**
   * Whether the current user agent has CSS Transitions.
   * @type {boolean}
   */
  this.hasTransitions = this.setupTransitions_();
  /**
   * Whether the current user agent has CSS Animations.
   * @type {boolean}
   */
  this.hasAnimations = this.setupAnimations_();
  /**
   * Whether the current user agent has CSS Transforms.
   * @type {boolean}
   */
  this.hasTransforms = this.setupTransforms_();

  /**
   * Whether the user agent needs IE downlevel opacity (pre-IE9).
   * @type {boolean}
   */
  this.ieDownlevelOpacity = goog.userAgent.IE && !goog.userAgent.isVersion(9);

  /**
   * Request animation frame, only if supported (no emulation).
   * @type {function(Function, HTMLElement=): void}
   */
  this.requestAnimationFrame =
      window['webkitRequestAnimationFrame'] ||
      window['mozRequestAnimationFrame'] ||
      window['oRequestAnimationFrame'] ||
      window['msRequestAnimationFrame'] ||
      window['requestAnimationFrame'];
};


/**
 * Common browser CSS prefixes.
 * @private
 */
sm.runtime.UserAgent.prefixes_ = ['Webkit', 'Moz', 'O', 'ms'];


/**
 * Attempt to determine the browser prefix for the given feature set.
 * @private
 * @param {string} name A CSS name to test against.
 * @return {?string} Browser prefix/empty string or null if none found.
 */
sm.runtime.UserAgent.prototype.guessPrefix_ = function(name) {
  var bodyStyle = document.body.style;
  var prefixes = sm.runtime.UserAgent.prefixes_;
  for (var n = 0; n < prefixes.length; n++) {
    var guessName = this.addPrefix_(prefixes[n], name);
    if (goog.isDef(bodyStyle[guessName])) {
      return prefixes[n];
    }
  }
  return null;
};


/**
 * Add the given user agent prefix to the given CSS name.
 * @param {string} prefix User agent prefix.
 * @param {string} name Base CSS name.
 * @return {string} CSS name with browser prefix added.
 */
sm.runtime.UserAgent.prototype.addPrefix_ = function(prefix, name) {
  if (prefix.length) {
    return prefix + name.substr(0, 1).toUpperCase() + name.substr(1);
  }
  return name;
};


/**
 * Setup CSS Transitions.
 * @private
 * @return {boolean} Whether or not the feature is supported.
 */
sm.runtime.UserAgent.prototype.setupTransitions_ = function() {
  var prefix = this.guessPrefix_('transition');
  if (!prefix) {
    return false;
  }

  /** @type {string} */
  this.transition =
    this.addPrefix_(prefix, 'transition');

  /** @type {string} */
  this.transitionend;
  switch (prefix) {
    default:
    case '':
    case 'Moz':
      this.transitionend = 'transitionend';
      break;
    case 'Webkit':
      this.transitionend = 'webkitTransitionEnd';
      break;
    case 'O':
      this.transitionend = 'OTransitionEnd';
      break;
    case 'ms':
      this.transitionend = 'msTransitionEnd';
      break;
  }

  return true;
};


/**
 * Setup CSS Animations.
 * @private
 * @return {boolean} Whether or not the feature is supported.
 */
sm.runtime.UserAgent.prototype.setupAnimations_ = function() {
  var prefix = this.guessPrefix_('animationName');
  if (!prefix) {
    return false;
  }

  /** @type {string} */
  this.animationName =
      this.addPrefix_(prefix, 'animationName');
  /** @type {string} */
  this.animationDelay =
      this.addPrefix_(prefix, 'animationDelay');
  /** @type {string} */
  this.animationDuration =
      this.addPrefix_(prefix, 'animationDuration');
  /** @type {string} */
  this.animationTimingFunction =
      this.addPrefix_(prefix, 'animationTimingFunction');
  /** @type {string} */
  this.animationFillMode =
      this.addPrefix_(prefix, 'animationFillMode');

  /** @type {string} */
  this.animationstart;
  /** @type {string} */
  this.animationend;
  /** @type {string} */
  this.animationiteration;
  switch (prefix) {
    default:
    case '':
    case 'Moz':
      this.animationstart = 'animationstart';
      this.animationend = 'animationend';
      this.animationiteration = 'animationiteration';
      break;
    case 'Webkit':
      this.animationstart = 'webkitAnimationStart';
      this.animationend = 'webkitAnimationEnd';
      this.animationiteration = 'webkitAnimationIteration';
      break;
    case 'O':
      this.animationstart = 'OAnimationStart';
      this.animationend = 'OAnimationEnd';
      this.animationiteration = 'OAnimationIteration';
      break;
    case 'ms':
      this.animationstart = 'msAnimationStart';
      this.animationend = 'msAnimationEnd';
      this.animationiteration = 'msAnimationIteration';
      break;
  }

  /** @type {string} */
  this.atkeyframes;
  if (prefix.length) {
    this.atkeyframes = '@-' + prefix.toLowerCase() + '-keyframes';
  } else {
    this.atkeyframes = '@keyframes';
  }

  return true;
};


/**
 * Setup CSS Transforms.
 * @private
 * @return {boolean} Whether or not the feature is supported.
 */
sm.runtime.UserAgent.prototype.setupTransforms_ = function() {
  var prefix = this.guessPrefix_('transform');
  if (!prefix) {
    return false;
  }

  /** @type {string} */
  this.transform = this.addPrefix_(prefix, 'transform');

  return true;
};


/**
 * Set the transition properties on the given style.
 * @param {CSSStyleDeclaration} style CSS style declaration.
 */
sm.runtime.UserAgent.prototype.setTransition = function(style) {
  style[this.transition] = goog.isDef(opt_value) ? opt_value : '';
};


/**
 * Set the animation properties on the given style.
 * @param {CSSStyleDeclaration} style CSS style declaration.
 * @param {string=} opt_name Animation name.
 * @param {number=} opt_delay Animation delay, in units time.
 * @param {number=} opt_duration Animation duration, in units time.
 * @param {string=} opt_timingFunction Timing function, in string form.
 * @param {string=} opt_fillMode Animation fill mode.
 */
sm.runtime.UserAgent.prototype.setAnimation = function(style, opt_name,
    opt_delay, opt_duration, opt_timingFunction, opt_fillMode) {
  style[this.animationName] =
      goog.isDef(opt_name) ? opt_name : '';
  style[this.animationDelay] =
      goog.isDef(opt_delay) ? opt_delay : '';
  style[this.animationDuration] =
      goog.isDef(opt_duration) ? opt_duration : '';
  style[this.animationTimingFunction] =
      goog.isDef(opt_timingFunction) ? opt_timingFunction : '';
  style[this.animationFillMode] =
      goog.isDef(opt_fillMode) ? opt_fillMode : '';
};


/**
 * Set the transform property on the given style.
 * @param {HTMLElement} el Target HTML element.
 * @param {CSSStyleDeclaration} style CSS style declaration.
 * @param {string=} opt_value Transform value string or undefined to reset.
 */
sm.runtime.UserAgent.prototype.setTransform = function(el, style, opt_value) {
  style[this.transform] = goog.isDef(opt_value) ? opt_value : '';
};


/**
 * Set the opacity property on the given style.
 * @param {CSSStyleDeclaration} style CSS style declaration.
 * @param {number=} opt_value New opacity value or undefined to reset.
 */
sm.runtime.UserAgent.prototype.setOpacity;
if (goog.userAgent.IE && !goog.userAgent.isVersion(9)) {
  sm.runtime.UserAgent.prototype.setOpacity = function(style, opt_value) {
    // Opacity only applies to positioned elements or elements with zoom: 1
    // Filters must be in this order:
    // -ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=50)"
    // filter: alpha(opacity=50)
    // via http://www.quirksmode.org/css/opacity.html
    if (goog.isDef(opt_value)) {
      var pct = opt_value * 100;
      style['zoom'] = 1;
      style['-ms-filter'] =
          'progid:DXImageTransform.Microsoft.Alpha(Opacity=' + pct + ')';
      style['filter'] =
          'alpha(opacity=' + pct + ')';
    } else {
      style['-ms-filter'] = '';
      style['filter'] = '';
    }
  };
} else {
  sm.runtime.UserAgent.prototype.setOpacity = function(style, opt_value) {
    if (goog.isDef(opt_value)) {
      style['opacity'] = opt_value;
    } else {
      style['opacity'] = '';
    }
  };
};

