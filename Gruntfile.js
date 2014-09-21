path = require('path');

module.exports = function(grunt) {
    ///////////////////////////////////////////////////////////////////////
    // Configure tasks

    var isDev = function() {
        switch (process.env['NODE_ENV']) {
        case 'development':
        case 'dev':
            return true;
        default:
            return false;
        }
    };

    var isProd = function() {
        return ! isDev();
    };

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        // assets variables
        assets_dir: 'public',

        // fonts variables
        fonts_dir: '<%= assets_dir %>/fonts',

        // client app directory
        client_app_dir: 'app/client',

        // javascript variables
        js_srcs_dir:  '<%= client_app_dir %>/js',
        js_libs_dir:  '<%= js_srcs_dir %>/libs',
        js_build_dir: '<%= assets_dir %>/js',

        // sass variables
        sass_srcs_dir:  '<%= client_app_dir %>/sass',
        sass_libs_dir:  '<%= sass_srcs_dir %>/libs',
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
            'fonts':     ['<%= fonts_dir %>'],
            'js':        ['<%= js_build_dir %>'],
            'js-libs':   ['<%= js_libs_dir %>'],
            'sass':      ['<%= sass_build_dir %>'],
            'sass-libs': ['<%= sass_libs_dir %>']
        },

        // react: {
        //     components: {
        //         files: [{
        //             expand: true,
        //             cwd: '<%= js_srcs_dir %>/views',
        //             src: ['**/*.jsx'],
        //             dest: '<%= js_build_dir %>/views',
        //             ext: '.js'
        //         }]
        //     }
        // },

        sass: {
            compile: {
                options: {
                    includePaths: ['<%= sass_libs_dir %>'],
                    outputStyle: isDev() ? 'nested' : 'compressed',
                    sourceMap: isDev()
                },
                files: [{
                    expand: true,
                    cwd: '<%= sass_srcs_dir %>',
                    src: ['style.scss'],
                    dest: '<%= sass_build_dir %>',
                    ext: '.css'
                }]
            },
        },

        requirejs: {
            compile: {
                options: {
                    appDir: '<%= js_srcs_dir %>',
                    dir: '<%= js_build_dir %>',
                    mainConfigFile: '<%= js_srcs_dir %>/common.js',
                    optimize: 'uglify2',
                    generateSourceMaps: isDev(),
                    preserveLicenseComments: isProd(),
                    useSourceUrl: isDev(),
                    modules: [
                        {
                            name: '../common',
                            include: ['jquery', 'foundation']
                        },
                        {
                            name: 'app/main',
                            exclude: ['../common']
                        }
                    ]
                }
            }
        },

        uglify: {
            options: {
                compress: {
                    sequences: true,
                    hoist_vars: true
                },
                drop_console: isProd(),
                output: {
                    beautify: false,
                    space_colon: false,
                    bracketize: true
                },
                mangle: true,
                preserveLicenseComments: true,
                warnings: true
            },
            compile: {
                files: [{
                    cwd: '<%= js_libs_dir %>',
                    dest: '<%= js_build_dir %>/libs',
                    expand: true,
                    flatten: true,
                    report: 'min',
                    src: ['require.js']
                }]
            }
        }

    });

    ///////////////////////////////////////////////////////////////////////
    // Load tasks plugins

    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    // grunt.loadNpmTasks('grunt-react');
    grunt.loadNpmTasks('grunt-sass');

    ///////////////////////////////////////////////////////////////////////
    // Register macro task(s).

    grunt.registerTask('assets-dev',  ['bower', 'sass:dev']);
    grunt.registerTask('assets-dist', ['bower', 'sass:dist']);
    grunt.registerTask('dev',         ['assets-dev']);
    grunt.registerTask('dist',        ['assets-dist']);
    grunt.registerTask('default',     ['dist']);
}
