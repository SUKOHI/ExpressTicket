'use strict';
module.exports = (sequelize, DataTypes) => {
  const PasswordReset = sequelize.define('PasswordReset', {
    email: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    token: DataTypes.STRING,
    createdAt: DataTypes.DATE
  }, {
    timestamps: false,
  });
  PasswordReset.associate = function(models) {
    PasswordReset.hasOne(models.User, {
      foreignKey: 'email',
      sourceKey: 'email'
    });
  };
  return PasswordReset;
};
