/*
 * This file is part of the conga module.
 *
 * (c) Marc Roulias <marc@lampjunkie.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const AbstractCommand = require('@conga/framework').command.AbstractCommand;

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
        return 'create:project';
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
     * Execute the command
     *
     * @param  {CommandInput}  input   the command input data
     * @param  {CommandOutput} output  the output writer
     * @param  {Function}      next    the next callback
     * @return {void}
     */
    execute(input, output, next) {

        console.log(input.getArgument('name'));
        output.writeln('Creating new project: ' + input.getArgument('name'));
        next();

    }
}
