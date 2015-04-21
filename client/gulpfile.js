// gulp
var gulp = require('gulp');

// plugins
var connect = require('gulp-connect');
var jslint = require('gulp-jslint');
var uglify = require('gulp-uglify');
var minifyCSS = require('gulp-minify-css');
var clean = require('gulp-clean');
var concat = require('gulp-concat');
var concat_css = require('gulp-concat-css');
var continous_concat = require('gulp-continuous-concat');
var watch = require('gulp-watch');
var plumber = require('gulp-plumber');
var recess = require('gulp-recess'); // CSS and LESS lint
var less = require('gulp-less'); 
var path = require('path');
var order = require("gulp-order"); // Order of files
var karma = require('karma').server; // Testing

// tasks
gulp.task('jslint', function () {
    gulp.src(['./public/src/*.js', './public/src/**/*.js'/*, './tests/*.js'*/])
        .pipe(plumber())
        .pipe(jslint())
        .pipe(plumber.stop());
});
gulp.task('recess', function () {
    gulp.src(['./public/src/*.less', './public/src/**/*.less'])
        .pipe(plumber())
        .pipe(recess())
        .pipe(plumber.stop());
});
gulp.task('clean', function() {
    gulp.src('./dist/*')
        .pipe(clean({force: true}));
});
//gulp.task('less', function () {
//    gulp.src(['./public/src/*.less', './public/src/**/*.less'])
//        .pipe(less())
//       .pipe(gulp.dest('./public/src/'));
//});
gulp.task('minify-css', function() {
    var opts = {comments:true,spare:true};
    gulp.src(['./public/src/less/*.less', './public/src/*.less', './public/src/**/*.less'])
        .pipe(less())
        .pipe(concat('app.min.css'))
        .pipe(minifyCSS(opts))
        .pipe(gulp.dest('dist/css'));
});
gulp.task('minify-app-js', function() {
    gulp.src(['./public/src/*.js', './public/src/**/*.js'])
        .pipe(concat('app.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'));
});
gulp.task('copy-bower-components', function () {
    gulp.src('./public/libs/**')
        .pipe(gulp.dest('dist/libs'));
});
gulp.task('copy-fonts', function () {
    gulp.src('./public/libs/font-awesome/fonts/**')
        .pipe(gulp.dest('dist/fonts'));
});
gulp.task('concat-libs-js', function () {
    gulp.src([
            './public/libs/jquery/dist/jquery.js',
            './public/libs/angular/angular.js',
            './public/libs/angular-route/angular-route.js',
            './public/libs/angular-ui-router/release/angular-ui-router.min.js',
            './public/libs/angular-bootstrap/ui-bootstrap-tpls.min.js',
            './public/libs/underscore/underscore.js',
            './public/libs/angular-underscore-module/angular-underscore-module.js',
            './public/libs/bootstrap/dist/js/bootstrap.min.js'])
        .pipe(concat('libs.js'))
        .pipe(gulp.dest('dist/libs'));
});

gulp.task('concat-libs-css', function () {
    gulp.src([
            './public/libs/bootstrap/dist/css/bootstrap.min.css',
            './public/libs/font-awesome/css/font-awesome.min.css'])
        .pipe(concat_css('libs.css'))
        .pipe(gulp.dest('dist/libs'));
});
gulp.task('copy-html-files', function () {
    gulp.src(['./public/src/*.html', './public/src/**/*.html'])
        .pipe(gulp.dest('dist/html/'));
});
gulp.task('copy-index', function () {
    gulp.src(['./public/index.html'])
        .pipe(gulp.dest('dist/'));
});
/*gulp.task('connect', function () {
    connect.server({
        root: 'dist/',
        port: 8888
    });
});*/

// watch task
gulp.task('watch', function () {
    gulp.watch(['./public/src/*.js', './public/src/**/*.js'], ['jslint', 'minify-app-js']);
    gulp.watch(['./public/src/less/*.less', './public/src/*.less', './public/src/**/*.less'], ['recess', 'minify-css']);
    gulp.watch(['./public/src/*.html', './public/src/**/*.html'], ['copy-html-files']);
    gulp.watch(['./public/index.html'], ['copy-index', 'build']);
    gulp.watch(['./gulpfile.js'], ['default', 'build']);
});

// default task
gulp.task('default',
    ['jslint', 'recess', 'minify-css', 'minify-app-js', 'copy-index', 'copy-html-files', 'watch']
);

// build task
gulp.task('build',
    ['minify-css', 'minify-app-js', 'copy-html-files', 'copy-bower-components', 'copy-fonts', 'concat-libs-js', 'concat-libs-css']
);
