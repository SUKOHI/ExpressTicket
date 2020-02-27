class expressTicketMiddleware {

  make(callback, redirectTo = '/login') {

    return (req, res, next) => {

      if(typeof callback === 'function') {

        const callbackResult = callback(req, res);

        if(!callbackResult) {

          return res.redirect(302, redirectTo);

        }

      }

      if(req.isAuthenticated()) {

        next();

      } else {

        res.redirect(302, redirectTo);

      }

    };

  }

}

module.exports = expressTicketMiddleware;
