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

goog.require('goog.array');
goog.require('goog.cssom');
goog.require('goog.object');
goog.require('sm.Scope');
goog.require('sm.Timeline');
goog.require('sm.TimingFunction');
goog.require('sm.runtime.Runtime');



/**
 * CSS Animations individual animation state.
 * @private
 * @constructor
 * @param {HTMLElement} el Target element.
 * @param {CSSStyleDeclaration} style Target element style.
 * @param {number} delay Delay, in seconds, from timeline start.
 * @param {number} duration Duration, in seconds, of entire timeline.
 * @param {string} timingFunction CSS timing function.
 */
sm.runtime.CssAnimation_ = function(el, style, delay, duration,
    timingFunction) {
  /** @type {HTMLElement} */
  this.el = el;
  /** @type {CSSStyleDeclaration} */
  this.style = style;
  /** @type {string} */
  this.name = '';
  /** @type {number} */
  this.delay = delay;
  /** @type {number} */
  this.duration = duration;
  /** @type {string} */
  this.timingFunction = timingFunction;

  /**
   * @type {Object.<string, Array.<{name: string, value}>>}
   */
  this.keyframeAttributes = {};
};


/**
 * Add an attribute keyframe.
 * @param {number} percent Percent through the timeline this keyframe occurs.
 * @param {string} name Attribute name.
 * @param {string|number} value Attribute value at the keyframe.
 */
