const blessed = require('blessed');

module.exports = class CongaUi {

    constructor() {

    }

    run() {

        // Create a screen object.
        var screen = blessed.screen({
          smartCSR: true
        });

        screen.title = 'my window title';


        let content = "\n";



        content += "####################################################################\n";
        content += "#   ██████╗ ██████╗ ███╗   ██╗ ██████╗  █████╗         ██╗███████╗ #\n";
        content += "#  ██╔════╝██╔═══██╗████╗  ██║██╔════╝ ██╔══██╗        ██║██╔════╝ #\n";
        content += "#  ██║     ██║   ██║██╔██╗ ██║██║  ███╗███████║        ██║███████╗ #\n";
        content += "#  ██║     ██║   ██║██║╚██╗██║██║   ██║██╔══██║   ██   ██║╚════██║ #\n";
        content += "#  ╚██████╗╚██████╔╝██║ ╚████║╚██████╔╝██║  ██║██╗╚█████╔╝███████║ #\n";
        content += "#   ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝ ╚═╝  ╚═╝╚═╝ ╚════╝ ╚══════╝ #\n";
        content += "####################################################################\n";




        // Create a box perfectly centered horizontally and vertically.
        var box = blessed.box({
          top: 'center',
          left: 'center',
          width: '500',
          height: '70%',
          content: "{center}{green-fg}" + content + "{/green-fg}\n\n{bold}Welcome to conga.js{/bold}{/center}", //'Hello {bold}world{/bold}!',
          tags: true,
          border: {
            type: 'line'
          },
          style: {
            fg: 'white',
            bg: 'black',
            border: {
              fg: '#f0f0f0'
            },
            // hover: {
            //   bg: '#777'
            // }
          }
        });


        var list = blessed.list({
            items: ['one', 'two', 'three']
        });

        //box.append(list);

        // Append our box to the screen.
        screen.append(box);

        // Add a png icon to the box
        var icon = blessed.image({
          parent: box,
          top: 0,
          left: 0,
          type: 'overlay',
          width: 'shrink',
          height: 'shrink',
          file: __dirname + '/my-program-icon.png',
          search: false
        });

        // If our box is clicked, change the content.
        box.on('click', function(data) {
          box.setContent('{center}Some different {red-fg}content{/red-fg}.{/center}');
          screen.render();
        });

        // If box is focused, handle `enter`/`return` and give us some more content.
        box.key('enter', function(ch, key) {
          box.setContent('{right}Even different {black-fg}content{/black-fg}.{/right}\n');
          box.setLine(1, 'bar');
          box.insertLine(1, 'foo');
          screen.render();
        });

        // Quit on Escape, q, or Control-C.
        screen.key(['escape', 'q', 'C-c'], function(ch, key) {
          return process.exit(0);
        });

        // Focus our element.
        box.focus();

        // Render the screen.
        screen.render();

    }
}
