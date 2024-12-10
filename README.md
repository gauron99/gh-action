# Knative Functions as Github Action!
Knative Functions' Github Action, so you can get Functions in your workflows!
Automatically determines what os the GH Runner has to get the right binary.
You can change where you want the `func` to be downloaded with `destination` - regardless, it will be in `$PATH`!
By default, uses latest version, but you can specify which one you want using `version`.

`action.yml` -- action yaml with descriptions
name: 'gauron custom GH action'
description: 'This action does custom stuff for it is custom'
inputs:
  name:
    description: '(optional) Name of the Function binary (defaults to "func"'
  binary:
    description: '(optional) Binary you want to download (exact string expected), otherwise will be determined via the OS of GH Runner'
  version:
    description: '(optional) Provide version to download'
  destination:
    description: '(optional) Provide a path where to move the desired downloaded binary, otherwise cwd is used'
runs:
  using: 'node20'
  main: 'index.js'
