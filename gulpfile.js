'use strict';

var gulp         = require('gulp');
var autoprefixer = require('gulp-autoprefixer');
var babel        = require('gulp-babel');
var browserSync  = require('browser-sync');
var concat       = require('gulp-concat');
var eslint       = require('gulp-eslint');
var filter       = require('gulp-filter');
var newer        = require('gulp-newer');
var notify       = require('gulp-notify');
var plumber      = require('gulp-plumber');
var reload       = browserSync.reload;
var sass         = require('gulp-sass');
var sourcemaps   = require('gulp-sourcemaps');
var gutil        = require('gulp-util');
var mocha        = require('gulp-mocha');

var onError = function(err) {
  notify.onError({
    title:    "Error",
    message:  "<%= error %>",
  })(err);
  this.emit('end');
};

var plumberOptions = {
  errorHandler: onError,
};

var jsFiles = {
  vendor: [

  ],
  source: [
    'node_modules/randomcolor/randomColor.js',
    'src/themes/*.jsx',
    'src/*/*.jsx',
    'src/main.jsx',
  ],
  test: [
    'src/test.jsx',
    'node_modules/randomcolor/randomColor.js',
    'src/*/*.jsx',
  ]
};

// Lint JS/JSX files
// gulp.task('eslint', function() {
//   return gulp.src(jsFiles.source)
//     .pipe(eslint.format())
//     .pipe(eslint.failAfterError());
// });

// Copy react.js and react-dom.js
// only if the copy in node_modules is "newer"
gulp.task('copy-react', function() {
  return gulp.src('node_modules/react/dist/react.js')
    .pipe(newer('vendor/react.js'))
    .pipe(gulp.dest('vendor'));
});
gulp.task('copy-react-dom', function() {
  return gulp.src('node_modules/react-dom/dist/react-dom.js')
    .pipe(newer('vendor/react-dom.js'))
    .pipe(gulp.dest('vendor'));
});

// Concatenate jsFiles.vendor and jsFiles.source into one JS file.
// Run copy-react and eslint before concatenating
gulp.task('concat', ['copy-react', 'copy-react-dom'], function() {
  return gulp.src(jsFiles.vendor.concat(jsFiles.source))
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ["react"],
    }))
    .on('error', function swallowError (error) {
        // If you want details of the error in the console
        console.log(error.toString())
        this.emit('end')
      })
    .pipe(concat('app.js'))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('dist'));
});

gulp.task('concat-test', function() {
  return gulp.src(jsFiles.vendor.concat(jsFiles.test))
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ["react"],
    }))
    .on('error', function swallowError (error) {
        this.emit('end')
      })
    .pipe(concat('app.js'))
    .pipe(gulp.dest('dist/test'));
});

// Run mocha tests
gulp.task('mocha', ['concat-test'], function() {
  return gulp.src(['test/*.js'], { read: false })
    .pipe(mocha({
      reporter: 'list',
      compilers: {
        js: 'babel-register'
      },
      use_strict: true,
      useStrict: true,
      'use-strict': true
    }))
    .on('error', gutil.log);
});

// Compile Sass to CSS
gulp.task('sass', function() {
  var autoprefixerOptions = {
    browsers: ['last 2 versions'],
  };

  var filterOptions = '**/*.css';

  var reloadOptions = {
    stream: true,
  };

  var sassOptions = {
    includePaths: [

    ]
  };

  return gulp.src(['vendor/bootstrap.min.css', 'src/**/*.scss'])
    .pipe(plumber(plumberOptions))
    .pipe(sourcemaps.init())
    .pipe(sass(sassOptions))
    .pipe(autoprefixer(autoprefixerOptions))
    .pipe(concat('main.css'))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('dist'))
    .pipe(filter(filterOptions))
    .pipe(reload(reloadOptions));
});

// Watch JS/JSX and Sass files
gulp.task('watch', function() {
  gulp.watch('src/**/*.{js,jsx}', ['concat']);
  gulp.watch('src/**/*.scss', ['sass']);
});

// BrowserSync
gulp.task('browsersync', function() {
  browserSync({
    port: 8080,
    ui: {
      port: 8081,
    },
    server: {
      baseDir: './'
    },
    open: false,
    online: false,
    notify: false,
  });
});

gulp.task('build', ['sass', 'concat']);
gulp.task('default', ['build', 'browsersync', 'watch']);
