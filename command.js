#!/usr/bin/env node

const yargs = require('yargs');
const ExpressTickertPublisher = require('./lib/express-ticket-publisher.js');
const publisher = new ExpressTickertPublisher(yargs.argv.force);

yargs.help()
  .version()
  .command('publish', 'Publish all files', () => publisher.publish('all'))
  .command('publish:config', 'Publish config files', () => publisher.publish('config'))
  .command('publish:migration', 'Publish migration files', () => publisher.publish('migrations'))
  .command('publish:model', 'Publish model files', () => publisher.publish('models'))
  .command('publish:route', 'Publish route files', () => publisher.publish('routes'))
  .command('publish:view', 'Publish view files', () => publisher.publish('views'));

const args = yargs.argv;

if (!args._.length) {

  yargs.showHelp();

}
