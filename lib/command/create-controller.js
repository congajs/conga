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

// third-party modules
var swig = require('swig');
var wrench = require('wrench');

/**
 * This command generates a controller in a bundle
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
		command: "create:controller <bundle> <name> [options]",
		description: "generate a new controller file in a bundle",
		arguments: ['bundle', 'name'],
		options: {
			"rest" : ['--rest [model]', 'Create a REST controller for a model']
		}
	},

	/**
	 * Run the command
	 * 
	 * @return {void}
	 */
	run: function(args, options){

		var bundleName = args.bundle;
		var controllerName = args.name;

		var isRest = (typeof options.rest !== 'undefined');
		var model = options.rest;

		var dir = process.cwd()
		var bundleDir = path.join(dir, 'src', bundleName);
		var resourcesDir = path.join(__dirname, '..', 'resources');

		// build the target controller file name
		var controllerFilename = controllerName.toLowerCase() + '.js';

		// build full path to controller file
		var controllerDir = path.join(bundleDir, 'lib', 'controller');
		var controllerPath = path.join(controllerDir, controllerFilename);

		// make sure we are in a conga project directory
		if (!fs.existsSync(path.join(dir, '.conga'))){
			this.exitWithError('You need to run this command in a Conga.js project!!!');
		}

		// make sure that the bundle exists
		if (!fs.existsSync(bundleDir)){
			this.exitWithError('Bundle: ' + bundleName + ' doesn\'t exist at: ' + bundleDir);
		}

		// make sure that the target file doesn't already exist
		if (fs.existsSync(controllerPath)){
			this.exitWithError('Controller file already exists!!! (' + controllerPath + ')');
		}

		// create a controller directory if it doesn't exist already
		if (!fs.existsSync(controllerDir)){
			fs.mkdirSync(controllerDir);
		}


		console.log('----------------------------------------------');
		console.log('Generating controller: ' + controllerName);
		console.log('Target: ' + controllerPath);
		console.log('----------------------------------------------');

		// build root url and controller name
		var controllerClassName = controllerName.charAt(0).toUpperCase() + controllerName.slice(1) + 'Controller';
		var controllerRoute = controllerName.toLowerCase();

		var tmpl = swig.compileFile(path.join(resourcesDir, 'etc', 'controller.js'));
		var contents = tmpl.render({
			controllerName : controllerClassName,
			controllerRoute : controllerRoute,
			isRest : isRest,
			model : model
		});
		fs.writeFileSync(controllerPath, contents);
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