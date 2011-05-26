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

goog.provide('SM');

goog.require('sm');
goog.require('sm.Sequence');
goog.require('sm.TimingFunction');


/**
 * @define {boolean} Whether to export the 'SM' namespace.
 */
var EXPORT_SM = true;

var SM = {};

if (EXPORT_SM) {
  goog.exportSymbol('SM', SM);
  goog.exportProperty(SM, 'loadTimeline', sm.loadTimeline);
  goog.exportProperty(SM, 'sequenceTimeline', sm.sequenceTimeline);

  goog.exportProperty(sm.Sequence.prototype, 'play',
      sm.Sequence.prototype.play);
  goog.exportProperty(sm.Sequence.prototype, 'stop',
      sm.Sequence.prototype.stop);

  goog.exportSymbol('SM.TimingFunction', sm.TimingFunction);
  goog.exportProperty(sm.TimingFunction, 'EASE',
      sm.TimingFunction.EASE);
  goog.exportProperty(sm.TimingFunction, 'LINEAR',
      sm.TimingFunction.LINEAR);
  goog.exportProperty(sm.TimingFunction, 'EASE',
      sm.TimingFunction.EASE_IN);
  goog.exportProperty(sm.TimingFunction, 'EASE_OUT',
      sm.TimingFunction.EASE_OUT);
  goog.exportProperty(sm.TimingFunction, 'EASE_IN_OUT',
      sm.TimingFunction.EASE_IN_OUT);
}
