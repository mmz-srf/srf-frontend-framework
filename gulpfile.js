/*Usage :
 *
 *  INSTALLATION
 *  Before first execution of gulp, please do an npm install (internet connection required)
 *
 *  GENERATE ALL ASSETS
 *  gulp
 *
 *  WATCH FOR CHANGES
 *  gulp watch
 *
 */

'use strict';


var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    del = require('del'),
    sourcemaps = require('gulp-sourcemaps'),
    browserSync = require('browser-sync').create(),
    sass = require('gulp-sass'),
    imagemin = require('gulp-imagemin'),
    autoprefixer = require('gulp-autoprefixer');

const reload = browserSync.reload;


//STYLES: compile style files and pipe them to the public web folder
gulp.task('styles', function () {
    return gulp.src([
        'src/scss/main.scss'
    ])
        .pipe(sourcemaps.init())
        .pipe(sass.sync({
            outputStyle: 'compressed',    //use 'nested' for debugging
            precision: 10,
            includePaths: ['.', 'bower_components/bootstrap-sass/assets/stylesheets']
        }).on('error', sass.logError))
        .pipe(autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}))
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest('web/assets/css'))
        .pipe(reload({stream: true}));
});

//SCRIPTS: uglify script files and pipe them to the public web folder
gulp.task('scripts', function () {
    return gulp.src([
        'bower_components/jquery/dist/jquery.js',
        'bower_components/bootstrap-sass/assets/javascripts/bootstrap.js',
        'src/js/**/*.js'
    ])
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest('web/assets/js'))
        .pipe(reload({stream: true}));
});

//IMAGES: Minimize images and save them to the public web folder
gulp.task('images', function() {
    return gulp.src('src/img/**/*.*')
        .pipe(imagemin({
            progressive: true,
            interlaced: true,
            // don't remove IDs from SVGs, they are often used
            // as hooks for embedding and styling
            svgoPlugins: [{cleanupIDs: false}]
        }))
        .pipe(gulp.dest('web/assets/img'));
});


//FONTS: copy font files to the public web folder
gulp.task('fonts', function () {
    return gulp.src([
        'src/fonts/*'
    ])
        .pipe(gulp.dest('web/assets/fonts/'))
});

//CLEAN: clean the gulp-generated files from the public web folder
gulp.task('clean', del.bind(null, ['web/assets']));

//WATCH
gulp.task('watch', function () {
    gulp.watch('src/css/main.css', ['styles', reload]);
    gulp.watch('src/fonts/**/*.*', ['fonts', reload]);
    gulp.watch('src/img/**/*.*', ['images', reload]);
    gulp.watch('src/js/**/*.*', ['scripts', reload]);
    gulp.watch('src/scss/main.scss', ['styles', reload]);
});

//DEFAULT
gulp.task('default', ['clean'], function () {
    var tasks = ['styles', 'scripts', 'images', 'fonts'];
    tasks.forEach(function (val) {
        gulp.start(val);
    });
});
