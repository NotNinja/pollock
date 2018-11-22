/*
 * Copyright (C) 2018 Alasdair Mercer
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

'use strict';

module.exports = function(grunt) {
  var commonjs = require('rollup-plugin-commonjs');
  var nodeResolve = require('rollup-plugin-node-resolve');
  var uglify = require('rollup-plugin-uglify');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    clean: {
      build: [ 'dist/**' ],
      test: [ 'coverage/' ]
    },

    eslint: {
      target: [
        'src/**/*.js',
        'test/**/*.js'
      ]
    },

    mocha_istanbul: {
      test: {
        options: {
          check: {
            branch: 100,
            functions: 100,
            lines: 100,
            statements: 100
          },
          reportFormats: [
            'html',
            'lcovonly'
          ],
          reporter: 'list'
        },
        src: [ 'test/**/*.spec.js' ]
      }
    },

    rollup: {
      umdDevelopment: {
        options: {
          format: 'umd',
          moduleId: 'pollock',
          moduleName: 'pollock',
          sourceMap: true,
          sourceMapRelativePaths: true,
          plugins: function() {
            return [
              nodeResolve(),
              commonjs()
            ];
          }
        },
        files: {
          'dist/pollock.js': 'src/pollock.js'
        }
      },
      umdProduction: {
        options: {
          format: 'umd',
          moduleId: 'pollock',
          moduleName: 'pollock',
          sourceMap: true,
          sourceMapRelativePaths: true,
          banner: '/*! pollock v<%= pkg.version %> | (C) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %> | <%= pkg.license %> License */',
          plugins: function() {
            return [
              nodeResolve(),
              commonjs(),
              uglify({
                output: {
                  comments: function(node, comment) {
                    return comment.type === 'comment2' && /^\!/.test(comment.value);
                  }
                }
              })
            ];
          }
        },
        files: {
          'dist/pollock.min.js': 'src/pollock.js'
        }
      }
    }
  });

  require('load-grunt-tasks')(grunt);

  grunt.registerTask('default', [ 'ci' ]);
  grunt.registerTask('build', [ 'eslint', 'clean:build', 'rollup' ]);
  grunt.registerTask('ci', [ 'eslint', 'clean', 'rollup', 'mocha_istanbul' ]);
  grunt.registerTask('test', [ 'eslint', 'clean:test', 'mocha_istanbul' ]);
};
