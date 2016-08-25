'use strict';

var gulp            = require('gulp');
var gulpLoadPlugins = require('gulp-load-plugins');
var del             = require('del');
var runSequence     = require('run-sequence');
var browserSync     = require('browser-sync');
var path            = require('path');
var merge           = require('merge-stream');

var $ = gulpLoadPlugins();
var reload = browserSync.reload;

const DEST = 'dist';
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

var distpath = function(subpath) {
  return !subpath ? DEST : path.join(DEST, subpath);
};

gulp.task('styles', function () {
  return gulp.src([
          'app/assets/scss/**/*.scss'
      ])
      .pipe($.sourcemaps.init())
      .pipe($.sass.sync({
          outputStyle: 'compressed',    //use 'nested' for debugging
          precision: 10,
      }).on('error', $.sass.logError))
      .pipe($.autoprefixer({browsers: AUTOPREFIXER_BROWSERS}))
      .pipe($.sourcemaps.write('./maps'))
      .pipe(gulp.dest(distpath('assets/css')))
      .pipe($.size({
          title: 'css'
      }));;
});

gulp.task('images', function() {
  return gulp.src([
          'app/assets/img/**'
      ])
      .pipe($.imagemin({
          progressive: true,
          interlaced: true
      }))
      .pipe(gulp.dest(distpath('assets/img')))
      .pipe($.size({
          title: 'images'
      }));
});

gulp.task('fonts', function() {
  return gulp.src([
          'app/assets/fonts/**'
      ])
      .pipe(gulp.dest(distpath('assets/fonts')))
      .pipe($.size({
          title: 'fonts'
      }));
});

gulp.task('vulcanize', function() {
    return gulp.src('app/elements/elements.html')
        .pipe($.vulcanize({
            stripComments: true,
            inlineCss: true,
            inlineScripts: true
        }))
        .pipe(gulp.dest(distpath('elements')))
        .pipe($.size({
            title: 'vulcanize'
        }));
});

gulp.task('copy', function() {
  var app = gulp.src([
    'app/*',
    '!app/assets',
    '!app/test',
    '!app/elements',
    '!app/bower_components',
    '!app/cache-config.json',
    '!**/.DS_Store'
  ], {
    dot: true
  }).pipe(gulp.dest(distpath()));

  // Copy over only the bower_components we need
  // These are things which cannot be vulcanized
  var bower = gulp.src([
    'app/bower_components/{webcomponentsjs,platinum-sw,sw-toolbox,promise-polyfill}/**/*'
  ]).pipe(gulp.dest(distpath('bower_components')));

  return merge(app, bower)
      .pipe($.size({
        title: 'copy'
      }));
});

gulp.task('serve', function() {
  browserSync({
    notify: false,
    port: 3000,
    server: {
      baseDir: ['dist/']
    }
  });
});

gulp.task('watch', function() {
  gulp.watch('app/assets/**/*', ['styles', 'images', 'fonts'], reload);
    gulp.watch(['app/elements/**/*'], ['vulcanize'], reload);
    gulp.watch(['app/**/*', '!app/assets/', '!app/elements/'], ['copy'], reload);
});

gulp.task('clean', function() {
    return del.bind(null, [DEST]);
});

gulp.task('build', function() {
  runSequence(
      ['clean'],
      ['styles', 'images', 'fonts', 'vulcanize', 'copy']
  );
});

gulp.task('default', function() {
    runSequence(
        ['build'],
        ['watch', 'serve']
    );
});
