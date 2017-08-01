/*
 * This file is part of the conga module.
 *
 * (c) Marc Roulias <marc@lampjunkie.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// native modules
// third-party modules

/**
 * This command upgrades a Conga.js project from the current
 * directory to the lastest version.
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
		command: "upgrade",
		description: "upgrade a project to the current Conga.js version"
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

		// find the current project version
		
		// run all the upgrades

		// set the new version in the .conga file
		
		// update npm dependencies
	}
};