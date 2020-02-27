const crypto = require('crypto');
const bcrypt = require('bcrypt');

class ExpressTicketCrypt {

  getHash(value) {

    return crypto.createHash('sha1')
      .update(value)
      .digest('hex');

  }

  getHmac(value, secretKey) {

    return crypto.createHmac('sha256', secretKey)
      .update(value)
      .digest('hex');

  }

  getRememberToken() {

    return crypto.randomBytes(20).toString('hex');

  }

  getRememberTokenHash(userId, rememberToken) {

    return this.getHash(userId +'-'+ rememberToken);

  }

  getCsrfToken() {

    return crypto.randomBytes(20).toString('hex');

  }

  getPasswordResetToken(secretKey) {

    const randomStr = crypto.randomBytes(20).toString('hex');
    return this.getHmac(randomStr, secretKey);

  }

  getUserPassword(password) {

    return bcrypt.hashSync(password, bcrypt.genSaltSync(8));

  }

  isValidPassword(rawPassword, encryptedPassword) {

    return bcrypt.compareSync(rawPassword, encryptedPassword);

  }

}

module.exports = ExpressTicketCrypt;
