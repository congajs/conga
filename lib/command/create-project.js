/*
 * This file is part of the conga module.
 *
 * (c) Marc Roulias <marc@lampjunkie.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// built-in modules
var exec = require('child_process').exec;
var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;

// third-party modules
var wrench = require('wrench');

/**
 * This command generates a new conga.js project
 * 
 * @author Marc Roulias <marc@lampjunkie.com>
 */
module.exports = {

	/**
	 * Set up configuration for this command
	 * 
	 * @var {Object}
	 */
	config: {
		command: "create:project <name>",
		description: "generate a new Conga.js project",
		arguments: ['name']
	},

	/**
	 * Run the command
	 * 
	 * @return {void}
	 */
	run: function(args, options){

		var self = this;
		var projectName = args.name;
		var dir = process.cwd()
		var projectDir = path.join(dir, projectName);
		var resourcesDir = path.join(__dirname, '..', 'resources');

		// make sure we aren't in a conga project directory already
		if (fs.existsSync(path.join(dir, '.conga'))){
			this.exitWithError('Looks like you are trying to create a project in an existing Conga.js project!!!');
		}

		// make sure that the target directory doesn't already exist
		if (fs.existsSync(projectDir)){
			this.exitWithError('Target project path already exists!!! (' + projectDir + ')');
		}

		console.log('----------------------------------------------');
		console.log('Generating project: ' + projectName);
		console.log('Target: ' + projectDir);
		console.log('----------------------------------------------');

		console.log('Step 1/4: creating project directory');

		// copy the empty project to the target path
		wrench.copyDirSyncRecursive(path.join(resourcesDir, 'projects', 'empty'), projectDir);

		// copy parameters.ini.dist to parameters.ini
		fs.linkSync(
			path.join(projectDir, 'app', 'config', 'parameters.ini.dist'),
			path.join(projectDir, 'app', 'config', 'parameters.ini')
		);

		console.log('Step 2/4: creating package.json');

		// fix the package.json file
		this.fixPackageJsonFile(projectDir, projectName);

		console.log('Step 3/4: installing npm dependencies');

		// install the project dependencies
		this.runNpmInstall(projectDir, function(){

			console.log('Step 4/4: setting up demo bundles');

		});
	},

	/**
	 * Fix some stuff in the package.json file
	 * 
	 * @param  {String} projectDir
	 * @param  {String} projectName
	 * @return {void}
	 */
	fixPackageJsonFile: function(projectDir, projectName){
		var jsonPath = path.join(projectDir, 'package.json');
		var package = require(jsonPath);

		// change some stuff
		package.name = projectName;
		package.description = projectName;

		// write the new file
		fs.writeFileSync(jsonPath, JSON.stringify(package), null, 4);
	},

	/**
	 * Run npm install in the project
	 * 
	 * @param  {String}   projectDir
	 * @param  {Function} cb
	 * @return {[type]}
	 */
	runNpmInstall: function(projectDir, cb){

		var self = this;
		var command = 'npm';
		var cmd = spawn(command, ['install'], { cwd : projectDir });
		var error = '';

		cmd.stdout.on('data', function(data){
			console.log('' + data);
		});

		cmd.stderr.on('data', function(data){
			console.error('' + data);
		});

		cmd.on('close', function(data){
			cb();
		});
	},

	/**
	 * Display an error message and exit the command
	 * 
	 * @param  {String} error
	 * @return {void}
	 */
	exitWithError: function(error){
		console.error("Error: " + error);
		process.exit();
	}
};