sm.runtime.CssAnimation_.prototype.addAttributeKeyframe = function(percent,
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
 * Generate the CSS to represent the keyframes.
 * @return {string} A CSS blob with keyframe data.
 */
sm.runtime.CssAnimation_.prototype.generateCssKeyframes = function() {
  // Generate CSS
  var s = '';
  goog.object.forEach(this.keyframeAttributes, function(attributes, key) {
    s += '  ' + key + '% {\n';
    for (var n = 0; n < attributes.length; n++) {
      s += '    ' + attributes[n].name + ': ' + attributes[n].value + ';\n';
    }
    s += '  }\n';
  });
  return s;
};


/**
 * Clear the style for this specific animation.
 */
sm.runtime.CssAnimation_.prototype.clearStyle = function() {
  // TODO: proper names
  var animationName = 'webkitAnimationName';
  var animationDelay = 'webkitAnimationDelay';
  var animationDuration = 'webkitAnimationDuration';
  var animationTimingFunction = 'webkitAnimationTimingFunction';
  var animationFillMode = 'webkitAnimationFillMode';

  var computedStyle = window.getComputedStyle(this.el, null);
  goog.object.forEach(this.keyframeAttributes, function(attributes, key) {
    for (var n = 0; n < attributes.length; n++) {
      var name = attributes[n].name;
      this.style[name] = computedStyle[name];
    }
  }, this);

  // TODO: remove just self
  this.style[animationName] = '';
  this.style[animationDelay] = '';
  this.style[animationDuration] = '';
  this.style[animationTimingFunction] = '';
  //this.style[animationFillMode] = '';
};


/**
 * Set the style to kickoff the animation.
 */
sm.runtime.CssAnimation_.prototype.setStyle = function() {
  // TODO: proper names
  var animationName = 'webkitAnimationName';
  var animationDelay = 'webkitAnimationDelay';
  var animationDuration = 'webkitAnimationDuration';
  var animationTimingFunction = 'webkitAnimationTimingFunction';
  var animationFillMode = 'webkitAnimationFillMode';

  // Set initial state
  var attributes = this.keyframeAttributes['100'];
  if (attributes) {
    for (var n = 0; n < attributes.length; n++) {
      var name = attributes[n].name;
      this.style[name] = attributes[n].value;
    }
  }

  // TODO: append
  this.style[animationName] = this.name;
  this.style[animationDelay] = this.delay + 's';
  this.style[animationDuration] = this.duration + 's';
  this.style[animationTimingFunction] = this.timingFunction;
  //this.style[animationFillMode] = 'both';
};



/**
 * CSS runtime state.
 * @private
 * @constructor
 * @param {sm.Timeline} timeline Timeline for this playback sequence.
 * @param {sm.Scope} scope The target scope for the timeline.
 */
sm.runtime.CssState_ = function(timeline, scope) {
  /** @type {sm.Timeline} */
  this.timeline = timeline;
  /** @type {sm.Scope} */
  this.scope = scope;

  /** @type {boolean} */
  this.playing = false;
  /** @type {number} */
  this.playToken = 0;

  /** @type {?Function} */
  this.callback = null;

  /** @type {number} */
  this.totalDuration = 0;
  /** @type {Array.<sm.runtime.CssAnimation_>} */
  this.animations = [];

  this.constructAnimations_();
};


/**
 * Reset any state used during playback.
 */
sm.runtime.CssState_.prototype.reset = function() {
  this.playing = false;
  this.playToken = 0;

  this.callback = null;
};


/**
 * Next unique animation ID.
 * @private
 * @type {number}
 */
sm.runtime.CssState_.nextId_ = 0;


/**
 * 
 * @private
 * @type {Object.<string, string>}
 */
sm.runtime.CssState_.cssFragmentCache_ = {};


/**
 * Construct all CSS Animations.
 */
sm.runtime.CssState_.prototype.constructAnimations_ = function() {
  var animations = this.timeline.getAnimations();

  // Calculate total timeline duration
  var totalDuration = 0;
  for (var n = 0; n < animations.length; n++) {
    var animation = animations[n];
    var keyframes = animation.getKeyframes();
    for (var m = 0; m < keyframes.length; m++) {
      var keyframe = keyframes[m];
      var time = keyframe.getTime();
      totalDuration = Math.max(totalDuration, time);
    }
  }
  this.totalDuration = totalDuration;

  // Generate animations
  var styleSheet = '';
  for (var n = 0; n < animations.length; n++) {
    var animation = animations[n];
    var styleTarget = animation.getTarget();
    goog.asserts.assert(styleTarget.indexOf('.style') >= 0);
    var targetName = styleTarget.substr(0, styleTarget.indexOf('.style'));
    var targetElement = /** @type {HTMLElement} */(this.scope.get(targetName));
    var targetStyle = targetElement.style;

    /** @type {Object.<string, sm.runtime.CssAnimation_>} */
    var cssAnimations = {};

    var keyframes = animation.getKeyframes();
    for (var m = 0; m < keyframes.length; m++) {
      var keyframe = keyframes[m];
      var time = keyframe.getTime();
      var percent = (time / totalDuration) * 100;

      var attributes = keyframe.getAttributes();
      for (var o = 0; o < attributes.length; o++) {
        var attribute = attributes[o];
        var key = attribute.getName();

        var timingFunction = attribute.getTimingFunction();
        if (goog.isArray(timingFunction.value)) {
          timingFunction =
              'cubic-bezier(' + timingFunction.value.toString() + ')';
        } else {
          timingFunction = timingFunction.value;
        }

        var to = attribute.getValue();
        if (!goog.isDef(to)) {
          // TODO: pull from source and massage into string|number
          to = target[key];
        }

        var cssAnimation = cssAnimations[timingFunction];
        if (!cssAnimation) {
          cssAnimation = cssAnimations[timingFunction] =
              new sm.runtime.CssAnimation_(targetElement, targetStyle,
                  0, totalDuration, timingFunction);
        }

        cssAnimation.addAttributeKeyframe(percent, key, to);
      }
    }

    var keyframeRule = '@-webkit-keyframes';
    goog.object.forEach(cssAnimations, function(value) {
      var fragment = value.generateCssKeyframes();
      var oldName = sm.runtime.CssState_.cssFragmentCache_[fragment];
      if (oldName) {
        value.name = oldName;
      } else {
        value.name = 'sm_a' + sm.runtime.CssState_.nextId_++;
        var w = keyframeRule + ' "' + value.name + '" { \n';
        w += fragment;
        w += '}\n';
        styleSheet += w;
        sm.runtime.CssState_.cssFragmentCache_[fragment] = value.name;
      }
      this.animations.push(value);
    }, this);
  }
  if (styleSheet.length) {
    goog.cssom.addCssText(styleSheet);
  }

  /*var animationendName = 'webkitAnimationEnd';
  this.boundEndCallback = goog.bind(function(e) {
    if (e.animationName == this.name) {
    }
  }, this);*/
};



/**
 * An animation runtime using CSS Animations.
 * http://dev.w3.org/csswg/css3-animations/
 *
 * @constructor
 * @extends {sm.runtime.Runtime}
 */
sm.runtime.CssRuntime = function() {
  goog.base(this);

  /** @type {number} */
  this.nextPlayToken = 1;
}
goog.inherits(sm.runtime.CssRuntime, sm.runtime.Runtime);


/**
 * @override
 */
sm.runtime.CssRuntime.prototype.prepare =  function(timeline, scope) {
  var state = new sm.runtime.CssState_(timeline, scope);
  return state;
};


/**
 * @override
 */
sm.runtime.CssRuntime.prototype.play = function(state, opt_callback) {
  state = /** @type {sm.runtime.CssState_} */(state);

  var alreadyPlaying = state.playing;
  if (alreadyPlaying) {
    if (state.callback) {
      state.callback();
    }
    state.reset();
  }

  var time = goog.now();
  var playToken = this.nextPlayToken++;

  state.playing = true;
  state.playToken = playToken;

  // TODO: propagate starting values

  state.callback = opt_callback || null;

  window.setTimeout(function() {
    if (state.playToken === playToken) {
      if (state.callback) {
        state.callback();
      }
      state.reset();
    }
  }, state.totalDuration * 1000);

  goog.array.forEach(state.animations, function(value) {
    value.clearStyle();
  });
  window.setTimeout(function() {
    goog.array.forEach(state.animations, function(value) {
      value.setStyle();
    });
  }, 0);
};


/**
 * @override
 */
sm.runtime.CssRuntime.prototype.stop = function(state) {
  state = /** @type {sm.runtime.CssState_} */(state);

  if (!state.playing) {
    return;
  }

  goog.array.forEach(state.animations, function(value) {
    value.clearStyle();
  });

  if (state.callback) {
    state.callback();
  }
  state.reset();
};


/**
 * Detect if the CSS runtime is supported in the current browser.
 * @return {boolean} True if the CSS runtime is supported on this browser.
 */
sm.runtime.CssRuntime.detect = function() {
  // TODO: detect if CSS Animations are supported
  return true;
};
