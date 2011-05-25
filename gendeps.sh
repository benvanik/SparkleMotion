#!/bin/sh

# Copyright 2011 Google Inc. All Rights Reserved.

CLOSURE=../closure-library
CLOSURE_BUILD=$CLOSURE/closure/bin/build
COMPILER=../closure-compiler/compiler.jar

$CLOSURE_BUILD/depswriter.py \
  --root_with_prefix="src/ ../../../SparkleMotion/src/" \
  --output_file=lib/sm_deps.js
