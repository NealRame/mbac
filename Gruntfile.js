/* eslint-env node*/
/* eslint-disable strict*/
module.exports = function(grunt) {
    ///////////////////////////////////////////////////////////////////////
    // Configure tasks

    var isDev = function() {
        switch (process.env.NODE_ENV) {
        case 'development':
        case 'dev':
            return true;
        default:
            return false;
        }
    };

    var isProd = function() {
        return !isDev();
    };

    var requirejs_log_level = function() {
        if (process.env.REQUIRE_JS_LOG_LEVEL != null) {
            return process.env.REQUIRE_JS_LOG_LEVEL;
        }
        return 4;
    }

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
                layout: function(type) { return type; },
                targetDir: '.',
                verbose: false
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
                    modules: [
                        {
                            name: 'common',
                            include: [
                                'backbone',
                                'foundation',
                                'jquery',
                                'marked',
                                'marionette',
                                'promise',
                                'underscore'
                            ]
                        },
                        {
                            name: 'analytics/main',
                            exclude: ['common']
                        },
                        {
                            name: 'stickyfooter/main',
                            exclude: ['common']
                        },
                        {
                            name: 'pages/achievements/back/main',
                            exclude: ['common']
                        },
                        {
                            name: 'pages/achievements/front/achievement-list/main',
                            exclude: ['common']
                        },
                        {
                            name: 'pages/achievements/front/achievement/main',
                            exclude: ['common']
                        },
                        {
                            name: 'pages/contact/main',
                            exclude: ['common']
                        },
                        {
                            name: 'pages/home/main-back',
                            exclude: ['common']
                        },
                        {
                            name: 'pages/home/main-front',
                            exclude: ['common']
                        },
                        {
                            name: 'pages/logs/main',
                            exclude: ['common']
                        },
                        {
                            name: 'pages/mbac/main',
                            exclude: ['common']
                        },
                        {
                            name: 'pages/plan/main',
                            exclude: ['common']
                        },
                        {
                            name: 'pages/products/front/product/main',
                            exclude: ['common']
                        },
                        {
                            name: 'pages/products/front/product-list/main',
                            exclude: ['common']
                        },
                        {
                            name: 'pages/products/front/reseller/main',
                            exclude: ['common']
                        },
                        {
                            name: 'pages/products/back/main',
                            exclude: ['common']
                        }
                    ],
                    logLevel: requirejs_log_level()
                }
            }
        },

        sass: {
            compile: {
                options: {
                    includePaths: [
                        '<%= sass_libs_dir %>',
                        '<%= sass_libs_dir %>/foundation',
                        '<%= sass_libs_dir %>/font-awesome'
                    ],
                    outputStyle: isDev() ? 'nested' : 'compressed',
                    sourceMap: isDev()
                },
                files: [{
                    expand: true,
                    cwd: '<%= sass_srcs_dir %>',
                    src: [
                        'style.scss',
                        'admin_style.scss',
                        'pages/achievements/admin_style.scss',
                        'pages/achievements/style.scss',
                        'pages/contact/style.scss',
                        'pages/home/admin_style.scss',
                        'pages/home/style.scss',
                        'pages/logs/admin_style.scss',
                        'pages/mbac/style.scss',
                        'pages/plan/style.scss',
                        'pages/prices/style.scss',
                        'pages/products/admin_style.scss',
                        'pages/products/style.scss',
                        'pages/services/style.scss'
                    ],
                    dest: '<%= sass_build_dir %>',
                    ext: '.css'
                }]
            }
        },

        watch: {
            sass: {
                files: [
                    '<%= sass_srcs_dir %>/**/*.scss',
                    '<%= sass_srcs_dir %>/**/*.sass'
                ],
                tasks: ['sass'],
                options: {
                    spawn: true
                }
            },
            requirejs: {
                files: [
                    '<%= js_srcs_dir %>/**/*.js',
                    '<%= js_srcs_dir %>/**/*.html'
                ],
                tasks: ['clean:js', 'requirejs'],
                options: {
                    spawn: true
                }
            }
        }

    });

    ///////////////////////////////////////////////////////////////////////
    // Load tasks plugins

    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-notify');
    grunt.loadNpmTasks('grunt-sass');

    ///////////////////////////////////////////////////////////////////////
    // Register macro task(s).

    grunt.registerTask('default', ['clean', 'bower', 'requirejs', 'sass']);
};
