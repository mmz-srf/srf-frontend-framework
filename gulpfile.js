'use strict';

var gulp            = require('gulp'),
    gulpLoadPlugins = require('gulp-load-plugins'),
    del             = require('del'),
    runSequence     = require('run-sequence'),
    browserSync     = require('browser-sync'),
    exec            = require('child_process').exec;


var $ = gulpLoadPlugins();
var reload = browserSync.reload;


const DEST = 'public';
const AUTOPREFIXER_BROWSERS = [
    'ie >= 11',
    'ie_mob >= 11',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 8',
    'android >= 4.4',
    'bb >= 10'
];

gulp.task('clean', function () {
    return del([
        'public/assets'
    ]);
});

gulp.task('styles', function () {
    return gulp.src([
        'source/_patterns/main.scss'
    ])
        .pipe($.sass.sync({
            outputStyle: 'compressed',    //use 'nested' for debugging
            precision: 10
        }).on('error', $.sass.logError))
        .pipe($.autoprefixer({browsers: AUTOPREFIXER_BROWSERS}))
        .pipe(gulp.dest('public/assets/css'))
        .pipe($.size({
            title: 'css'
        }));
});

gulp.task('copy', function() {
    return  gulp.src([
       'source/assets/**/*',
     ], {
       dot: true
     }).pipe(gulp.dest('public/assets'));
});

gulp.task('serve', function() {
  browserSync({
    notify: false,
    port: 8080,
    server: {
      baseDir: ['public/']
    },
    open: false
  });
});

gulp.task('patternlab', function (cb) {
    exec('php core/console --generate', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
})

gulp.task('watch', function(cb) {
    gulp.watch('source/_patterns/**/*.scss', ['styles'], reload);
    gulp.watch('source/assets/**/*', ['copy'], reload);
    exec('php core/console --watch --patternsonly', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
});

gulp.task('build', function(cb) {
    runSequence(
        ['clean'],
        ['patternlab'],
        ['copy', 'styles'],
        cb
    );
});

gulp.task('gh-pages-deploy', function() {
    return gulp.src('public/**/*')
        .pipe($.ghPages());
});

gulp.task('deploy', function() {
    runSequence(
        ['build'],
        ['gh-pages-deploy']
    );
});

gulp.task('default', function() {
    runSequence(
        ['build'],
        ['serve', 'watch']
    );
});