var gulp = require('gulp'),
  watch = require('gulp-watch'),
  newer = require('gulp-newer'),
  browserSync = require('browser-sync'),
  marked = require('marked'),
  swig = require('gulp-swig'),
  data = require('gulp-data'),
  rename = require('gulp-rename'),
  fm = require('front-matter'),
  fs = require('fs'),
  clone = require('clone');

marked.setOptions({
  gfm: true
});

var defaultTemplate = new Buffer(fs.readFileSync("_static/_layouts/default.html"));
var site_search_index = [];

function contains(a, obj) {
    for (var i = 0; i < a.length; i++) {
        if (a[i] === obj) {
            return true;
        }
    }
    return false;
}

function add_chain_to_headings(tokens) {
  var section_chain = [];

  for (i in tokens) {
    var tok = tokens[i];
    if (tok.type === "heading") {
      // Update Heading Path
      while (section_chain.length >= tok.depth) {
        section_chain.pop()
      };
      if (section_chain.length <= tok.depth) {
        section_chain.push(tok.text)
      };

      tokens[i].chain = clone(section_chain);
    }
  };

  return tokens;
}

function create_anchor_from_chain(chain) {
  return chain.join("-").replace(/[!@#$%^&*()=+<>;:'"\\\/]/g, "")
    .replace(/ /g, "-").toLowerCase();
}

function tokens_to_index(tokens, page, page_title) {
  var excluded_header_terms = ["example", "examples", "request", "requests",
    "response", "responses", "permissions"]

  var section_acc = "";
  var section_hrd = {};
  var first_p;

  for (i in tokens) {
    var tok = tokens[i];

    if (tok.type === "heading") {
      if (!contains(excluded_header_terms, tok.text.toLowerCase())) {
        // Add Last Section to Index (if it exists)
        if(section_hrd.chain !== undefined && section_acc !== ""){
          var md_obj = [first_p];
          md_obj.links = {};

          section_hrd.chain.unshift(page_title);

          site_search_index.push({
            path: page + "#" + create_anchor_from_chain([section_hrd.text]),
            title: section_hrd.chain.join(" -> "),
            body: section_acc,
            preview: marked.parser(md_obj)
          });
        }

        section_hrd = tok;
        section_acc = "";
        first_p = undefined;
      };
    } else if (typeof(tok.text) == "string") {
      section_acc += tok.text + "\n";

      if (first_p === undefined) {
        first_p = tok;
      };
    }
  };
}

function convert_to_final_path(rel_path) {
  var file_re = /(.+\/)?([^\/]+)\.([^\.\n]+)/
  var matches = file_re.exec(rel_path);

  if (matches[1] == undefined) {
    if (matches[2].toUpperCase() === "README") {
      return "/";
    } else {
      return "/" + matches[2] + "/"
    };
  } else {
    if (matches[2].toUpperCase() === "README") {
      return matches[1];
    } else {
      return matches[1] + matches[2] + "/"
    };
  };
}

gulp.task('default', ['md', 'js', 'css', 'img', 'html', 'assets', 'il-img', 'write-search-index']);

gulp.task('write-search-index', ['md'], function() {
  fs.writeFileSync('_site/search_index.json', JSON.stringify(site_search_index), 'utf8');
});

gulp.task('md', function() {
 return gulp.src(['**/*.md', '!node_modules/**'])
    .pipe(data(function(file) {
      var content;
      var body;
      try {
        content = fm(String(file.contents));
        body = content.body
      } catch (e) {
        body = String(file.contents);
        content = {attributes: {}};
      }

      var path = convert_to_final_path(file.path.slice(file.cwd.length));
      var title = content.attributes.title || path.replace(/\//g, " ").trim();

      try {
        content.attributes.body = marked(body);
        file.contents = defaultTemplate;

        var tokens = marked.lexer(body);
        add_chain_to_headings(tokens);
        tokens_to_index(tokens, path, title);
        content.attributes.body = marked.parser(tokens);
      } catch (e) {
        console.error(e)
        throw "Markdown File Can't Be Parsed as Markdown";
      }

      return content.attributes;
    }))
    .pipe(swig({defaults: {autoescape: false}}))
    .pipe(rename(function(path){
      if (path.basename == "README") {
        path.basename = "index";
      } else {
        path.dirname += "/" + path.basename;
        path.basename = "index";
      }
    }))
    .pipe(gulp.dest('_site'));
})

gulp.task('html', function() {
  return gulp.src(['_static/**/*.html', '!_static/_*/**'])
    .pipe(data(function(file) {
      var content;
      var body;
      try {
        content = fm(String(file.contents));
        body = content.body
      } catch (e) {
        body = String(file.contents);
        content = {attributes: {}};
      }

      content.attributes.body = body;
      file.contents = defaultTemplate;

      return content.attributes;
    }))
    .pipe(swig({defaults: {autoescape: false}}))
    .pipe(gulp.dest('_site'));
})

gulp.task('js', function() {
  return gulp.src('_static/assets/**/*.js')
    //.pipe(jshint())
    //.pipe(jshint.reporter('default'))
    //.pipe(uglify())
    //.pipe(concat('app.js'))
    .pipe(gulp.dest('_site/assets'));
});

gulp.task('css', function() {
  return gulp.src('_static/assets/**/*.css')
    //.pipe(concat('app.css'))
    .pipe(gulp.dest('_site/assets'));
});

gulp.task('img', function() {
  return gulp.src(['_static/assets/**/*.png','_static/assets/**/*.jpg'])
    //.pipe(concat('app.css'))
    .pipe(gulp.dest('_site/assets'));
});

gulp.task('il-img', function() {
  return gulp.src(['**/*.png','**/*.jpg', '!_*/**', '!node_modules/**'])
    //.pipe(concat('app.css'))
    .pipe(gulp.dest('_site'));
});

gulp.task('assets', function() {
  return gulp.src(['_static/**/.*', '!_static/_*/**'])
    //.pipe(concat('app.css'))
    .pipe(gulp.dest('_site'));
});

gulp.task('watch', ['default'], function () {
  watch('_static/assets/**/*.css', function () {
    gulp.start('css');
  });
  watch('_static/assets/**/*.js', function () {
    gulp.start('js');
  });
  watch(['_static/**/*.html'], function () {
    gulp.start('html');
  });
  watch(['**/*.png','**/*.jpg', '!_site/**'], function () {
    gulp.start('assets');
  });
  watch(['**/*.md', "_static/_layouts/*.html"], function () {
    gulp.start('md');
  });
  watch(['gulpfile.js'], function () {
    gulp.start('default');
  });
});

gulp.task('serve', ['watch'], function () {
  var files = [
    '_site/**/*.html',
    '_site/**/*.png',
    '_site/assets/**/*.css',
    '_site/assets/**/*.js'
  ];

  browserSync.init(files, {
    server: {
      baseDir: '_site'
    }
  });
});
