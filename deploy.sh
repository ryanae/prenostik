#!/bin/bash

ssh root@prenostik-frontend-1.prenostik.com
cd /var/www/staging.app.prenostik.com/trunk/
sudo rm public/js/app.min.js
forever stop app.js && sudo git pull
sudo node_modules/gulp/bin/gulp.js
forever start app.js
