'use strict';

const ExpressTicketCrypt = require('express-ticket/lib/express-ticket-crypt');
const crypt = new ExpressTicketCrypt();

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    emailVerifiedAt: DataTypes.DATE,
    password: DataTypes.STRING,
    rememberToken: DataTypes.STRING
  }, {});
  User.associate = function(models) {
    // associations can be defined here
  };
  User.prototype.isValidPassword = function(password){

    if(!password) return false;
    return crypt.isValidPassword(password, this.password);

  };
  return User;
};
