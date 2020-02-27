const validator = require('validator');
const User = require(process.cwd() +'/models').User;

class ExpressTicketValidator {

  constructor(req, i18n) {

    this.req = req;
    this.i18n = i18n;
    this.errors = {};
    this.errorMessages = {};

  }

  async fails() {

    if(this.shouldValidate() === false) {

      return false;

    }

    let result = false;
    const uri = this.req.originalUrl;

    if(uri === '/login') {

      result = !await this.validates({
        email: 'required|email|exists:user',
        password: 'required'
      });

    } else if(uri === '/register') {

      result = !await this.validates({
        name: 'required|max:255',
        email: 'required|email|unique',
        password: 'required|min:8|confirm'
      });

    } else if(uri === '/password/email') {

      result = !await this.validates({
        email: 'required|email|exists:email'
      });

    } else if(uri === '/password/reset') {

      result = !await this.validates({
        email: 'required|email|exists:email',
        password: 'required|min:8|confirm'
      });

    }

    return result;

  }

  async validates(rules) {

    let result = true;

    for(let key in rules) {

      this.errors[key] = [];

      const value = this.req.body[key];
      const rule = rules[key];
      const ruleKeys = rule.split('|');

      for(let ruleKey of ruleKeys) {

        let params = [];

        if(ruleKey.includes(':')) {

          let parameterString = '';
          [ruleKey, parameterString] = ruleKey.split(':');
          params = parameterString.split(',');

        }

        if(ruleKey === 'required' && validator.isEmpty(value)) {

          this.addError(key, ruleKey);
          result = false;

        } else if(ruleKey === 'email' &&
          value &&
          !validator.isEmail(value)) {

          this.addError(key, ruleKey);
          result = false;

        } else if(['max', 'min'].includes(ruleKey)) {

          let options = {};
          options[ruleKey] = parseInt(params[0]);

          if(value && !validator.isLength(value, options)) {

            this.addError(key, ruleKey, params);
            result = false;

          }

        } else if(ruleKey === 'confirm') {

          const comparison = this.req.body[key +'Confirmation'];

          if(!validator.equals(value, comparison)) {

            this.addError(key, ruleKey);
            result = false;

          }

        } else if(ruleKey === 'exists') {

          if(!result) {

            continue;

          }

          const existsType = params[0];

          if(existsType === 'user') {

            const user = await User.findOne({
              where: {
                email: this.req.body.email
              }
            });

            if(!user || !user.isValidPassword(this.req.body.password)) {

              this.addError(key, ruleKey);
              result = false;

            } else {

              this.req.user = user;

            }

          } else if(existsType === 'email') {

            const user = await User.findOne({
              where: {
                email: this.req.body.email
              }
            });

            if(!user) {

              this.addError(key, ruleKey);
              result = false;

            }

          }

        } else if(ruleKey === 'unique') {

          const user = await User.findOne({
            where: {
              email: this.req.body.email
            }
          });

          if(user) {

            this.addError(key, ruleKey);
            result = false;

          }

        }

      }

    }

    return result;

  }

  addError(key, type, params = {}) {

    let message = this.i18n.__('validation.'+ type);

    for(let i in params) {

      const value = params[i];
      message = message.replace('%s', value);
      message = message.replace('%d', parseInt(value));

    }

    this.errors[key].push({
      message: message
    });

  }

  setErrorMessages(messages) {

    this.errorMessages = messages;

  }

  getErrorMessages() {

    return this.errorMessages;

  }

  getErrorMessage(type) {

    const errorMessages = this.getErrorMessages();
    const errorMessage = errorMessages[type];
    return (typeof errorMessage === 'function')
      ? errorMessage(this.req)
      : errorMessage;

  }

  // Checker
  shouldValidate() {

    const method = this.req.method;
    const uri = this.req.originalUrl;

    return (
      method === 'POST' &&
      (
        ['/login', '/register', '/password/email', '/password/reset'].includes(uri)
      )
    );

  }

}

module.exports = ExpressTicketValidator;
