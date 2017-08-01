# conga [![Build Status](https://secure.travis-ci.org/congajs/conga.png)](http://travis-ci.org/congajs/conga)

conga.js is a modern, object-oriented, enterprise level MVC framework for node.js written in ES6 JavaScript.

It has features and flexility to power any sort of project including:

* REST API backends
* Single page applications
* Traditional multi-page websites
* Realtime websocket applications

It was created with the following goals in mind:

* Provide a structure to enforce clean codebases
* Use annotations to easily map routing, database models, validation, security, etc.
* Provide a powerful Dependency Injection Container as a basis for applications
* Make multiple environment configuration simple using YML
* Provide flexibility to easily add functionality using "bundles"
* Allow any piece of the framework to be easily overloaded or replaced
* Include tools to provide detailed profiling of your applications

## Installation

Install the global Conga installation

    $ npm install -g @conga/conga

## Getting started

### Create a new Conga project

Run the following command to generate a new project.

    $ conga create:project my-project

This will generate a minimal project providing the core framework which can be enhanced by installing and configuring additional bundles.

### Run the server

Change into the new project directory and launch the application.

    $ cd my-project
    $ conga play


## Usage

### Controllers

All routing is handling by creating controller classes and exposing your actions by using the @Route annotation:

    @Route("/my-action-path", methods=["GET", "POST"], name="my.route.name")

All actions will receive standard request and response objects. The response object contains .return() and .error() methods which get sent to a response handler which is configured for the controller/action.

Optionally, you can return a Promise from your action.

    const Controller = require('@conga/framework').Controller;

    /**
     * @Route("/")
     */
    module.exports = class HelloWorldController extends Controller {

        /**
         * Say hello
         *
         * @Route("/hello/:name", methods=["GET"])
         */
        hello(req, res) {

            res.return("Hello " + req.params.name);

            // or use a promise:
            // return Promise.resolve('Hello ' + req.params.name);
        }
    }

By extending the controller class you have access to the core service container which will allow you to grab any registered services or parameters:

    /**
     * Grab some stuff from the container
     *
     * @Route("/container-test")
     */
    containerTest(req, res) {

        res.return({
            congaVersion: this.container.getParameter('conga.version'),
            foo: this.container.get('my.service').buildFoo()
        });
    }
