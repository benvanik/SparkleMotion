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

// http://dev.w3.org/csswg/css3-animations/

// TODO: repeat
// TODO: reverse
// TODO: cull redundant
// TODO: diff timings per attribute:
//   - slice in and out of animation css list
//     animation-name: a, b, c;
//     animation-delay: 0, 1, 2;
//     -> remove b/1/etc

goog.provide('sm.runtime.CssRuntime');

goog.require('goog.array');
goog.require('goog.cssom');
goog.require('goog.object');
goog.require('sm.Scope');
goog.require('sm.Timeline');
goog.require('sm.TimingFunction');
goog.require('sm.runtime.Runtime');

/**
 * Next unique animation ID.
 * @private
 * @type {number}
 */
sm.runtime.CssState_.nextId_ = 0;


/**
 * Cache of CSS keyframe fragments (minus the @keyframe).
 * Maps the fragment contents to a previously-defined animation name.
 * @private
 * @type {Object.<string, string>}
 */
sm.runtime.CssState_.cssFragmentCache_ = {};


/**
 * Construct all CSS Animations.
 */
sm.runtime.CssState_.prototype.constructAnimations_ = function() {
  var animations = this.timeline.getAnimations();

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

    var agent = sm.runtime.cssAgent_;
    goog.object.forEach(cssAnimations, function(value) {
      value.finalize();
      var fragment = value.cssFragment;
      var oldName = sm.runtime.CssState_.cssFragmentCache_[fragment];
      if (oldName) {
        value.name = oldName;
      } else {
        value.name = 'sm_a' + sm.runtime.CssState_.nextId_++;
        var w = agent.atkeyframes + ' "' + value.name + '" { \n';
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
};
