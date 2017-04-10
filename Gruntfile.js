module.exports = function(grunt) {
    grunt.initConfig({
        ts: {
            default : {
                tsconfig: true
            }
        },
        copy: {
            example: {
                files: [
                    {
                        expand: true,
                        cwd: "src",
                        src: ["example/**/*.html", "example/**/*.js", "example/**/*.json"],
                        dest: "build/"
                    }
                ]
            }
        },
        clean: {
            build: {
                src: ['build/']
            }
        }
    });
    grunt.loadNpmTasks("grunt-ts");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask("default", ["clean", "ts", "copy"]);
};
