# Express-Ticket

A package for Express.js that provides user authentication like login, registration, remember me, password reset and email verification.  
This package is inspired by [Laravel](https://laravel.com/) that is always magical!

[日本語ページはこちら](https://blog.capilano-fw.com/?p=5975)

# Installation

    npm i --save express-ticket

# Preparation

Run the command below to set up Sequelize in your app.

    npx sequelize init

And set your DB connection info in `/config/config.json`.

*** Note: ***  
You do NOT have to create migrations & models by yourself because this package has them.

Then, run the command below.

    npx ticket publish

This command will create the following files.

* config/*
* locales/*
* migrations/*
* models/*
* routes/*
* views/auth/*

Now your `/migrations` folder have two files.  
Create DB tables called `Users` & `PasswordResets` by Sequelize command.

    npx sequelize db:migrate

# Configuration

You at least have to set top URL of your Express app in `/config/app.js`.

And see files of `/config` if you'd like to change more configurations.

# Usage

    const express = require('express');
    const app = express();
    const ExpressTicket = require('express-ticket');

    const ticket = new ExpressTicket();
    ticket.routes(app, {
      verify: true, // default: false
      csrf: true,   // default: true
      locale: 'en'    // or set default locale in /config/locale.js
    });

    app.listen(5000, () => {

      console.log('Lisening...');

    });

Now you have some routes like this.

* /login
* /register
* /password/reset
* /passowrd/email
* /email/verify/*
* /email/resend
* /home

You can customize the features by yourself.  
See the route files located in `/routes`.

And you also can learn `authMiddleware` in `/routes/home.js`

# About middleware

ExpressTicket automatically use the following middlewares in its class.  
Please be careful NOT to call them again in your code.

* body parser
* locale
* session
* flash
* cookie parser
* passport

# Dependencies

ExpressTicket utilizes many packages for its features.  
Thank you greate developers of them!  

See `package.json` for the details.

# License

This package is licensed under the MIT License.  
Copyright 2020 Sukohi Kuhoh
