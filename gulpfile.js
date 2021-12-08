let projectFolder = require('path').basename(__dirname);
let soursFolder = '#src';

let path = {
  build: {
    html: projectFolder + '/',
    css: projectFolder + '/css/',
    js: projectFolder + '/js/',
    img: projectFolder + '/img/',
    fonts: projectFolder + '/fonts/',
  },
  src: {
    html: soursFolder + '/*.html',
    css: soursFolder + '/scss/style.scss',
    js: soursFolder + '/js/main.js',
    img: soursFolder + '/img/**/*.{jpg,png,svg,gif,ico,webp}',
    fonts: soursFolder + '/fonts/*.ttf',
  },
  watch: {
    html: soursFolder + '/**/*.html',
    css: soursFolder + '/scss/**/*.scss',
    js: soursFolder + '/js/**/*.js',
    img: soursFolder + '/img/**/*.{jpg,png,svg,gif,ico,webp}',
  },
  clean: './' + projectFolder + '/',
};

let { src, dest } = require('gulp'),
  gulp = require('gulp'),
  browsersync = require('browser-sync').create(),
  fileinclude = require('gulp-file-include'),
  del = require('del'),
  scss = require('gulp-sass')(require('sass')),
  autoprefixer = require('gulp-autoprefixer'),
  groupMedia = require('gulp-group-css-media-queries'),
  cleanCss = require('gulp-clean-css'),
  rename = require('gulp-rename'),
  uglify = require('gulp-uglify-es').default,
  imagemin = require('gulp-imagemin'),
  ttf2woff =    require('gulp-ttf2woff'),
  ttf2woff2 =   require('gulp-ttf2woff2');

function browserSync(params) {
  browsersync.init({
    server: {
      baseDir: './' + projectFolder + '/',
    },
    port: 3000,
    notify: false,
  });
}


function fonts(){
  src(path.src.fonts)
  .pipe(ttf2woff())
  .pipe(dest(path.build.fonts));
  return src(path.src.fonts)
  .pipe(ttf2woff2())
  .pipe(dest(path.build.fonts))
}
function watchFiles(params) {
  gulp.watch([path.watch.html], html);
  gulp.watch([path.watch.css], css);
  gulp.watch([path.watch.js], js);
  gulp.watch([path.watch.img], images);
}
function html() {
  return src(path.src.html)
    .pipe(fileinclude())
    .pipe(dest(path.build.html))
    .pipe(browsersync.stream());
}
function images() {
  return src(path.src.img)
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.mozjpeg({ quality: 75, progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
        }),
      ])
    )
    .pipe(dest(path.build.img))
    .pipe(browsersync.stream());
}

function js() {
  return src(path.src.js)
    .pipe(fileinclude())
    .pipe(dest(path.build.js))
    .pipe(uglify())
    .pipe(
      rename({
        extname: '.min.js',
      })
    )
    .pipe(dest(path.build.js))
    .pipe(browsersync.stream());
}

function clean(params) {
  return del(path.clean);
}
function css() {
  return src(path.src.css)
    .pipe(
      scss({
        outputStyle: 'expanded',
      })
    )
    .pipe(groupMedia())
    .pipe(
      autoprefixer({
        overrideBrowserlist: ['last 5 version'],
        cascade: true,
      })
    )
    .pipe(dest(path.build.css))
    .pipe(cleanCss())
    .pipe(
      rename({
        extname: '.min.css',
      })
    )
    .pipe(dest(path.build.css))
    .pipe(cleanCss())

    .pipe(browsersync.stream());
}

let build = gulp.series(clean, gulp.parallel(js, css, html, images,fonts));
let watch = gulp.parallel(build, watchFiles, browserSync);

exports.fonts=fonts;
exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;
