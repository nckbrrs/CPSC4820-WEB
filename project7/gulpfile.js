const gulp = require('gulp');
const eslint = require('gulp-eslint');
const webpack = require('webpack');

gulp.task('lint', () => {
    // ESLint ignores files with "node_modules" paths.
    // So, it's best to have gulp ignore the directory as well.
    // Also, Be sure to return the stream from the task;
    // Otherwise, the task may end before the stream has finished.
    return gulp.src(['**/*.js','!node_modules/**'])
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

gulp.task('copy-resources', () => {
    return gulp.src('./src/tictactoe.html')
      .pipe(gulp.dest('./dist/'));
});

gulp.task('build', ['lint'], () => {
    return gulp.src('./src/*.js')
      .pipe(webpack())
      .pipe(gulp.dest('./dist/tictactoe.js'));
});

gulp.task('default', ['lint', 'build', 'copy-resources'], function () {
    // This will only run if the lint task is successful...
});
