const express = require('express');
const router = express.Router();
const User = require(process.cwd() +'/models').User;
const ExpressTicketMiddleware = require('express-ticket/lib/express-ticket-middleware');
const redirectTo = '/home';

router.get('/email/verify/:id/:hash', (req, res) => {

  const userId = req.params.id;
  User.findByPk(userId)
    .then(user => {

      if(!user) {

        res.status(422).send(req.ticket.__('message.register.error.signature'));

      } else if(user.emailVerifiedAt) {

        req.login(user, () => res.redirect(redirectTo));

      } else if(req.ticket.verifyEmail(user, req)) {

        user.emailVerifiedAt = new Date();
        user.save();
        req.login(user, () => res.redirect(redirectTo));

      } else {

        res.status(422).send(req.ticket.__('message.register.error.signature'));

      }

    });

});

const expressTicketMiddleware = new ExpressTicketMiddleware();
const authMiddleware = expressTicketMiddleware.make();
router.get('/email/resend', authMiddleware, (req, res) => {

  const user = req.user;
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

module.exports = router;
