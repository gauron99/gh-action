# Knative Functions as Github Action!
Knative Functions' Github Action, so you can get Functions in your workflows!
Automatically determines what os the GH Runner has to get the right binary.
You can change where you want the `func` to be downloaded with `destination` - regardless, it will be in `$PATH`!
By default, uses latest version, but you can specify which one you want using `version`.
