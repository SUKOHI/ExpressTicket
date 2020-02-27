const express = require('express');
const router = express.Router();
const User = require(process.cwd() +'/models').User;
const PasswordReset = require(process.cwd() +'/models').PasswordReset;
const redirectTo = '/home';

router.get('/password/reset', (req, res) => {

  res.ticket.render('password-email');

  // [OR]
  // res.render('auth/password/email');

});

router.post('/password/email', (req, res) => {

  const email = req.body.email;
  const token = req.ticket.getPasswordResetToken(email);

  PasswordReset.findOrCreate({
    where: {
      email: email
    },
    defaults: {
      email: email,
      token: token,
      createdAt: new Date()
    }
  }).then(([passwordReset, created]) => {

    if(!created) {

      passwordReset.token = token;
      passwordReset.createdAt = new Date();
      passwordReset.save();

    }

    const passwordResetUrl = req.ticket.getPasswordResetUrl(token, email);
    const transporter = req.ticket.getEmailTransporter();
    transporter.sendMail({
      to: email,
      from: req.ticket.config.mail.emails.from,
      text: req.ticket.__('message.passwordReset.email.text') +"\n\n"+ passwordResetUrl,
      subject: req.ticket.__('message.passwordReset.email.subject'),
    });
    req.flash('message', {
      success: req.ticket.__('message.passwordReset.email.sent')
    });
    res.redirect('back');

  });

});

router.get('/password/reset/:token', (req, res) => {

  const params = {
    token: req.params.token,
    email: req.query.email
  };
  res.ticket.render('password-reset', params);

  // res.render('auth/password/reset', params);

});

router.post('/password/reset', (req, res) => {

  const email = req.body.email;
  const password = req.body.password;
  const token = req.body.token;

  PasswordReset.findOne({
    where: {
      email: email
    },
    include: [
      { model: User }
    ]
  }).then(passwordReset => {

    if(passwordReset &&
      passwordReset.token === token &&
      passwordReset.User) {

      const user = passwordReset.User;
      req.ticket.updateUserPassword(user, password);
      passwordReset.destroy();
      req.login(user, () => {

        req.flash('message', {
          success: req.ticket.__('message.passwordReset.completed')
        });
        res.redirect(redirectTo);

      });

    } else {

      req.flash('message', {
        error: req.ticket.__('message.passwordReset.error.invalidToken')
      });
      res.redirect('back');

    }

  });

});

module.exports = router;
