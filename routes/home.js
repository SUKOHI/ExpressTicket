const express = require('express');
const router = express.Router();
const ExpressTicketMiddleware = require('express-ticket/lib/express-ticket-middleware');

// Basic usage - 1
router.get('/home', (req, res) => {

  res.ticket.render('home');

  // [OR]
  // res.render('auth/home');

});

// Basic usage - 2
const expressTicketMiddleware = new ExpressTicketMiddleware();
const authMiddleware = expressTicketMiddleware.make();
router.get('/home2', authMiddleware, (req, res) => {

  res.send('You are logged in.');

});

// Custom usage
const adminMiddleware = expressTicketMiddleware.make((req, res) => {

  return (req.user.role === 'admin'); // Pass middleware if true.

});
router.get('/home3', adminMiddleware, (req, res) => {

  res.send('You are logged in as admin.');

});

module.exports = router;
