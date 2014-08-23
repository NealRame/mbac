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
            js: ['<%= js_build_dir %>']
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
                        cwd: 'bower_components/foundation-icons/',
                        dest: '<%= fonts_build_dir %>/',
                        expand: true,
                        filter: 'isFile',
                        flatten: true,
                        src: [
                            'foundation_icons_accessibility/fonts/*',
                            'foundation_icons_general/fonts/*',
                            'foundation_icons_general_enclosed/fonts/*',
                            'foundation_icons_social/fonts/*'
                        ],
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
            icons: {
                options: {
                    loadPath: [
                        'bower_components/foundation-icons/foundation_icons_accessibility/sass',
                        'bower_components/foundation-icons/foundation_icons_general_enclosed/sass',
                        'bower_components/foundation-icons/foundation_icons_general/sass',
                        'bower_components/foundation-icons/foundation_icons_social/sass'
                    ],
                    quiet: true,
                    style: 'compressed'
                },
                files: [{
                    expand: true,
                    cwd: 'app/client/scss',
                    src: ['icons/*.scss'],
                    dest: '<%= sass_build_dir %>',
                    ext: '.css'
                }]
            },

            style: {
                options: {
                    loadPath: [
                        'bower_components/foundation/scss'
                    ],
                    style: 'nested'
                },
                files: [{
                    expand: true,
                    cwd: 'app/client/scss',
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
                        'jquery/dist/jquery.js',
                        'react/react.js',
                        'requirejs/require.js',
                        'underscore/underscore.js'
                    ],
                    dest: '<%= js_build_dir %>/vendors'
                }]
            },
            client: {
                files: [{
                    expand: true,
                    cwd: '<%= js_src_dir %>',
                    src: [ '**/*.js' ],
                    dest: '<%= js_build_dir %>',
                    ext: '.min.js',
                    extDot: 'first'
                }]
            }
        },
    });

    ///////////////////////////////////////////////////////////////////////
    // Load tasks plugins

    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-react');

    ///////////////////////////////////////////////////////////////////////
    // Register macro task(s).

    grunt.registerTask(
        'assets',
        ['bower', 'sass:icons', 'copy:fonts', 'uglify:vendors']
    );

    grunt.registerTask(
        'style',
        ['bower', 'sass:style']
    );

    grunt.registerTask(
        'default',
        ['assets', 'style']
    );
}
