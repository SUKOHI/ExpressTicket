const ExpressTicketCrypt = require('./express-ticket-crypt');
const User = require(process.cwd() +'/models').User;

class ExpressTicketRecaller {

  constructor(req, res) {

    this.req = req;
    this.res = res;
    this.crypt = new ExpressTicketCrypt();

  }

  parseCookie() {

    return this.req.cookies.remember_me.split('|');

  }

  recall() {

    const [rememberToken, hash] = this.parseCookie();

    return User.findAll({
      where: {
        rememberToken: rememberToken
      }
    }).then(users => {

      for(let i in users) {

        const user = users[i];
        const verifyingHash = this.crypt.getRememberTokenHash(user.id, rememberToken);

        if(hash === verifyingHash) {

          return this.req.login(user, () => {

            this.updateRememberToken();

          });

        }

      }

    });

  }

  updateRememberToken() {

    const user = this.req.user;
    const rememberToken = this.crypt.getRememberToken();
    const hash = this.crypt.getRememberTokenHash(user.id, rememberToken);
    User.update(
      { rememberToken: rememberToken },
      { where: { id: user.id } }
    );
    this.res.cookie('remember_me', rememberToken +'|'+ hash, {
      path: '/',
      maxAge: 5 * 365 * 24 * 60 * 60 * 1000 // 5 years
    });

  }

  clearRememberToken() {

    const user = this.req.user;
    User.update(
      { rememberToken: null },
      { where: { id: user.id } }
    );
    this.res.clearCookie('remember_me');

  }

}

module.exports = ExpressTicketRecaller;
