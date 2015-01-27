var gulp        = require('gulp'),
    gutil       = require('gulp-util'),
    path        = require('path'),
    plumber     = require('gulp-plumber'),
    less        = require('gulp-less'),
    uglify      = require('gulp-uglify'),
    jshint      = require('gulp-jshint'),
    concat      = require('gulp-concat'),
    merge       = require('merge-stream'),
    handlebars  = require('gulp-handlebars'),
    wrap        = require('gulp-wrap'),
    declare     = require('gulp-declare'),
    watch       = require('gulp-watch'),
    mocha       = require('gulp-spawn-mocha'),
    options     = {reporter: 'mochawesome', timeout: 30000, slow: 1, "no-exit": true},
    config      = require('./lib/config');

var watchFiles = [
  path.join(config.srcLessDir, '*.less'),
  path.join(config.srcJsDir, '*.js'),
  path.join('!', config.srcJsDir, 'hbsHelpers.js'),
  path.join(config.srcHbsDir, '*.mu')
];

var lintPaths =  {
  server: './.jshintrc',
  client: './client.jshintrc',
  lint: [
    './lib/*.js',
    '!./lib/templates.js'
  ],
  felint: [
    path.join(config.srcJsDir, '*.js')
  ]
};

function onWatchFileChanged(file) {
  var ext = file.relative.slice(file.relative.indexOf('.') + 1);
  gutil.log('Change detected in ' + file.relative);
  if (ext === 'less') {
    gulp.start('styles');
  }
  if (ext === 'js') {
    gulp.start('scripts');
  }
  if (ext === 'mu') {
    gulp.start('templates');
  }
}

// Build Tasks
gulp.task('fonts', function () {
  return gulp.src(path.join(config.bsFontsDir, '*'))
    .pipe(gulp.dest(config.buildFontsDir));
});

gulp.task('styles', function () {
  return gulp.src(path.join(config.srcLessDir, '[^_]*.less'))
    .pipe(plumber({errorHandler: gutil.log}))
    .pipe(less({
      paths: [config.srcLessDir, config.bsLessDir],
      compress: true
    }))
    .pipe(gulp.dest(config.buildCssDir));
});

gulp.task('scripts', function () {
  return gulp.src(config.clientJsFiles)
    .pipe(concat('mochawesome.js'))
    .pipe(uglify())
    .pipe(gulp.dest(config.buildJsDir));
});

gulp.task('templates', function () {
  var partials = gulp.src(path.join(config.srcHbsDir, '_*.mu'))
    .pipe(handlebars())
    .pipe(wrap('Handlebars.registerPartial(<%= processPartialName(file.relative) %>, Handlebars.template(<%= contents %>));', {}, {
      imports: {
        processPartialName: function(fileName) {
          // Strip the extension
          // Escape the output with JSON.stringify
          return JSON.stringify(path.basename(fileName, '.js'));
        }
      }
    }));

  var templates = gulp.src(path.join(config.srcHbsDir, '[^_]*.mu'))
    .pipe(handlebars())
    .pipe(wrap('Handlebars.template(<%= contents %>)'))
    .pipe(declare({
      root: 'exports',
      noRedeclare: true, // Avoid duplicate declarations
      processName: function(filePath) {
        return declare.processNameByPath(filePath.replace('src/templates/', ''));
      }
    }));

  var helpers = gulp.src(path.join(config.srcJsDir, 'hbsHelpers.js'));

  return merge(partials, templates, helpers)
    .pipe(concat('templates.js'))
    .pipe(wrap('var Handlebars = require("handlebars");\n <%= contents %>'))
    .pipe(gulp.dest(config.libDir));
});

// Test Tasks
gulp.task('fiveby', function () {
  return gulp.src('test/**/*.js', '!test/test.js')
    .pipe(mocha(options))
    .on('error', console.warn.bind(console));
});

gulp.task('test', function () {
  return gulp.src('test/test.js')
    .pipe(mocha(options))
    .on('error', console.warn.bind(console));
});

// Linting
gulp.task('svrlint', function () {
  return gulp.src(lintPaths.lint)
    .pipe(jshint(lintPaths.server))
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('felint', function () {
  return gulp.src(lintPaths.felint)
    .pipe(jshint(lintPaths.client))
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});

// Watch Tasks
gulp.task('watch', function () {
  watch(watchFiles, onWatchFileChanged);
});

// Default/Combo Tasks
gulp.task('build', ['lint'], function () {
  return gulp.start('assemble');
});

gulp.task('lint', ['svrlint', 'felint']);

gulp.task('assemble', ['fonts', 'styles', 'scripts', 'templates']);

gulp.task('default', ['test']);