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
    sassLint = require('gulp-sass-lint'),
    frontifyApi = require('@frontify/frontify-api'),
    minimist = require('minimist'),
    replace = require('gulp-replace'),
    concat = require('gulp-concat')
;

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

const FRONTIFY_PROJECT_ID = '28',
      FRONTIFY_BASE_URL = 'https://srf.frontify.com';

var knownOptions = {
    string: 'token',
    default: { env: '' }
};

var options = minimist(process.argv.slice(2), knownOptions);

gulp.task('clean', function () {
    return del([
        'public/assets',
        'export'
    ]);
});

gulp.task('styles', function () {
    return gulp.src([
        'source/_patterns/main.scss',
        'source/assets/critical/c_article.scss',
        'source/assets/critical/c_landingpage.scss'
    ])
        .pipe($.sass.sync({
            outputStyle: 'compressed',    //use 'nested' for debugging
            precision: 10
        }).on('error', $.sass.logError))
        .pipe($.autoprefixer({
            browsers: AUTOPREFIXER_BROWSERS,
            grid: true
        }))
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
            imagemin.optipng()
            //imagemin.svgo()
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

gulp.task('copy-critical-js', function() {
    return  gulp.src([
        'node_modules/fg-loadcss/dist/loadCSS.js',   // loadCSS for fef "critical css" demo pages
        'node_modules/fg-loadcss/dist/onloadCSS.js'  // onloadCSS for fef "critical css" demo pages
    ], {
        dot: true
    }).pipe(gulp.dest('public/assets/critical'));
});

gulp.task('serve', function() {
  browserSync({
    notify: false,
    port: 8081,
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


gulp.task('patternlab-export', function (cb) {
    exec('php core/console --export --clean', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
});

gulp.task('watch', function(cb) {
    gulp.watch('source/_patterns/**/*.scss', ['styles'], reload);
    gulp.watch('source/assets/js/**/*.js', ['scripts'], reload);
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
        ['copy', 'copy-critical-js', 'images', 'styles', 'scripts', 'scripts-vendor'],
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


// sync patterns in the stream
gulp.task('frontify-pattern-sync', function () {
    var accessToken = options.token;
    frontifyApi.syncPatterns(
        {
            access_token: accessToken,
            project: FRONTIFY_PROJECT_ID,
            baseUrl: FRONTIFY_BASE_URL,
            cwd: 'export/patterns'
        },
        [
            '10-atoms*/*.html',
            '20-molecules*/*.html',
            '30-organisms*/*.html',
            '50-pages*/*.html',
            '!50-pages-30-critical*/*'
        ]
    ).catch(function(err) {
        console.error(err);
    });
});

gulp.task('frontify-asset-sync', function() {
    var accessToken = options.token;
    frontifyApi.syncAssets(
        {
            access_token: accessToken,
            project: FRONTIFY_PROJECT_ID,
            baseUrl: FRONTIFY_BASE_URL,
            cwd: ''
        },
        [
            'public/assets/**/*.*'
        ]
    ).catch(function(err) {
        console.error(err);
    });
});

gulp.task('frontify-bundle-script', function () {
    return gulp.src(['public/assets/js/vendor.js', 'public/assets/js/bundle.js'])
        .pipe(concat('frontify-bundle.js'))
        .pipe(gulp.dest('public/assets/frontify'));
});

gulp.task('frontify-export-rewrite-paths', function () {
    return gulp.src(['export/**/*.html'])
        .pipe(replace('../../assets/', '/public/assets/'))
        .pipe(replace('src="/assets/', 'src="/public/assets/'))
        .pipe(gulp.dest('export'));
});

gulp.task('frontify', function() {
    runSequence(
        ['build'],
        ['patternlab-export'],
        ['frontify-export-rewrite-paths', 'frontify-bundle-script'],
        ['frontify-pattern-sync'],
        ['frontify-asset-sync']
    );
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
