// load up the user model
const User = require("../models").User;
var JwtStrategy = require("passport-jwt").Strategy,
  ExtractJwt = require("passport-jwt").ExtractJwt;

  const cookieExtractor = req => {
    let jwt = null 
    if (req && req.cookies) {
        jwt = req.cookies['jwt']
    }

    return jwt
}
module.exports = function(passport) {
    const opts = {
      jwtFromRequest: cookieExtractor,
      secretOrKey: process.env.JWT_SECRET,
    };
    passport.use('jwt', new JwtStrategy(opts, function(jwt_payload, done) {
      console.log("jwt_payload:::",)
      User
        .findByPk(jwt_payload.id)
        .then((user) => { return done(null, user); })
        .catch((error) => { return done(error, false); });
    }));
  };


  
// const JwtStrategy = require('passport-jwt').Strategy,
//     ExtractJwt = require('passport-jwt').ExtractJwt;

// // load up the user model
// const User = require('../models').User;

// module.exports = function(passport) {
//   const opts = {
//     jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('JWT'),
//     secretOrKey: 'nodeauthsecret',
//   };
//   passport.use('jwt', new JwtStrategy(opts, function(jwt_payload, done) {
//     User
//       .findByPk(jwt_payload.id)
//       .then((user) => { return done(null, user); })
//       .catch((error) => { return done(error, false); });
//   }));
// };
