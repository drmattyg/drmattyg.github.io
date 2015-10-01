#!/bin/sh
cd /Users/mgordon/repo/drmattyg.github.io
/usr/local/bin/grunt
git commit -a -m "Updating WH data"
git push
