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
    config      = require('./lib/config')();

var mochaOpts = {
  reporter: path.join(__dirname, 'lib', 'mochawesome'),
  timeout: 30000,
  slow: 1,
  'no-exit': true
};

var watchFiles = [
  path.join(config.srcLessDir, '*.less'),
  path.join(config.srcJsDir, '*.js'),
  path.join('!', config.srcJsDir, 'hbsHelpers.js'),
  path.join(config.srcHbsDir, '*.mu')
];

var testPaths = {
  basic: ['./test/test.js'],
  fiveby: [
    './test/fiveby/*.js',
    './test/fiveby/**/*.js'
  ]
};

var lintPaths =  {
  server: './.jshintrc',
  client: './client.jshintrc',
  lint: [
    './lib/*.js',
    '!./lib/templates.js'
  ],
  felint: [
    path.join(config.srcJsDir, '*.js'),
    path.join('!', config.srcJsDir, 'lodash.custom.js')
  ]
};

function onWatchFileChanged(file) {
  var ext = file.path.slice(file.path.lastIndexOf('.') + 1);
  gutil.log(gutil.colors.yellow('Change detected in ' + file.path.replace(file.cwd, '')));
  if (ext === 'less') {
    return gulp.start('styles');
  }
  if (ext === 'js') {
    return gulp.start('clientScripts');
  }
  if (ext === 'mu') {
    return gulp.start('templates');
  }
}

// Build Tasks
gulp.task('fonts', function () {
  return gulp.src(path.join(config.srcFontsDir, '*'))
    .pipe(gulp.dest(config.buildFontsDir));
});

gulp.task('styles', function () {
  return gulp.src(path.join(config.srcLessDir, '[^_]*.less'))
    .pipe(plumber({errorHandler: gutil.log}))
    .pipe(less({
      paths: [config.srcLessDir, config.bsLessDir, config.faLessDir],
      compress: true
    }))
    .pipe(plumber({errorHandler: gutil.log}))
    .pipe(gulp.dest(config.buildCssDir));
});


gulp.task('vendorScripts', function () {
  return gulp.src(config.vendorJsFiles)
    .pipe(concat('vendor.js'))
    .pipe(uglify())
    .pipe(gulp.dest(config.buildJsDir));
});

gulp.task('clientScripts', ['lint'], function () {
  return gulp.src(config.clientJsFiles)
    .pipe(concat('mochawesome.js'))
    .pipe(uglify())
    .pipe(gulp.dest(config.buildJsDir));
});

gulp.task('templates', function () {
  var partials = gulp.src(path.join(config.srcHbsDir, '_*.mu'))
    .pipe(handlebars({
      handlebars: require('handlebars')
    }))
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

// Test Tasks
gulp.task('fiveby', function () {
  return gulp.src(testPaths.fiveby)
    .pipe(mocha(mochaOpts))
    .on('error', console.warn.bind(console));
});

gulp.task('test', function () {
  return gulp.src(testPaths.basic)
    .pipe(mocha(mochaOpts))
    .on('error', console.warn.bind(console));
});

// Default/Combo Tasks
gulp.task('build', ['lint'], function () {
  return gulp.start('assemble');
});

gulp.task('lint', ['svrlint', 'felint']);

gulp.task('assemble', ['fonts', 'styles', 'clientScripts', 'vendorScripts', 'templates']);

gulp.task('default', ['test']);