#!/bin/bash

# start the node app
cd /var/www/dev.app.prenostik.com/
forever start app.js

# restart nginx
service nginx restart