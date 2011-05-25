#!/usr/bin/python

# Copyright 2011 Google Inc. All Rights Reserved.

import os

CLOSURE_LIBRARY='../closure-library'
CLOSURE_COMPILER='../closure-compiler'
CLOSURE_BUILD=CLOSURE_LIBRARY + '/closure/bin/build'
CLOSURE_COMPILER=CLOSURE_COMPILER + '/compiler.jar'

os.system(
  CLOSURE_BUILD + '/depswriter.py ' + ' '.join([
    '--root_with_prefix="src/ ../../../SparkleMotion/src/"',
    '--output_file=lib/sm_deps.js',
  ]))

COMPILER_FLAGS=[
  '--compilation_level=ADVANCED_OPTIMIZATIONS',
  '--summary_detail_level=3',
  '--jscomp_error=accessControls',
  '--jscomp_error=ambiguousFunctionDecl',
  '--jscomp_error=checkRegExp',
  '--jscomp_error=checkTypes',
  '--jscomp_error=checkVars',
  '--jscomp_error=fileoverviewTags',
  '--jscomp_error=internetExplorerChecks',
  '--jscomp_error=invalidCasts',
  '--jscomp_error=missingProperties',
  '--jscomp_error=nonStandardJsDocs',
  '--jscomp_error=strictModuleDepCheck',
  '--jscomp_error=undefinedVars',
  '--jscomp_error=unknownDefines',
  '--jscomp_error=uselessCode',
  '--jscomp_error=visibility',
  '--jscomp_warning=deprecated',
  #'--strict',
  #'--aggressive_var_check_level=ERROR',
  #'--alias_all_strings',
  #'--check_global_names_level=ERROR',
  #'--check_methods',
  #'--check_missing_return=ERROR',
  #'--check_provides=ERROR',
  #'--check_requires=ERROR',
  #'--check_types',
  #'--closure_pass',
  #'--coding_convention=CLOSURE_OPEN_SOURCE',
  #'--collapse_properties',
  #'--compute_function_side_effects=true',
  #'--define goog.MODIFY_FUNCTION_PROTOTYPES=false',
  #'--function_arity_level=ERROR',
  #'--inline_getters',
  #'--inline_variables',
  #'--mark_as_compiled',
  #'--method_arity_level=ERROR',
  #'--property_renaming=ALL_UNQUOTED',
  #'--remove_unused_prototype_props',
  #'--remove_unused_prototype_props_in_externs',
  #'--report_unknown_types=OFF',
  #'--smart_name_removal',
  #'--variable_renaming=ALL',
]

COMPILER_EXTERNS=[
]

COMPILER_FLAGS=COMPILER_FLAGS + \
  ['--externs %s' % (s) for s in COMPILER_EXTERNS]

os.system(
  CLOSURE_BUILD + '/closurebuilder.py ' + ' '.join([
    '--root=' + CLOSURE_LIBRARY + '/',
    '--root=src/',
    '--namespace="SM"',
    '--compiler_jar=' + CLOSURE_COMPILER,
    '--output_mode=compiled',
    '--output_file=lib/sm_compiled.js' + ' ',
    ' '.join(['--compiler_flags="%s"' % (s) for s in COMPILER_FLAGS]),
  ]))
