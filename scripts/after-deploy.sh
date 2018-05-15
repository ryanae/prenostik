#!/bin/bash

cd /var/www/dev.app.prenostik.com/

# install node modules, and run gulp
npm install
node_modules/gulp/bin/gulp.js

# update config file
rm app/config/config.json
cp app/config/config.dev.json app/config/config.json

# fix file ownership
chown -R ubuntu:ubuntu *
