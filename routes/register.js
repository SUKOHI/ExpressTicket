const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require(process.cwd() +'/models').User;
const redirectTo = '/home';

router.get('/register', (req, res) => {

  res.ticket.render('register');

  // [OR]
  // res.render('auth/register');

});

router.post('/register', (req, res) => {

  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;

  User.findOrCreate({
    where: { email: email },
    defaults: {
      name: name,
      email: email,
      password: bcrypt.hashSync(password, bcrypt.genSaltSync(8))
    }
  }).then(([user]) => {

    if(!req.ticket.emailVerification) {

      return req.login(user, () => res.redirect(redirectTo));

    } else if(user.emailVerifiedAt) {

      return res.redirect(redirectTo);

    }

    const dt = new Date();
    dt.setHours(dt.getHours() + 1); // 1 hour later
    const verificationUrl = req.ticket.getVerificationUrl(user, dt);
    const transporter = req.ticket.getEmailTransporter();
    transporter.sendMail({
      to: user.email,
      from: req.ticket.config.mail.emails.from,
      text: req.ticket.__('message.register.email.text') +"\n\n"+ verificationUrl,
      subject: req.ticket.__('message.register.email.subject'),
    });
    req.flash('message', {
      success: req.ticket.__('message.register.email.sent')
    });

    return res.redirect('back');

  });

});

module.exports = router;
