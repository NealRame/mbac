path = require('path');

module.exports = function(grunt) {
    ///////////////////////////////////////////////////////////////////////
    // Configure tasks

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        // assets variables
        assets_dir: 'public',

        // fonts variables
        fonts_dir: '<%= assets_dir %>/fonts',

        // javascript variables
        js_src_dir:   'app/client/js',
        js_lib_dir:   '<%= js_src_dir %>/lib',
        js_build_dir: '<%= assets_dir %>/js',

        // sass variables
        sass_src_dir:   'app/client/sass',
        sass_lib_dir:   '<%= sass_src_dir %>/lib',
        sass_build_dir: '<%= assets_dir %>/css',

        bower: {
            options: {
                cleanBowerDir: true,
                layout: function(type) {return type;},
                targetDir: '.',
                verbose: false,
            },
            install: { }
        },

        clean: {
            fonts: ['<%= fonts_dir %>'],
            js:    ['<%= js_build_dir %>'],
            sass:  ['<%= sass_build_dir %>']
        },

        // react: {
        //     components: {
        //         files: [{
        //             expand: true,
        //             cwd: '<%= js_src_dir %>/views',
        //             src: ['**/*.jsx'],
        //             dest: '<%= js_build_dir %>/views',
        //             ext: '.js'
        //         }]
        //     }
        // },

        sass: {
            dev: {
                options: {
                    includePaths: [
                        '<%= sass_lib_dir %>/foundation/scss',
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

        // uglify: {
        //     options: {
        //         compress: {
        //             sequences: true,
        //             hoist_vars: true
        //         },
        //         output: {
        //             beautify: false,
        //             space_colon: false,
        //             bracketize: true
        //         },
        //         mangle: true,
        //         preserveLicenseComments: true,
        //         warnings: true
        //     },
        //     vendors: {
        //         options: {
        //             drop_console: true
        //         },
        //         files: [{
        //             expand: true,
        //             cwd: '<%= bower_dir %>',
        //             flatten: true,
        //             src: [
        //                 'backbone/backbone.js',
        //                 'foundation/js/foundation.js',
        //                 'foundation/js/foundation/*.js',
        //                 'jquery/dist/jquery.js',
        //                 'modernizr/modernizr.js',
        //                 'react/react.js',
        //                 'requirejs/require.js',
        //                 'underscore/underscore.js'
        //             ],
        //             dest: '<%= js_build_dir %>/vendors',
        //             report: 'min'
        //         }]
        //     },
        //     dev: {
        //         options: {
        //             sourceMap: true,
        //             drop_console: true
        //         },
        //         files: [{
        //             expand: true,
        //             cwd: '<%= js_src_dir %>',
        //             src: [ '**/*.js' ],
        //             dest: '<%= js_build_dir %>'
        //         }]
        //     },
        //     dist: {
        //         files: [{
        //             expand: true,
        //             cwd: '<%= js_src_dir %>',
        //             src: [ '**/*.js' ],
        //             dest: '<%= js_build_dir %>'
        //         }]
        //     }
        // },
    });

    ///////////////////////////////////////////////////////////////////////
    // Load tasks plugins

    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-contrib-clean');
    // grunt.loadNpmTasks('grunt-contrib-uglify');
    // grunt.loadNpmTasks('grunt-react');
    grunt.loadNpmTasks('grunt-sass');

    ///////////////////////////////////////////////////////////////////////
    // Register macro task(s).

    grunt.registerTask(
        'assets-dev',
        ['bower', 'sass:dev', 'uglify:vendors', 'uglify:dev']
    );
    grunt.registerTask(
        'assets-dist',
        ['bower', 'sass:dist', 'uglify:vendors', 'uglify:dist']
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
