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

// third-party modules
var supervisor = require('supervisor');
var wrench = require('wrench');

/**
 * This command starts up an application in a conga.js project
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
		command: "play",
		description: "start up an application"
	},

	/**
	 * Run the command
	 * 
	 * @return {void}
	 */
	run: function(projectName, options){

		var dir = process.cwd();

		// check if we are in a conga project
		if (!fs.existsSync(path.join(dir, '.conga'))){
			console.error('oh oh!!! not in a conga.js directory!!!');
			process.exit();
		}

		// build fake args to send to supervisor
		var args = [
			'-w',
			'app/config,src',
			'-e',
			'js|yml|jade',
			'-p',
			300,
			'-q',
			path.join(dir, 'app', 'app.js')
		];

		// run the application
		supervisor.run(args);
	}
};