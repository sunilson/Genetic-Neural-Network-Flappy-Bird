var gulp = require('gulp');
var gutil = require('gulp-util');
var surge = require('gulp-surge')
var concat = require('gulp-concat');
var rename = require('gulp-rename');
let uglify = require('gulp-uglify-es').default;

// create a default task and just log a message
gulp.task('default', function () {
    return gutil.log('Gulp is running!')
});

var jsDest = 'build';
var src = [
    "js/lib/*.js",
    "js/core/neural_network.js",
    "js/sprites/bird.js",
    "js/core/genetic_algorithm.js",
    "js/util.js",
    "js/states/menuState.js",
    "js/states/mainState.js",
    "js/main.js"
]

gulp.task('scripts', function () {
    return gulp.src(src)
        .pipe(concat('scripts.js'))
        .pipe(rename('scripts.min.js'))
        .pipe(uglify().on('error', function (e) {
            console.log(e);
        }))
        .pipe(gulp.dest(jsDest));
});

gulp.task('deploy', ['scripts'], function () {
    return surge({
        project: './build', // Path to your static build directory
        domain: 'narrow-cake.surge.sh' // Your domain or Surge subdomain
    })
})