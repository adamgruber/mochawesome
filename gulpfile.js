//TODO: feeding in configs, logins, selenium servers, browsers.. tests should do this so they can run in isolation but that's a lot more maintenance...
var gulp = require('gulp');
var mocha = require('gulp-spawn-mocha');
var options = {reporter: 'mochawesome', timeout: 30000, slow: 1, "no-exit": true};


gulp.task('fiveby', function () {
  return gulp.src('test/**/*.js', '!test/test.js')
    .pipe(mocha(options))
    .on("error", console.warn.bind(console));
});

gulp.task('test', function () {
  return gulp.src('test/test.js')
    .pipe(mocha(options))
    .on("error", console.warn.bind(console));
});

gulp.task('default', ['test']);