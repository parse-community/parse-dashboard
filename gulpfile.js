var gulp = require('gulp');
var webpack = require('webpack');
var webpackConfig = require("./webpack/production.config");

var dist = './dist/Parse-Dashboard';
var bundlesDir = './production/bundles';

gulp.task('webpack', function(callback) {
  // run webpack
  webpack(webpackConfig, function(err, stats) {
    if(err) throw new gutil.PluginError('webpack', err);
    callback();
  });
});

gulp.task('bundles', ['webpack'], function(){
  gulp.src([bundlesDir + '/dashboard.bundle.js', bundlesDir + '/sprites.svg'])
    .pipe(gulp.dest(dist + '/public/bundles/'));
})

gulp.task('static', ['bundles'], function() {
  gulp.src(['./Parse-Dashboard/**/*', // all files
            '!./Parse-Dashboard/*.json',  // but the config
            '!./Parse-Dashboard/public/bundles/*']) // but the bundles
    .pipe(gulp.dest(dist));
});

gulp.task('default', ['static', 'bundles']);
