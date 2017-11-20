/*
 * This file is part of the conga module.
 *
 * (c) Marc Roulias <marc@lampjunkie.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const path = require('path');
const spawn = require('child_process').spawn;

const AbstractCommand = require('@conga/framework').command.AbstractCommand;

const fs = require('fs-extra');
const git = require('simple-git');

/**
 * This command will start up the current application in watch mode for development
 * and is pretty much just a proxy to the "npm watch" script defined in the
 * project's package.json file
 *
 * $ conga create:project myproject
 */
module.exports = class CreateProjectCommand extends AbstractCommand {

    /**
     * The command
     *
     * @return {String}
     */
    static get command() {
        return 'create:project <name>';
    }

    /**
     * The command description
     *
     * @return {String}
     */
    static get description() {
        return 'Create a new conga.js project';
    }

    /**
     * Hash of command options
     *
     * @return {Object}
     */
    static get options() {
        return {
            //'foo' : ['-f, --foo [value]', 'some foo']
        };
    }

    /**
     * Array of command argument names
     *
     * @return {Array<String>}
     */
    static get arguments() {
        return [
            'name'
        ];
    }

    /**
     * The possible project templates to use
     *
     * @type {Object}
     */
    static get projectUrls() {
        return {
            minimal: 'git@github.com:congajs/conga-skeleton-project.git',
        };
    }

    /**
     * Execute the command
     *
     * @param  {CommandInput}  input   the command input data
     * @param  {CommandOutput} output  the output writer
     * @param  {Function}      next    the next callback
     * @return {void}
     */
    execute(input, output, next) {

        let projectName = input.getArgument('name');

        if (!projectName) {
            this.exitWithError('You must provide a name for your project');
        }

        projectName = projectName.toLowerCase().replace(/ /g, '-');
        const dir = process.cwd();
        const projectDir = path.join(dir, projectName);

        // make sure we aren't in a conga project directory already
        if (fs.existsSync(path.join(dir, '.conga'))){
            this.exitWithError('Looks like you are trying to create a project in an existing Conga.js project!!!');
        }

        // make sure that the target directory doesn't already exist
        if (fs.existsSync(projectDir)){
            this.exitWithError('Target project path already exists!!! (' + projectDir + ')');
        }

        output.writeln('======================================================================');
        output.writeln('Creating new project: ' + input.getArgument('name'));
        output.writeln('target: ' + projectDir);
        output.writeln('======================================================================');

        output.writeln('Step 1/3: cloning project directory');

        this.cloneDemoProject('minimal', projectDir, () => {

            output.writeln('Step 2/3: setting up parameters.yml');

            // copy parameters.ini.dist to parameters.ini
            fs.linkSync(
                path.join(projectDir, 'app', 'config', 'parameters.yml.dist'),
                path.join(projectDir, 'app', 'config', 'parameters.yml')
            );

            output.writeln('Step 3/3: installing npm dependencies (this may take a little while)');

            // install the project dependencies
            this.runNpmInstall(output, projectDir, () => {

                output.writeln('project created at: ' + projectDir) + '!!!';
                output.writeln('----------------------------------------------------------------------');
                output.writeln('Change in to your project directory and start up your application:');
                output.writeln('');
                output.writeln('$ cd ' + projectName);
                output.writeln('$ conga play');
                output.writeln('');
                output.writeln('and then open up http://localhost:3000 in your browser!');
                output.writeln('----------------------------------------------------------------------');

                next();
            });

        });

    }

    /**
     * Clone the demo project to the given path via GIT
     *
     * @param  {String}   type
     * @param  {String}   projectDir
     * @param  {Function} cb
     * @return {void}
     */
    cloneDemoProject(type, projectDir, cb) {

        git().clone(CreateProjectCommand.projectUrls[type], projectDir, null, (err, repository) => {

            if (err) {
                this.exitWithError(err);
            }

            // remove .git directory
            fs.removeSync(path.join(projectDir, '.git'));

            cb();
        });
    }

    /**
     * Run npm install in the project
     *
     * @param  {CommandOutput} output
     * @param  {String}        projectDir
     * @param  {Function}      cb
     * @return {void}
     */
    runNpmInstall(output, projectDir, cb) {

        const cmd = spawn('npm', ['install'], { cwd : projectDir });

        cmd.stdout.on('data', (data) => {
            output.writeln('' + data);
        });

        cmd.stderr.on('data', (data) => {
            this.exitWithError('' + data);
        });

        cmd.on('close', (data) => {
            cb();
        });
    }

    /**
     * Display an error message and exit the command
     *
     * @param  {String} error
     * @return {void}
     */
    exitWithError(error) {
        console.error("Error: " + error);
        process.exit();
    }
}
