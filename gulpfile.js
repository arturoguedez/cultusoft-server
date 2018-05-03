'use strict';
// https://github.com/gulpjs/gulp/tree/v3.9.1/docs/recipes

const gulp = require('gulp');
const eslint = require('gulp-eslint');
const mocha = require('gulp-mocha');
const ts = require('gulp-typescript');
const nodemon = require('gulp-nodemon');
const run = require('gulp-run-command').default;
const clean = require('gulp-clean');

const tsProject = ts.createProject('tsconfig.json', {
    declaration: true
});

const tsTestProject = ts.createProject('tsconfig.json', {
    declaration: true
});

// fetch command line arguments
const arg = ((argList) => {
    let arg = {}, a, opt, thisOpt, curOpt;
    for (a = 0; a < argList.length; a += 1) {
        thisOpt = argList[a].trim();
        opt = thisOpt.replace(/^\-+/, '');

        if (opt === thisOpt) {
            // argument value
            if (curOpt) {
                arg[curOpt] = opt;
            }
            curOpt = null;
        } else {
            // argument name
            curOpt = opt;
            arg[curOpt] = true;
        }
    }
    return arg;
})(process.argv);

gulp.task('lint', () => {
    // ESLint ignores files with "node_modules" paths.
    // So, it's best to have gulp ignore the directory as well.
    // Also, Be sure to return the stream from the task;
    // Otherwise, the task may end before the stream has finished.
    return gulp.src(['src/**/*.ts', '!node_modules/**'])
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

// Runs all the test, doing validation for code coverage.
gulp.task('code-coverage', ['test-scripts'],
    run("nyc --check-coverage --lines 95 --functions 95 --branches 95 mocha --require co-mocha 'dist-test/**/*.spec.js'",
        {
            env: {
                NODE_ENV: 'test'
            }
        }
    )
);

// Runs all the tests, or a single one (if --spec is passed in) without code coverage
gulp.task('test', ['test-scripts'],  () => {
    process.env.NODE_ENV = 'test';
    let defaultTests = ['dist-test/**/*.spec.js'];
    let tests;

    if (arg.spec) {
        tests = ['dist-test/' + arg.spec + '.spec.js'];
    } else {
        tests = defaultTests;
    }

    return gulp.src(tests, {read: false})
            .pipe(mocha({reporter: 'spec', exit: true}))
            .on('error', console.error);
});

gulp.task('default', ['lint', 'scripts', 'test'], () => {
    // This will only run if the lint task is successful...
});

gulp.task('test-scripts', ['clean-test-scripts', 'test-copy-files'], () => {
    return gulp.src(['src/**/*.ts'])
        .pipe(tsTestProject())
        .pipe(gulp.dest('dist-test'));
});

gulp.task('test-copy-files', ['clean-test-scripts'], () => {
    return gulp.src(['src/**/*.json', 'config/*.json'])
      .pipe(gulp.dest('dist'));
});

gulp.task('copy-files', ['clean-scripts'], () => {
    return gulp.src(['src/**/*.json', 'config/*.json'])
      .pipe(gulp.dest('dist'));
});

gulp.task('clean-test-scripts', function () {
  return gulp.src('dist-test', {read: false})
    .pipe(clean());
});

gulp.task('clean-scripts', function () {
  return gulp.src('dist', {read: false})
    .pipe(clean());
});

gulp.task('scripts', ['clean-scripts', 'copy-files'], () => {
    return gulp.src(['src/**/*.ts','!src/**/*.spec.ts'])
        .pipe(tsProject())
        .pipe(gulp.dest('dist'));
});

gulp.task('watch', ['scripts'], () => {
    return gulp.watch(['src/**/*.ts', '!src/**/*.spec.js'], ['scripts']);
});

gulp.task('dev', ['scripts', 'watch'], () => {
    process.env.NODE_ENV = 'development';
    return nodemon({
            script: 'dist/index.js',
            watch: ['dist'],
            ignore: ['dist/**/*.spec.js', 'dist/**/*.d.ts'],
            env: { 'NODE_ENV': 'development' }
        });
})
