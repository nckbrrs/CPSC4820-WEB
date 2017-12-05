const gulp = require('gulp');
const eslint = require('gulp-eslint');
const webpack = require('webpack-stream');

gulp.task('lint', () => {
    return gulp.src(['./src/*.js','!node_modules/**'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('copy-resources', () => {
    return gulp.src('./src/tictactoe.html')
      .pipe(gulp.dest('./dist/'));
});

gulp.task('build', ['lint'], () => {
    return gulp.src('./src/*.js')
      .pipe(webpack(require('./webpack.config.js')))
      .pipe(gulp.dest('./dist/'));
});

gulp.task('default', ['lint', 'build', 'copy-resources'], function () {
  // :)
});
