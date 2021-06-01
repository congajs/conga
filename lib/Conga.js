/*
 * This file is part of the conga module.
 *
 * (c) Marc Roulias <marc@lampjunkie.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

 // built-in modules
const fs = require('fs');
const glob = require('glob');
const path = require('path');
const util = require('util');

// third-party modules
const CommandInput = require('@conga/framework').command.CommandInput;
const ConsoleCommandOutput = require('@conga/framework').command.ConsoleCommandOutput;
const Loader = require('@conga/framework').config.loader;
const program = require('commander');

// local modules
const CongaUi = require('./CongaUi');

/**
 * This is the main "conga" cli application
 *
 * @type {[type]}
 */
module.exports = class Conga {

    /**
     * Construct the Conga app
     */
    constructor() {

        /**
         * The current environment we are running in
         *
         * @type {String}
         */
        this.environment = 'development';

        // get the current path
        this.currentPath = process.cwd();

        // grab package information
        this.pkg = require('../package.json');

        // set up cli
        program.version(this.pkg.version);

    }

    /**
     * Run the cli application
     *
     * @return {void}
     */
    run() {

        this.registerCommands();

        // figure out the environment
        const args = process.argv;

        args.forEach((arg, x) => {
            if (arg.substring(0, 6) == '--env=') {
                this.environment = arg.substring(6);
                args.splice(x, 1);
            }
        });

        // run the command
        program.parse(args);

    }

    /**
     * Register all of the local and project commands that are found
     *
     * @return {void}
     */
    registerCommands() {
        this.registerLocalCommands();
        this.registerProjectCommands();
        this.registerDefaultCommand();
    }

    /**
     * Register the local commands
     *
     * @return {void}
     */
    registerLocalCommands() {

        const files = glob.sync(path.join(__dirname, 'command', '*Command.js'));

        files.forEach((file) => {
            this.registerCommand(require(file), file);
        });
    }

    /**
     * Register the project commands if we are inside a project
     *
     * @return {void}
     */
    registerProjectCommands() {

        // check if we are in a conga project
        if (!fs.existsSync(path.join(this.currentPath, '.conga'))){
            return;
        }

        // load the app's config so we can read the bundles correctly
        const configLoader = new Loader();
        const configPath = path.join(this.currentPath, 'app', 'config', 'config.yml');
        const config = configLoader.readConfigFile(configPath, undefined);

        let bundles = config.bundles.all;

        if (typeof config.bundles[this.environment] !== 'undefined' && config.bundles[this.environment] !== null) {
            bundles = bundles.concat(config.bundles[this.environment]);
        }

        // add the core framework bundle
        bundles.push('@conga/framework');

        // find all the command files
        const files = this.findCommandPathsInBundles(bundles);

        files.forEach((file) => {
            this.registerCommand(require(file), file, 'project');
        });
    }

    /**
     * Register the default command
     *
     * @return {void}
     */
    registerDefaultCommand() {
        program
            .command('wizard')
            .action(function(env) {
                const ui = new CongaUi();
                ui.run();
            });
    }

    /**
     * Register a command
     *
     * @param  {AbstractCommand} command
     * @param  {String}          file
     * @param  {String}          context    local or project
     * @return {void}
     */
    registerCommand(command, file, context = 'local') {

        // bypass registering the "abstract" command
        if (command.prototype.constructor.name === 'AbstractCommand') {
            return;
        }

        this.validateCommandClass(command, file);

        const cmd = program.command(command.command);

        cmd.description(command.description);

        // add options
        if (typeof command.options !== 'undefined'){
            for (let i in command.options){
                cmd.option(command.options[i][0], command.options[i][1]);
            }
        }

        const currentPath = this.currentPath;
        const environment = this.environment;

        cmd.action(function() {

            const args = Array.from(arguments);
            const data = args.pop();

            // format options
            const options = {};
            if (typeof command.options !== 'undefined'){
                for (var i in command.options){
                    options[i] = data[i];
                }
            }

            // format arguments
            const commandArgs = {};
            if (typeof command.arguments !== 'undefined'){
                command.arguments.forEach((arg, i) => {
                    commandArgs[arg] = data.parent.args[i];
                });
            }

            if (context === 'project') {

                // run the command in the project
                const cli = require(path.join(currentPath, 'app', 'cli.js'));
                cli.run(file, environment, commandArgs, options);

            } else {
                const c = new command();
                c.execute(new CommandInput(commandArgs, options), new ConsoleCommandOutput(), () => {
                    // finished running
                });
            }

        });
    }

    /**
     * Validate a loaded command class to make sure that it can be registered
     *
     * @param  {Object} command
     * @param  {String} file
     * @return {void}
     */
    validateCommandClass(command, file) {

        // make sure that there is a command
        if (typeof command.command !== 'string'){
            this.exitWithError(util.format('%s is missing "static get command() {}"', file));
        }

        // make sure that there is a description
        if (typeof command.description !== 'string'){
            this.exitWithError(util.format('%s is missing "static get description() {}"', file));
        }

        // make sure that there is a run method
        if (typeof command.prototype.execute !== 'function'){
            this.exitWithError(util.format('%s is missing a execute() function', file));
        }
    }

    /**
     * Find all of the absolute paths to commands in the given bundles
     *
     * @param  {Array} bundles
     * @return {Array}
     */
    findCommandPathsInBundles(bundles) {

        let paths = [];
        const projectPath = this.currentPath;

        bundles.forEach((bundle) => {

            let commandDir = null;

            // check if bundle exists in node_modules
            if (fs.existsSync(path.join(projectPath, 'node_modules', bundle, 'lib', 'command'))){
                commandDir = path.join(projectPath, 'node_modules', bundle, 'lib', 'command');
            } else if (fs.existsSync(path.join(projectPath, 'src', bundle, 'lib', 'command'))){
                commandDir = path.join(projectPath, 'src', bundle, 'lib', 'command');
            }

            // find all commands in bundle's command dir
            if (commandDir !== null){
                paths = paths.concat(glob.sync(path.join(commandDir, '*Command.js')));
            }
        });

        return paths;
    }

    /**
     * Display an error message and exit
     *
     * @param error
     */
    exitWithError(error) {
        console.error('Unable to register command: ' + error);
        process.exit();
    }
}
