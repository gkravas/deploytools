# Deploy Tools

Tools for comparing builds and upload the differences compressed to amazon S3

It utilizes [VersionAPI](https://github.com/gkravas/versionAPI) to submit information about your project's version and build, along with the patch & full url for each build. Patches assumed to be incremental.

The patch technic is only detecting changes on file and folder level and not on binary level.
To implement pacthing method on binary level you can use [xdelta](https://github.com/networkimprov/node-xdelta3)
