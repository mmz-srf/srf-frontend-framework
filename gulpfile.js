'use strict';

/* eslint-disable */
var gulp = require('gulp'),
    gulpLoadPlugins = require('gulp-load-plugins'),
    del = require('del'),
    runSequence = require('run-sequence'),
    browserSync = require('browser-sync'),
    babel = require('babelify'),
    browserify = require('browserify'),
    imagemin = require('gulp-imagemin'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    exec = require('child_process').exec,
    eslint = require('gulp-eslint'),
    sassLint = require('gulp-sass-lint');

var $ = gulpLoadPlugins();
var reload = browserSync.reload;


var DEST = 'public';
var AUTOPREFIXER_BROWSERS = [
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

gulp.task('scripts', function() {
    return browserify({entries: 'source/assets/js/main.js'})
        .transform(babel)
        .bundle()
        .pipe(source('bundle.js'))
        .pipe(buffer())
        .pipe(gulp.dest('public/assets/js/'))
});

gulp.task('scripts-vendor', function() {
    return gulp.src(
        [
            'node_modules/jquery/dist/jquery.min.js',
            'node_modules/slick-carousel/slick/slick.min.js'
        ])
        .pipe($.concat({ path: 'vendor.js'}))
        .pipe(gulp.dest('public/assets/js/'));
});

gulp.task('images', function() {
    gulp.src('source/assets/img/**/*')
        .pipe(imagemin([
            imagemin.gifsicle(),
            imagemin.optipng(),
            imagemin.svgo({plugins: [{removeTitle: true, removeDesc: true}]})
        ]))
        .pipe(gulp.dest('public/assets/img'))
});

gulp.task('copy', function() {
    return  gulp.src([
        'source/assets/!(img)/**/*'   // copy all assets except the img folder
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
});

gulp.task('watch', function(cb) {
    gulp.watch('source/_patterns/**/*.scss', ['styles'], reload);
    gulp.watch('source/assets/js/*.js', ['scripts'], reload);
    gulp.watch('source/assets/!(img)/**/*', ['copy'], reload);
    gulp.watch('source/assets/img/**/*', ['images'], reload);
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
        ['copy', 'images', 'styles', 'scripts', 'scripts-vendor'],
        cb
    );
});

gulp.task('gh-pages-deploy', function() {
    return gulp.src('public/**/*')
        .pipe($.ghPages());
});

gulp.task('js-lint', () => {
    // ESLint ignores files with "node_modules" paths.
    // So, it's best to have gulp ignore the directory as well.
    // Also, Be sure to return the stream from the task;
    // Otherwise, the task may end before the stream has finished.
    return gulp.src(['source/_patterns/**/*.js','source/assets/**/*.js'])
    // eslint() attaches the lint output to the "eslint" property
    // of the file object so it can be used by other modules.
        .pipe(eslint())
        // eslint.format() outputs the lint results to the console.
        // Alternatively use eslint.formatEach() (see Docs).
        .pipe(eslint.format())
        // To have the process exit with an error code (1) on
        // lint error, return the stream and pipe to failAfterError last.
        .pipe(eslint.failAfterError());
});

gulp.task('sass-lint', function () {
    return gulp.src('source/_patterns/**/*.s+(a|c)ss')
        .pipe(sassLint({
            options: {
                formatter: 'stylish',
                'merge-default-rules': true
            },
            configFile: '.sass-lint.yml'
        }))
        .pipe(sassLint.format())
        .pipe(sassLint.failOnError())
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
