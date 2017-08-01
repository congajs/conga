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
var inflect = require('inflect');
var swig = require('swig');

/**
 * This command generates a model in a bundle
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
		command: "create:model <bundle> <name> [options]",
		description: "generate a new model file in a bundle",
		arguments: ['bundle', 'name'],
		options: {
			"fields" : ['--fields [fields]', 'Fields to add to model (id:Number,name:String,email:String)']
		}
	},

	/**
	 * Run the command
	 * 
	 * @return {void}
	 */
	run: function(args, options){

		var bundleName = args.bundle;
		var modelName = args.name;

		var fields = this.fixFields(options.fields);

		var dir = process.cwd()
		var bundleDir = path.join(dir, 'src', bundleName);
		var resourcesDir = path.join(__dirname, '..', 'resources');

		// build the target model file name
		var modelFilename = modelName.toLowerCase() + '.js';

		// build full path to model file
		var modelDir = path.join(bundleDir, 'lib', 'model');
		var modelPath = path.join(modelDir, modelFilename);

		// make sure we are in a conga project directory
		if (!fs.existsSync(path.join(dir, '.conga'))){
			this.exitWithError('You need to run this command in a Conga.js project!!!');
		}

		// make sure that the bundle exists
		if (!fs.existsSync(bundleDir)){
			this.exitWithError('Bundle: ' + bundleName + ' doesn\'t exist at: ' + bundleDir);
		}

		// make sure that the target file doesn't already exist
		if (fs.existsSync(modelPath)){
			this.exitWithError('Model file already exists!!! (' + modelPath + ')');
		}

		// create a controller directory if it doesn't exist already
		if (!fs.existsSync(modelDir)){
			fs.mkdirSync(modelDir);
		}

		console.log('----------------------------------------------');
		console.log('Generating model: ' + modelName);
		console.log('Target: ' + modelPath);
		console.log('----------------------------------------------');

		// build root url and controller name
		var modelClassName = modelName.charAt(0).toUpperCase() + modelName.slice(1);
		var collectionName = inflect.pluralize(modelName.toLowerCase());

		var tmpl = swig.compileFile(path.join(resourcesDir, 'etc', 'model.js'));
		var contents = tmpl.render({
			modelName : modelClassName,
			collectionName : collectionName,
			fields : fields
		});
		fs.writeFileSync(modelPath, contents);
	},

	fixFields: function(fields){

		if (typeof fields === 'undefined'){
			return null;
		}

		var fixed = [];

		var split = fields.split(',');

		split.forEach(function(field){
			var parts = field.split(':');
			fixed.push({
				property: parts[0],
				type: parts[1]
			})
		});

		return fixed;
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