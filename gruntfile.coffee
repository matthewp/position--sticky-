module.exports = ->

    @initConfig
        pkg: @file.readJSON 'package.json'

        uglify:
            options:
                mangle: false,      # don't change variable and function names
                sourceMap: false    # don't make a sourcemap

            scripts:
                files:
                    'sticky.min.js': 'sticky.js'

    # load the tasks
    @loadNpmTasks 'grunt-contrib-uglify'