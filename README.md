# conga [![Build Status](https://secure.travis-ci.org/congajs/conga.png)](http://travis-ci.org/congajs/conga)

Conga.js is an MVC framework for node.js built on top of [Express](http://expressjs.com) and is geared towards building anything from classic multi-page websites to more modern realtime and single page applications. It's architecture is heavy influenced by the Symfony2 framework for PHP, borrowing concepts such as built in dependency
injection, annotations, and modular components (bundles) that can be used at will.

It's aim is to provide a solid foundation of components to ease the development of large-scale applications while providing the flexibility for you to extend it as you wish.

Some Highlights:

* Hierarchical configuration system using YML
* Annotation based routing/templating/security/etc.
* Dependency Injection Container
* Easy extensibility through bundles
* Command line tools
* Integrated ORM/ODM through [bass.js](https://github.com/congajs/bass)

## Installation

Install the global Conga installation

    $ npm install -g @conga/conga

## Usage

### Create a new Conga project

Run the following command to generate a new project.

Note: This will automatically install all required NPM dependencies, so it may take a little while to complete.

    $ conga create:project my-project

### Run the server

Change into the new project directory and launch the application.

    $ cd my-project
    $ conga play
