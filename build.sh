#!/bin/sh

# Copyright 2011 Ben Vanik. All Rights Reserved.

CLOSURE=../closure-library
CLOSURE_BUILD=$CLOSURE/closure/bin/build
COMPILER=../closure-compiler/compiler.jar

$CLOSURE_BUILD/depswriter.py \
  --root_with_prefix="src/ ../../../SparkleMotion/src/" \
  --output_file=lib/sm_deps.js

$CLOSURE_BUILD/closurebuilder.py \
  --root=$CLOSURE/ \
  --root=src/ \
  --namespace="sm" \
  --compiler_jar=$COMPILER \
  --compiler_flags="--compilation_level=ADVANCED_OPTIMIZATIONS" \
  --output_mode=compiled \
  --output_file=lib/sm_compiled.js
