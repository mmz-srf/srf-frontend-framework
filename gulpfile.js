'use strict';

var gulp            = require('gulp'),
    gulpLoadPlugins = require('gulp-load-plugins'),
    del             = require('del'),
    runSequence     = require('run-sequence'),
    browserSync     = require('browser-sync'),
    path            = require('path'),
    shell           = require('gulp-shell');

var $ = gulpLoadPlugins();
var reload = browserSync.reload;


const DEST = 'public';
const AUTOPREFIXER_BROWSERS = [
    'ie >= 10',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
];

gulp.task('clean', function() {
    return del.bind(null, [DEST]);
});

gulp.task('styles', function () {
    return gulp.src([
        'source/assets/scss/**/*.scss'
    ])
        .pipe($.sourcemaps.init())
        .pipe($.sass.sync({
            outputStyle: 'compressed',    //use 'nested' for debugging
            precision: 10,
        }).on('error', $.sass.logError))
        .pipe($.autoprefixer({browsers: AUTOPREFIXER_BROWSERS}))
        .pipe($.sourcemaps.write('./maps'))
        .pipe(gulp.dest('public/assets/css'))
        .pipe($.size({
            title: 'css'
        }));;
});

gulp.task('patternlab', function () {
    return gulp.src('', {read: false})
        .pipe(shell([
            'php core/console --generate'
        ]))
        .pipe(reload({stream:true}));
});

gulp.task('watch', function() {
    gulp.watch('source/assets/**/*', ['styles'], reload);
});

gulp.task('build', function() {
    runSequence(
        ['clean'],
        ['patternlab'],
        ['styles']
    );
});

gulp.task('default', function() {
    runSequence(
        ['build'],
        ['watch']
    );
});