const path = require('path');
const ROOT_PATH = path.resolve(__dirname, '../../../../');
const PACKAGE_PATH = path.resolve(__dirname, '../../');

module.exports = {
  config: {
    src: PACKAGE_PATH +'/config',
    dest: ROOT_PATH +'/config',
    extension: '.json'
  },
  migrations: {
    src: PACKAGE_PATH +'/migrations',
    dest: ROOT_PATH +'/migrations',
    extension: '.js'
  },
  models: {
    src: PACKAGE_PATH +'/models',
    dest: ROOT_PATH +'/models',
    extension: '.js'
  },
  routes: {
    src: PACKAGE_PATH +'/routes',
    dest: ROOT_PATH +'/routes',
    extension: '.js'
  },
  locales: {
    src: PACKAGE_PATH +'/locales',
    dest: ROOT_PATH +'/locales',
    extension: '.json'
  },
  views: {
    src: PACKAGE_PATH +'/views/auth',
    dest: ROOT_PATH +'/views/auth',
    extension: ''
  }
};
