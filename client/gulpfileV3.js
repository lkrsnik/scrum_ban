// gulp
var gulp = require('gulp');

// plugins
var connect = require('gulp-connect');
var jslint = require('gulp-jslint');
var uglify = require('gulp-uglify');
var minifyCSS = require('gulp-minify-css');
var clean = require('gulp-clean');
var concat = require('gulp-concat');
var watch = require('gulp-watch');
var plumber = require('gulp-plumber');

// tasks
gulp.task('clean', function() {
    gulp.src('./dist/*')
      .pipe(clean({force: true}));
});
gulp.task('minify-css', function() {
  var opts = {comments:true,spare:true};
  gulp.src(['./public/src/css/*.css', './public/src/css/**/*.css', './public/src/*.css'])
    .pipe(watch(['./public/src/css/*.css', './public/src/css/**/*.css', './public/src/*.css']))
    .pipe(plumber())
    .pipe(minifyCSS(opts))
    .pipe(gulp.dest('dist/css'))
});
gulp.task('minify-app-js', function() {
  gulp.src(['./public/src/*.js', './public/src/**/*.js'])
    .pipe(watch(['./public/src/*.js', './public/src/**/*.js']))
    .pipe(plumber())
    .pipe(concat('app.min.js'))
    .pipe(jslint())
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'))
});
gulp.task('copy-bower-components', function () {
  gulp.src('./public/libs/**')
    .pipe(gulp.dest('dist/bower_components'));
});
gulp.task('copy-html-files', function () {
  gulp.src(['./public/src/*.html', './public/src/**/*.html'])
    .pipe(gulp.dest('dist/html/'));
});
gulp.task('copy-index', function () {
  gulp.src(['./public/index.html'])
    .pipe(gulp.dest('dist/'));
});
gulp.task('connect', function () {
  connect.server({
    root: 'public/',
    port: 8888
  });
});


// default task
gulp.task('default',
  ['minify-css', 'minify-app-js', 'copy-index', 'copy-html-files', 'connect']
);
// build task
gulp.task('build',
  ['minify-css', 'minify-app-js', 'copy-html-files', 'copy-bower-components']
);