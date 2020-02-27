const express = require('express');
const fs = require('fs');
const mustache = require('mustache');
const passport = require('passport');
const nodemailer = require('nodemailer');
const session = require('express-session');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const i18n = require('i18n');
const pathPairs = require('./storage/data/path-pairs');
const User = require(process.cwd() +'/models').User;
const ExpressTicketValidator = require('./lib/express-ticket-validator');
const ExpressTicketCrypt = require('./lib/express-ticket-crypt');
const ExpressTicketRecaller = require('./lib/express-ticket-recaller');

class ExpressTicket {

  // Main

  constructor() {

    this.config = this.getConfig();
    this.config.session['secret'] = this.config.app.key;
    this.config.locale['directory'] = this.getPath('locales');

  }

  routes(app, options) {

    this.setMiddlewares(app, options);
    this.setRoutes(app);

  }

  // Getter

  getPath(type, fileName = '') {

    const pathPair = pathPairs[type];
    const extension = (fileName) ? pathPair.extension : '';
    let filePath = pathPair.dest +'/'+ fileName + extension;

    if(!fs.existsSync(filePath)) {

      filePath = pathPair.src +'/'+ fileName + extension;

    }

    return filePath;

  }

  getConfig() {

    let confgData = {};
    const keys = ['app', 'mail', 'session', 'locale'];
    keys.forEach(key => {

      const configPath = this.getPath('config', key);
      const json = fs.readFileSync(configPath, 'utf8');
      confgData[key] = JSON.parse(json);

    });
    return confgData;

  }

  getSessionParams(req) {

    let sessionParams = {};

    for(let key of ['data', 'errors', 'message']) {

      const sessionValue = req.flash(key)[0];
      sessionParams[key] = (!sessionValue) ? {} : sessionValue;

    }

    return sessionParams;

  }

  // Setter

  setMiddlewares(app, options = {}) {

    const locale = (options.locale !== undefined) ? options.locale : this.config.locale.defaultLocale;
    app.use(i18n.init);
    i18n.configure(this.config.locale);
    i18n.setLocale(locale);
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(session(this.config.session));
    app.use(flash());
    app.use(cookieParser());
    passport.serializeUser((user, done) => {

      done(null, user);

    });
    passport.deserializeUser((user, done) => {

      done(null, user);

    });
    app.use(passport.initialize());
    app.use(passport.session());
    app.use((req, res, next) => {

      if(!req.user && req.cookies.remember_me) {

        const recaller = new ExpressTicketRecaller(req, res);
        recaller.recall().then(() => {

          next();

        });

      } else {

        next();

      }

    });
    app.use((req, res, next) => {

      let csrfParams = {};

      if(options.csrf === undefined || options.csrf === true) {

        const method = req.method;

        if(method === 'GET') {

          const crypt = new ExpressTicketCrypt();
          const csrfToken = crypt.getCsrfToken();
          const csrfField = '<input type="hidden" name="_token" value="'+ csrfToken +'">';
          req.session.csrfToken = csrfToken;
          csrfParams = {
            csrfToken: csrfToken,
            csrfField: csrfField
          };

        } else if(['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {

          if(req.body._token !== req.session.csrfToken) {

            return res.status(419).send('Page Expired');

          }

        }

      }

      const sessionParams = this.getSessionParams(req);
      const authParams = { user: req.user };
      const ticketParams = {
        ticket: {
          options: options
        }
      };
      res.locals = {...csrfParams, ...sessionParams, ...authParams, ...ticketParams};
      req.ticket = {
        __: (key, params = {}) => {

          return i18n.__(key, params);

        },
        config: this.config,
        emailVerification: (options.verify === true),
        getVerificationUrl(user, dt) {

          const crypt = new ExpressTicketCrypt();
          const hash = crypt.getHash(user.email);
          const expiration = dt.getTime();
          let verificationUrl = this.config.app.top +'/email/verify/'+ user.id +'/'+ hash +'?expires='+ expiration;
          const signature = crypt.getHmac(verificationUrl, this.config.app.key);
          verificationUrl += '&signature='+ signature;
          return verificationUrl;

        },
        getPasswordResetToken() {

          const crypt = new ExpressTicketCrypt();
          return crypt.getPasswordResetToken(this.config.app.key);

        },
        getPasswordResetUrl(token, email) {

          const passwordResetToken = this.getPasswordResetToken();
          return this.config.app.top +'/password/reset/'+ token +'?email='+ encodeURIComponent(email);

        },
        getEmailTransporter() {

          return nodemailer.createTransport({
            host: this.config.mail.host,
            port: this.config.mail.port,
            secure: this.config.mail.secure,
            auth: {
              user: this.config.mail.auth.user,
              pass: this.config.mail.auth.pass
            }
          });

        },
        updateUserPassword(user, password) {

          if(password) {

            const crypt = new ExpressTicketCrypt();
            user.password = crypt.getUserPassword(password);
            return user.save();

          }

          return false;

        },
        updateRememberToken() {

          const recaller = new ExpressTicketRecaller(req, res);
          recaller.updateRememberToken();

        },
        clearRememberToken() {

          const recaller = new ExpressTicketRecaller(req, res);
          recaller.clearRememberToken();

        },
        verifyEmail(user, req) {

          const crypt = new ExpressTicketCrypt();
          const hash = crypt.getHash(user.email);
          const verificationUrl = this.config.app.top + req.originalUrl.split('&signature=')[0];
          const signature = crypt.getHmac(verificationUrl, this.config.app.key);
          const now = new Date();

          return (
            hash === req.params.hash &&
            now.getTime() < parseInt(req.query.expires) &&
            signature === req.query.signature
          );

        }
      };
      res.ticket = {
        render: (fileName, params = {}) => {

          params = {...params, ...res.locals};
          const viewPath = this.getPath('views', fileName);
          const templateText = fs.readFileSync(viewPath, 'utf8');
          const content = mustache.render(templateText, params);
          res.send(content);

        }
      };

      const validator = new ExpressTicketValidator(req, i18n);
      validator.fails()
        .then(failed => {

          if(failed) {

            req.flash('errors', validator.errors);
            req.flash('data', req.body);
            return res.redirect('back');

          }

          next();

        });

    });

  }

  setRoutes(app) {

    const keys = ['login', 'register', 'reset-password', 'verify', 'home'];
    keys.forEach(key => {

      const routePath = this.getPath('routes', key);
      app.use('/', require(routePath));

    });

  }

}

module.exports = ExpressTicket;
