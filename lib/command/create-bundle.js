/*
 * This file is part of the conga module.
 *
 * (c) Marc Roulias <marc@lampjunkie.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// built-in modules
var path = require('path');

// third-party modules
var fs = require('fs-extra');

/**
 * This command generates a new conga.js bundle in a project
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
		command: "create:bundle <name>",
		description: "generate a new Conga.js bundle",
		arguments: ['name']
	},

	/**
	 * Run the command
	 * 
	 * @return {void}
	 */
	run: function(args, options){

		var bundleName = args.name;
		var dir = process.cwd()
		var bundleDir = path.join(dir, 'src', bundleName);
		var resourcesDir = path.join(__dirname, '..', 'resources');

		// make sure we are in a conga project directory
		if (!fs.existsSync(path.join(dir, '.conga'))){
			this.exitWithError('You need to run this command in a Conga.js project!!!');
		}

		// make sure that the target directory doesn't already exist
		if (fs.existsSync(bundleDir)){
			this.exitWithError('Target bundle path already exists!!! (' + bundleDir + ')');
		}

		console.log('----------------------------------------------');
		console.log('Generating bundle: ' + bundleName);
		console.log('Target: ' + bundleDir);
		console.log('----------------------------------------------');

		// copy the empty project to the target path
		fs.copySync(path.join(resourcesDir, 'bundles', 'empty'), bundleDir);

		// fix files
		this.fixBundleNameInFile(path.join(bundleDir, 'lib', 'dependency-injection', 'configuration.js'), bundleName);
		this.fixBundleNameInFile(path.join(bundleDir, 'lib', 'resources', 'config', 'default.config.yml'), bundleName);
	},

	/**
	 * Fix the bundle name in a file
	 * @param  {String} file
	 * @param  {String} name
	 * @return {void}
	 */
	fixBundleNameInFile: function(file, name){
		var contents = fs.readFileSync(file).toString();
		contents = contents.replace(/##BUNDLE_NAME##/g, name);
		fs.writeFileSync(file, contents);
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