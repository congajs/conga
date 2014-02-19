/*
 * This file is part of the conga module.
 *
 * (c) Marc Roulias <marc@lampjunkie.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// built-in modules
var fs = require('fs');
var path = require('path');
var util = require('util');

// third-party modules
var program = require('commander');
var yaml = require('yamljs');

// grab package information
var pkg = require('../package.json');
var version = pkg.version;

/**
 * Export the main run method which parses the command line
 * arguments and executes the corresponding command from the
 * global install or current project
 * 
 * @author Marc Roulias <marc@lampjunkie.com>
 */
module.exports = {

	/**
	 * The current work path
	 */
	path: null,
	
	/**
	 * Run the command
	 * 
	 * @return void
	 */
	run: function(){

		// get the current path
		this.path = process.cwd();

		// set up cli
		program.version(version);

		// register all commands
		this.registerCommands();
		
		// run the command
		program.parse(process.argv);
	},
	
	/**
	 * Find all of the commands and register them
	 * 
	 * @return void
	 */
	registerCommands: function(){
		
		var that = this;
		var dir = __dirname + '/command';
		
		if (!fs.existsSync(dir)){
			console.error(dir + " doesn't exist");
			process.exit();
		}

		// loop through and register commands
		var files = fs.readdirSync(dir);
		files.forEach(function(file){
			var command = require(path.join(dir, file));
			that.validateCommand(path.join(dir, file), command);
			var cmd = program.command(command.config.command);
			cmd.description(command.config.description);

			// add options
			if (typeof command.config.options !== 'undefined'){
				for (var i in command.config.options){
					cmd.option(command.config.options[i][0], command.config.options[i][1]);
				}
			}

			cmd.action(function(){

				var args = Array.prototype.slice.call(arguments, 0);
				var data = args.pop();
				var value = null;

				if (args.length > 0){
					value = args[0];
				}

				var options = {};

				if (typeof command.config.options !== 'undefined'){
					for (var i in command.config.options){
						options[i] = data[i];
					}
				}

				var commandArgs = {};

				if (typeof command.config.arguments !== 'undefined'){
					for (var i=0; i<command.config.arguments.length; i++){
						commandArgs[command.config.arguments[i]] = data.parent.args[i];
					}
				}

				command.program = program;
				command.run(commandArgs, options);
			});
			command.program = program;
		});

		this.registerProjectCommands();
	},
	
	/**
	 * Register all the commands found in the current project directory (if we are in a project)
	 *
	 * This method finds the current application's 'bundles.yml' file and
	 * parses it to find all of the registered bundles, then looks into those
	 * bundles for any 'lib/command/*' files
	 *
	 * @return {void}
	 */
	registerProjectCommands: function(){

		// check if we are in a conga project
		if (!fs.existsSync(path.join(this.path, '.conga'))){
			return;
		}

		var that = this;

		// load the app's bundles.yml file
		var configPath = path.join(this.path, 'app', 'config', 'bundles.yml');
		var bundles = yaml.parse(fs.readFileSync(configPath, 'utf-8')).bundles;

		// add the core framework bundle
		bundles.push('conga-framework');

		// find all the command files
		var files = this.findCommandPathsInBundles(bundles);

		files.forEach(function(file){

			// load the command
			var command = require(file);

			// validate it
			that.validateCommand(file, command);

			// add the command
			var cmd = program.command(command.config.command);
			cmd.description(command.config.description);

			// add options
			if (typeof command.config.options !== 'undefined'){
				for (var i in command.config.options){
					cmd.option(command.config.options[i][0], command.config.options[i][1]);
				}
			}

			// handle the command execution
			cmd.action(function(){
				
				var args = Array.prototype.slice.call(arguments, 0);
				var data = args.pop();
				var value = null;

				if (args.length > 0){
					value = args[0];
				}

				var options = {};

				if (typeof command.config.options !== 'undefined'){
					for (var i in command.config.options){
						options[i] = data[i];
					}
				}

				var commandArgs = {};

				if (typeof command.config.arguments !== 'undefined'){
					commandArgs[command.config.arguments[0]] = data.parent.args[0];
				}

				// check if kernel should be skipped
				if (typeof command.config.skipKernel !== 'undefined' && command.config.skipKernel === true){

					command.run(null, commandArgs, options, function(){

					});

				} else {
					// run the command in the project
					var cli = require(path.join(that.path, 'app', 'cli.js'));
					cli.run(program, 'app', 'development', command, commandArgs, options);					
				}
			});
		});

		// build a catch-all command
		var cmd = program.command('*');
		cmd.action(function(){
			console.log('command not found: ' + arguments[0]);
		});
	},

	/**
	 * Find all of the absolute paths to commands in the given bundles
	 * 
	 * @param  {Array} bundles
	 * @return {Array}
	 */
	findCommandPathsInBundles: function(bundles){

		var paths = [];
		var projectPath = this.path;

		bundles.forEach(function(bundle){

			var commandDir = null;

			// check if bundle exists in node_modules
			if (fs.existsSync(path.join(projectPath, 'node_modules', bundle, 'lib', 'command'))){
				commandDir = path.join(projectPath, 'node_modules', bundle, 'lib', 'command');
			} else if (fs.existsSync(path.join(projectPath, 'src', bundle, 'lib', 'command'))){
				commandDir = path.join(projectPath, 'src', bundle, 'lib', 'command');
			}

			// find all commands in bundle's command dir
			if (commandDir !== null){

				var files = fs.readdirSync(commandDir);

				files.forEach(function(file){
					paths.push(path.join(commandDir, file));
				});
			}
		});

		return paths;
	},

	/**
	 * Validate a command to make sure it's configured properly
	 * 
	 * @param {String} file
	 * @param {Object} command
	 */
	validateCommand: function(file, command){
		
		// make sure that there is a config object
		if (typeof command.config !== 'object'){
			this.exitWithError(util.format('%s doesn\'t have a valid config object', file));
		}
		
		// make sure that there is a command
		if (typeof command.config.command !== 'string'){
			this.exitWithError(util.format('%s is missing config.command', file));
		}
		
		// make sure that there is a description
		if (typeof command.config.description !== 'string'){
			this.exitWithError(util.format('%s is missing config.description', file));
		}      

		// make sure that there is a run method
		if (typeof command.run !== 'function'){
			this.exitWithError(util.format('%s is missing a run function', file));
		}
	},
	
	/**
	 * Display an error message and exit
	 * 
	 * @param error
	 */
	exitWithError: function(error){
		console.error('error: ' + error);
		process.exit();
	}
};