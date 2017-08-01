/*
 * This file is part of the conga module.
 *
 * (c) Marc Roulias <marc@lampjunkie.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
const fs = require('fs-extra');
const path = require('path');

const AbstractCommand = require('@conga/framework').command.AbstractCommand;

/**
 * This command creates a new bundle in the current project
 *
 * $ conga create:bundle hello
 */
module.exports = class CreateBundleCommand extends AbstractCommand {

    /**
     * The command
     *
     * @return {String}
     */
    static get command() {
        return 'create:bundle <name>';
    }

    /**
     * The command description
     *
     * @return {String}
     */
    static get description() {
        return 'Create a new bundle in the current project';
    }

    /**
     * Hash of command options
     *
     * @return {Object}
     */
    static get options() {
        return {};
    }

    /**
     * Array of command argument names
     *
     * @return {Array<String>}
     */
    static get arguments() {
        return ['name'];
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

        const bundleName = input.getArgument('name');
		const dir = process.cwd()
		const bundleDir = path.join(dir, 'src', bundleName);
		const resourcesDir = path.join(__dirname, '..', 'resources');

		// make sure we are in a conga project directory
		if (!fs.existsSync(path.join(dir, '.conga'))) {
			this.exitWithError('You need to run this command in a Conga.js project!!!');
		}

		// make sure that the target directory doesn't already exist
		if (fs.existsSync(bundleDir)) {
			this.exitWithError('Target bundle path already exists!!! (' + bundleDir + ')');
		}

		output.writeln('----------------------------------------------');
		output.writeln('Creating bundle: ' + bundleName);
		output.writeln('Target: ' + bundleDir);
		output.writeln('----------------------------------------------');

		// copy the empty project to the target path
		fs.copySync(path.join(resourcesDir, 'bundles', 'empty'), bundleDir);

		// fix files
		this.fixBundleNameInFile(path.join(bundleDir, 'lib', 'dependency-injection', 'configuration.js'), bundleName);
		this.fixBundleNameInFile(path.join(bundleDir, 'lib', 'resources', 'config', 'config.default.yml'), bundleName);

        output.writeln('Finished creating bundle! Remember to add "' + bundleName + '" to your app/config/bundles.yml file!');

        next();
    }

    /**
	 * Fix the bundle name in a file
	 *
	 * @param  {String} file
	 * @param  {String} name
	 * @return {void}
	 */
	fixBundleNameInFile(file, name) {
		let contents = fs.readFileSync(file).toString();
		contents = contents.replace(/##BUNDLE_NAME##/g, name);
		fs.writeFileSync(file, contents);
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
