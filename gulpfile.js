/* Gulpfile for repository d3.js template 

Reference: https://css-tricks.com/gulp-for-beginners/
*/

/* NODE MODULES */
var gulp = require('gulp');
var runSequence = require('run-sequence');
var gulpIf = require('gulp-if');

var browserSync = require('browser-sync').create();

var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var cssnano = require('gulp-cssnano');
var del = require('del');

/* PRIMARY GULP TASKS */
// turn on development environemnt
gulp.task('default', function(callback){
    runSequence(['browserSync', 'watch'],
        callback
    );
});

// Build /app -> /dist
gulp.task('build', function(callback){
    runSequence('clean:dist',
        ['concat', 'images'],
        callback
    );
});

/* HELPER FUNCTIONS */
// Listens for file changes, reloads on save
gulp.task('watch', ['browserSync'], function(){
    gulp.watch('app/*.html', browserSync.reload);
    gulp.watch('app/css/**/*.css', browserSync.reload);
    gulp.watch('app/js/**/*.js', browserSync.reload);
    gulp.watch('app/data/**/*.*', browserSync.reload);
    gulp.watch('app/images/**/*.*',browserSync.reload);
});

// Sets up development server
gulp.task('browserSync', function(){
    browserSync.init({
        server: {
            baseDir: 'app'
        },
    });
});

// concats js and css files (ignores inline js/css)
gulp.task('concat', function(){
    return gulp.src('app/*.html')
        .pipe(useref())
        // .pipe(gulpIf('*.js', uglify()))
        .pipe(gulpIf('*.css', cssnano()))
        .pipe(gulp.dest('dist'));
});

// Image handling (just pass-through now)
gulp.task('images', function(){
    return gulp.src('app/images/**/*.+(png|jpg|jpeg|gif|svg)')
        .pipe(gulp.dest('dist/images'));
});

// Cleans dist folder
gulp.task('clean:dist', function() {
    return del.sync('dist');
});
