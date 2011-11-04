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

goog.provide('sm.Scope');

goog.require('goog.object');



/**
 * A target lookup scope used for resolving animation identifiers.
 *
 * @constructor
 * @param {goog.dom.DomHelper=} opt_dom DOM helper to perform lookups in, if
 *     browser scope support is desired.
 * @param {Object.<!Object>=} opt_map Map of IDs to target objects.
 */
sm.Scope = function(opt_dom, opt_map) {
  /**
   * DOM to perform element lookups in, if any.
   * @private
   * @type {goog.dom.DomHelper}
   */
  this.dom_ = opt_dom || null;

  /**
   * Custom ID->target map.
   * @private
   * @type {!Object.<!Object>}
   */
  this.map_ = opt_map ? goog.object.clone(opt_map) : {};
};


/**
 * Gets a target object by specifier. For example, 'foo' or 'foo.member'.
 * @param {string} specifier The specifier of the object.
 * @return {Object} Target object, if found.
 */
sm.Scope.prototype.get = function(specifier) {
  var id = specifier;
  /** @type {?string} */
  var path = null;
  var n = specifier.indexOf('.');
  if (n > 0) {
    id = specifier.substr(0, n);
    path = specifier.substr(n + 1);
  }
  var value = this.map_[id];
  if (!value && this.dom_) {
    value = this.dom_.getElement(id);
  }
  while (value && path && path.length) {
    n = path.indexOf('.');
    if (n > 0) {
      id = path.substr(0, n);
      path = path.substr(n + 1);
    } else {
      id = path;
      path = null;
    }
    value = value[id];
  }
  return value;
};
