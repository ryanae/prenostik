'use strict';

var gulp = require('gulp');
var fs = require('fs');
var rename = require('gulp-rename');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var glob = require('glob');

var uglify = require('gulp-uglify');
var streamify = require('gulp-streamify');
var less = require('gulp-less');
var sourcemaps = require('gulp-sourcemaps');
var child_process = require('child_process');

var hbsfy = require('hbsfy');
var reactify = require('reactify');
var babelify = require('babelify');


gulp.task("config", function() {
  var destFile = 'app/config/config.json';
  var localFile = 'app/config/config.local.json';
  if(!fs.existsSync(destFile)){
    if(fs.existsSync(localFile)){
      gulp.src(localFile)
        .pipe(rename('config.json'))
        .pipe(gulp.dest('app/config'))
    }
  }
});

// gulp.task('redis-start', function() {
//   child_process.exec('redis-server', function(err, stdout, stderr) {
//     console.log(stdout);
//     if (err !== null) {
//       console.log('exec error: ' + err);
//     }
//   });
// });

gulp.task('styles', function() {
  return gulp.src('public/less/app.less')
    .pipe(less())
    .pipe(gulp.dest('public/css'));
});

gulp.task('scripts', function() {
  var b = browserify({
      entries: './public/js/app.js',
      extensions: ['.jsx'],
  });

  return b.transform(babelify, 
      {presets: ["es2015", "react"],
       ignore: 'public/js/vendor'})
    .transform(hbsfy)
    .bundle()
    .pipe(source('app.min.js'))
    .pipe(streamify(uglify()))
    .pipe(gulp.dest('./public/js'));
});

gulp.task('old-scripts', function(){
  var b = browserify({
      entries: './public/js/app.old.js',
      extensions: ['.jsx'],
  });

  return b.transform(reactify)
    .transform(hbsfy)
    .bundle()
    .pipe(source('app.min.js'))
    .pipe(gulp.dest('./public/js'));

});

gulp.task('dev-scripts', function() {

  var b = browserify({
      entries: './public/js/app.js',
      extensions: ['.jsx'],
      debug: true,
  });

  return b.transform(babelify, 
      {presets: ["es2015", "react"],
       ignore: 'public/js/vendor'})
    .transform(hbsfy)
    .bundle()
    .pipe(source('app.min.js'))
    .pipe(gulp.dest('./public/js'));
});

// gulp.task('default', ['scripts', 'styles']);
gulp.task('default', ['old-scripts', 'styles']);
gulp.task('dev', ['dev-scripts', 'styles']);
