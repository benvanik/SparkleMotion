// Copyright 2011 Ben Vanik. All Rights Reserved.

goog.provide('sm.runtime.JavascriptRuntime');

goog.require('goog.array');
goog.require('goog.string');
goog.require('sm.Scope');
goog.require('sm.Timeline');
goog.require('sm.TimingFunction');
goog.require('sm.runtime.Runtime');



/**
 * A property tween for the Javascript runtime.
 * @private
 * @constructor
 * @param {Object} target Target object.
 * @param {string} key Property key on the target object.
 * @param {number} startTime Timeline-relative time to start tweening.
 * @param {number} duration Duration of the tween, in ms.
 * @param {function(number): number} timingFunction Timing function.
 */
sm.runtime.JavascriptTween_ = function(target, key, startTime, duration,
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
  this.timingFunction = sm.TimingFunction.getEvaluator(timingFunction);
};


/**
 * Update the tween value.
 * @param {number} time Current timeline-relative time, in ms.
 * @return {boolean} True if still updating.
 */
sm.runtime.JavascriptTween_.prototype.tick = goog.abstractMethod;


/**
 * A numerical property (with unit) tween for the Javascript runtime.
 * @private
 * @extends {sm.runtime.JavascriptTween_}
 * @constructor
 * @param {Object} target Target object.
 * @param {string} key Property key on the target object.
 * @param {number} startTime Timeline-relative time to start tweening, in ms.
 * @param {number} duration Duration of the tween, in ms.
 * @param {function(number): number} timingFunction Timing function.
 * @param {string|number} from The starting value.
 * @param {string|number} to The target value.
 */
sm.runtime.JavascriptNumberTween_ = function(target, key, startTime, duration,
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
      if (!(c >= 48 && c <= 57) && c != 64 && c != 101 && c != 69 && c != 45) {
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
    this.to = to;
  }
};
goog.inherits(sm.runtime.JavascriptNumberTween_, sm.runtime.JavascriptTween_);


/**
 * @override
 */
