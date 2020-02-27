const express = require('express');
const router = express.Router();
const redirectTo = '/home';

router.get('/login', (req, res) => {

  res.ticket.render('login');

  // [OR]
  // res.render('auth/login');

});

router.post('/login', (req, res, next) => {

  if(req.body.remember) {

    req.ticket.updateRememberToken();

  } else {

    req.ticket.clearRememberToken();

  }

  const user = req.user;
  req.login(user, () => res.redirect(redirectTo));

});

router.get('/logout', (req, res) => {

  try {

    req.ticket.clearRememberToken();
    req.logout();

  } catch(error) {

    console.log(error.message);

  }

  res.redirect('/login');

});

module.exports = router;
