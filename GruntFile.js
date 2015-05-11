module.exports = function(grunt){
    //require dependency
    require("load-grunt-tasks")(grunt);

    var vars = {
        src:"app",
        dist:"dist",
        test:"test",
        pkg:grunt.file.readJSON("package.json")
    };

    grunt.initConfig({
        vars:vars,
        wiredep:{
            options:{
                fileTypes:{
                    html: {
                        block: /(([ \t]*)<!--\s*bower:*(\S*)\s*-->)(\n|\r|.)*?(<!--\s*endbower\s*-->)/gi,
                        detect: {
                            js: /<script.*src=['"]([^'"]+)/gi,
                            css: /<link.*href=['"]([^'"]+)/gi
                        },
                        replace: {
                            js: '<script src="/{{filePath}}"></script>',
                            css: '<link rel="stylesheet" href="/{{filePath}}" />'
                        }
                    }
                }
            },
            app: {
                ignorePath: /^\/|(\.\.\/)*/,
                src: ['<%= vars.test %>/**/*.html']
            }
        },
        clean:{
            dist:'<%= vars.dist%>',
            test:'<%= vars.test%>/css'
        },
        less:{
            dist:{
                expand:true,
                cwd:'<%= vars.src%>/less',
                src:'*.less',
                dest:'<%= vars.dist%>/css/',
                ext:".css"
            },
            test:{
                expand:true,
                cwd:'<%= vars.src%>/less',
                src:'*.less',
                dest:'<%= vars.test%>/css/',
                ext:".css"
            }
        },
        jshint:{
            js:["<%= vars.src%>/js/*.js","GruntFile.js"]
        },
        uglify:{
            js:{
                files:{
                    "<%= vars.dist%>/js/<%= vars.pkg.name%>.min.js":"<%= vars.src%>/js/*.js"
                }
            }
        },
        watch:{
            bower:{
                files:["bower.json"],
                tasks:["wiredep"]
            },
            less:{
                files:["<%= vars.src%>/less/*.less"],
                tasks:["less"]
            },
            js:{
                files:["<%= vars.src%>/js/*.js","Gruntfile.js"],
                tasks:["jshint","uglify"],
                options:{
                    livereload:true
                }
            },
            livereload:{
                options: {
                    livereload: '<%= connect.options.livereload %>'
                },
                files:[
                    "<%= vars.test%>/css/*.css",
                    "<%= vars.test%>/images/*.*"
                ]
            }
        },
        connect: {
            options: {
                port: 9000,
                open: true,
                livereload: 35729,
                hostname: 'localhost'
            },
            test: {
                options: {
                    base: '<%= config.test %>'
                }
            }
        }
    });

    grunt.registerTask("serve",function(target){
        grunt.task.run([
            "clean:test",
            "less:test",
            "wiredep",
            "jshint",
            "connect:test",
            "watch"
        ]);
    });

    grunt.registerTask("build",[
        "clean",
        "less:dist",
        "uglify"
    ]);
};
