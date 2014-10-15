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

        requirejs: {
            compile: {
                options: {
                    appDir: '<%= client_app_dir %>',
                    mainConfigFile: '<%= js_srcs_dir %>/common.js',
                    baseUrl: './js',
                    dir: '<%= assets_dir %>',

                    keepBuildDir: true,
                    removeCombined: isProd(),

                    optimize: 'uglify2',
                    generateSourceMaps: isDev(),
                    preserveLicenseComments: isProd(),
                    useSourceUrl: isDev(),
                    paths: {

                    },
                    modules: [
                        {
                            name: 'common',
                            include: ['jquery', 'foundation']
                        },
                        {
                            name: 'app/main',
                            exclude: ['common']
                        }
                    ],
                    logLevel: 4
                }
            }
        },

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

        watch: {
            sass: {
                files: [
                    '<%= sass_srcs_dir %>/**/*.scss',
                    '<%= sass_srcs_dir %>/**/*.sass'
                ],
                tasks: ['sass'],
                options: {
                    spawn: false,
                },
            },
        }

    });

    ///////////////////////////////////////////////////////////////////////
    // Load tasks plugins

    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-contrib-clean');
    // grunt.loadNpmTasks('grunt-react');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-sass');

    ///////////////////////////////////////////////////////////////////////
    // Register macro task(s).

    grunt.registerTask('default', ['clean', 'bower', 'requirejs', 'sass']);
}