sm.runtime.JavascriptNumberTween_.prototype.tick = function(time) {
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


/**
 * Javascript runtime state.
 * @private
 * @constructor
 * @param {sm.Timeline} timeline Timeline for this playback sequence.
 * @param {sm.Scope} scope The target scope for the timeline.
 */
sm.runtime.JavascriptState_ = function(timeline, scope) {
  /** @type {sm.Timeline} */
  this.timeline = timeline;
  /** @type {sm.Scope} */
  this.scope = scope;

  /** @type {boolean} */
  this.playing = false;
  /** @type {number} */
  this.startTime = 0;
  /** @type {boolean} */
  this.needsReset = false;

  /** @type {Array.<sm.runtime.JavascriptTween_>} */
  this.tweens = [];

  /** @type {number} */
  this.startIndex = 0;

  this.constructTweens_();
};


/**
 * Build a sorted list of tweens for all objects.
 * @private
 */
sm.runtime.JavascriptState_.prototype.constructTweens_ = function() {
  // Generate all tweens
  var animations = this.timeline.getAnimations();
  for (var n = 0; n < animations.length; n++) {
    var animation = animations[n];
    var target = this.scope.get(animation.getTarget());

    /** @type {Object.<string, *>} */
    var attributeValues = {};

    var keyframes = animation.getKeyframes();
    for (var m = 0; m < keyframes.length; m++) {
      var keyframe = keyframes[m];
      var time = keyframe.getTime() * 1000;
      var duration = 0;
      if (m) {
        duration = time - keyframes[m - 1].getTime() * 1000;
      }
      var startTime = time - duration;

      var attributes = keyframe.getAttributes();
      for (var o = 0; o < attributes.length; o++) {
        var attribute = attributes[o];
        var key = attribute.getName();
        var to = attribute.getValue();
        var from;
        if (!m) {
          from = to;
        } else {
          from = attributeValues[key];
        }
        attributeValues[key] = to;
        var tween = new sm.runtime.JavascriptNumberTween_(
            target, key, startTime, duration,
            attribute.getTimingFunction(), from, to);
        this.tweens.push(tween);
      }
    }
  }

  // Sort by starting time
  this.tweens.sort(function(a, b) {
    return a.startTime - b.startTime;
  });

  console.log(this.tweens);
};


/**
 * Reset any state used during playback.
 */
sm.runtime.JavascriptState_.prototype.reset = function() {
  this.startIndex = 0;
};


/**
 * Update all tweens.
 * @param {number} time Current system time.
 * @return {boolean} True if still updating.
 */
sm.runtime.JavascriptState_.prototype.tick = function(time) {
  var t = time - this.startTime;

  var firstIndex = this.tweens.length - 1;
  var anyUpdating = false;

  for (var n = this.startIndex; n < this.tweens.length; n++) {
    var tween = this.tweens[n];
    if (tween.startTime > t) {
      break;
    }

    if (tween.tick(t)) {
      anyUpdating = true;
      firstIndex = Math.min(firstIndex, n);
    }
  }

  this.startIndex = firstIndex;

  return anyUpdating;
};



/**
 * An animation runtime using native Javascript math.
 *
 * @constructor
 * @extends {sm.runtime.Runtime}
 */
sm.runtime.JavascriptRuntime = function() {
  goog.base(this);

  /**
   * Ticks per second.
   * @private
   * @type {number}
   */
  this.tickHz_ = 60;

  /**
   * Current timing interval ID (if running).
   * @private
   * @type {?number}
   */
  this.intervalId_ = null;

  /**
   * Actively running sequences.
   * @private
   * @type {Array.<sm.runtime.JavascriptState_>}
   */
  this.actives_ = [];

  /**
   * @private
   * @type {function(): void}
   */
  this.boundTick_ = goog.bind(this.tick_, this);

  /**
   * @private
   * @type {function}
   */
  this.requestAnimationFrame_ =
      window['webkitRequestAnimationFrame'] ||
      window['mozRequestAnimationFrame'] ||
      window['oRequestAnimationFrame'] ||
      window['msRequestAnimationFrame'] ||
      window['requestAnimationFrame'];
}
goog.inherits(sm.runtime.JavascriptRuntime, sm.runtime.Runtime);


/**
 * Start the ticking timer, if needed.
 * @private
 */
sm.runtime.JavascriptRuntime.prototype.startTicking_ = function() {
  if (this.requestAnimationFrame_) {
    this.requestAnimationFrame_.call(window, this.boundTick_);
  } else {
    if (this.intervalId_ !== null) {
      return;
    }
    this.intervalId_ = window.setInterval(this.boundTick_, 1000 / this.tickHz_);
  }
};


/**
 * Stop the ticking timer.
 * @private
 */
sm.runtime.JavascriptRuntime.prototype.stopTicking_ = function() {
  if (this.intervalId_ !== null) {
    window.clearInterval(this.intervalId_);
    this.intervalId_ = null;
  }
};


/**
 * Perform a tick of all active sequences.
 * @private
 * @param {number=} opt_time Current time.
 */
sm.runtime.JavascriptRuntime.prototype.tick_ = function(opt_time) {
  var time = goog.isDef(opt_time) ? opt_time : goog.now();
  for (var n = 0; n < this.actives_.length; n++) {
    var active = this.actives_[n];
    if (!active.tick(time)) {
      active.playing = false;
      active.startTime = 0;
      this.actives_.splice(n, 1);
      n--;
    }
  }

  if (this.requestAnimationFrame_ && this.actives_.length) {
    this.requestAnimationFrame_.call(window, this.boundTick_);
  }
};


/**
 * @override
 */
sm.runtime.JavascriptRuntime.prototype.prepare =  function(timeline, scope) {
  var state = new sm.runtime.JavascriptState_(timeline, scope);
  return state;
};


/**
 * @override
 */
sm.runtime.JavascriptRuntime.prototype.play = function(state) {
  state = /** @type {sm.runtime.JavascriptState_} */(state);

  // Allowing restart on play for now
  //if (state.playing) {
  //  return;
  //}

  var time = goog.now();

  if (state.needsReset) {
    state.reset(time);
  }

  state.playing = true;
  state.startTime = time;
  state.needsReset = true;

  this.actives_.push(state);

  this.startTicking_();
};


/**
 * @override
 */
sm.runtime.JavascriptRuntime.prototype.stop = function(state) {
  if (!state.playing) {
    return;
  }

  goog.array.remove(this.actives_, state);

  state.playing = false;
  state.startTime = 0;

  if (!this.actives_.length) {
    this.stopTicking_();
  }
};
