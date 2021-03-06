/*
 * This file is part of the conga module.
 *
 * (c) Marc Roulias <marc@lampjunkie.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const { spawn } = require('child_process');
const AbstractCommand = require('@conga/framework').command.AbstractCommand;

/**
 * This command will start up the current application in watch mode for development
 * and is pretty much just a proxy to the "npm watch" script defined in the
 * project's package.json file
 *
 * $ conga play
 */
module.exports = class PlayCommand extends AbstractCommand {

    /**
     * The command
     *
     * @return {String}
     */
    static get command() {
        return 'play';
    }

    /**
     * The command description
     *
     * @return {String}
     */
    static get description() {
        return 'Run the application HTTP context in watch mode';
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
        return [];
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

        const cmd = 'npm';
        const play = spawn(cmd, ['run', 'watch']);

        play.stdout.on('data', (data) => {
            output.writeln(`${data}`.replace("\n", ''));
        });

        play.stderr.on('data', (data) => {
            output.writeln(`${data}`);
        });

        play.on('close', (code) => {
            output.writeln(`child process exited with code ${code}`);
            next();
        });
    }
}
