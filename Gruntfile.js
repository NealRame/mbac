path = require('path');

module.exports = function(grunt) {
    ///////////////////////////////////////////////////////////////////////
    // Configure tasks

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        // assets variables
        assets_dir: 'public',

        // bower variables
        bower_dir: 'bower_components',

        // javascript variables
        js_build_dir: 'public/js',
        js_src_dir: 'app/client/js',

        // sass variables
        sass_build_dir: 'public/css',
        sass_src_dir: 'app/client/scss',

        // fonts variables
        fonts_build_dir: '<%= assets_dir %>/fonts',

        clean: {
            bower: ['<%= bower_dir %>'],
            fonts: ['<%= fonts_build_dir %>'],
            js: ['<%= js_build_dir %>'],
            style: ['<%= sass_build_dir %>']
        },

        bower: {
            options: {
                verbose: true,
                copy: false
            },
            install: {
            }
        },

        copy: {
            fonts: {
                files: [
                    {
                        cwd: '<%= bower_dir %>/font-awesome',
                        dest: '<%= fonts_build_dir %>/',
                        expand: true,
                        filter: 'isFile',
                        flatten: true,
                        src: ['fonts/*'],
                    },
                    {
                        cwd: '<%= bower_dir %>/monosocialiconsfont',
                        dest: '<%= fonts_build_dir %>/',
                        expand: true,
                        filter: 'isFile',
                        flatten: true,
                        src: ['MonoSocialIconsFont-1.10.*'],
                    }
                ]
            }
        },

        react: {
            components: {
                files: [{
                    expand: true,
                    cwd: '<%= js_src_dir %>/views',
                    src: ['**/*.jsx'],
                    dest: '<%= js_build_dir %>/views',
                    ext: '.js'
                }]
            }
        },

        sass: {
            dev: {
                options: {
                    includePaths: [
                        '<%= bower_dir %>/foundation/scss',
                        '<%= bower_dir %>/font-awesome/scss'
                    ],
                    outputStyle: 'nested',
                    sourceMap: true
                },
                files: [{
                    expand: true,
                    cwd: '<%= sass_src_dir %>',
                    src: ['style.scss'],
                    dest: '<%= sass_build_dir %>',
                    ext: '.css'
                }]
            },
            dist: {
                options: {
                    includePaths: [
                        '<%= bower_dir %>/foundation/scss',
                        '<%= bower_dir %>/font-awesome/scss'
                    ],
                    outputStyle: 'compressed'
                },
                files: [{
                    expand: true,
                    cwd: '<%= sass_src_dir %>',
                    src: ['style.scss'],
                    dest: '<%= sass_build_dir %>',
                    ext: '.css'
                }]
            },
        },

        uglify: {
            options: {
                compress: {
                    sequences: true,
                    hoist_vars: true,
                    drop_console: true
                },
                output: {
                    beautify: false,
                    space_colon: false,
                    bracketize: true
                },
                mangle: true,
                preserveLicenseComments: true,
                warnings: true
            },
            vendors: {
                files: [{
                    expand: true,
                    cwd: '<%= bower_dir %>',
                    flatten: true,
                    src: [
                        'backbone/backbone.js',
                        'foundation/js/foundation.js',
                        'foundation/js/foundation/*.js',
                        'jquery/dist/jquery.js',
                        'modernizr/modernizr.js',
                        'react/react.js',
                        'requirejs/require.js',
                        'underscore/underscore.js'
                    ],
                    dest: '<%= js_build_dir %>/vendors',
                    report: 'min'
                }]
            },
            dev: {
                options: {
                    sourceMap: true
                },
                files: [{
                    expand: true,
                    cwd: '<%= js_src_dir %>',
                    src: [ '**/*.js' ],
                    dest: '<%= js_build_dir %>'
                }]
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= js_src_dir %>',
                    src: [ '**/*.js' ],
                    dest: '<%= js_build_dir %>'
                }]
            }
        },
    });

    ///////////////////////////////////////////////////////////////////////
    // Load tasks plugins

    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-react');
    grunt.loadNpmTasks('grunt-sass');

    ///////////////////////////////////////////////////////////////////////
    // Register macro task(s).

    grunt.registerTask(
        'assets-dev',
        ['bower', 'sass:dev',  'copy:fonts', 'uglify:vendors', 'uglify:dev']
    );
    grunt.registerTask(
        'assets-dist',
        ['bower', 'sass:dist', 'copy:fonts', 'uglify:vendors', 'uglify:dist']
    );

    grunt.registerTask(
        'dev',
        ['assets-dev']
    );
    grunt.registerTask(
        'dist',
        ['assets-dist']
    );

    grunt.registerTask(
        'default',
        ['dist']
    );
}
