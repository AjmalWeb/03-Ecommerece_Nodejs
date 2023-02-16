const express = require("express");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const router = express.Router();
require("../config/passport")(passport);
const User = require("../models").User;
const Role = require("../models").Role;
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { attachCookiesToResponse, createTokenUser } = require("../utils");

router.post("/signup", async function (req, res) {
  console.log("reqbody::::", req.body);
  if (!req.body.email || !req.body.password || !req.body.fullname) {
    // res.status(400).send({
    //   success: false,
    //   message: "Please pass username, password and name.",
    // });
    throw new CustomError.BadRequestError(
      "Please provide email ,username and password"
    );
  } else {
    const emailAlreadyExists = await User.findOne({
      where: {
        email: req.body.email,
      },
    });
    if (emailAlreadyExists) {
      throw new CustomError.BadRequestError("Email already exists");
    }
    Role.findOne({
      where: {
        // role_name: 'admin'
        role_name: req.body.role ? req.body.role : "user",
      },
    })
      .then((role) => {
        console.log("roleid:::::", role.id);
        if (!role.id) console.log("Role not matching");
        User.create({
          email: req.body.email,
          password: req.body.password,
          fullname: req.body.fullname,
          phone: req.body.phone,
          role_id: role.id,
        })
          .then((user) => {
            // res.status(201).send({ user, message: "User successfully registered" });
            const tokenUser = createTokenUser(user);
            attachCookiesToResponse({ res, user: tokenUser });
            res.status(StatusCodes.CREATED).json({ user: tokenUser });
          })
          .catch((error) => {
            // res.status(400).send({ success: false, error });
            throw new CustomError.BadRequestError(
              "Could not update db please try again"
            );
          });
      })
      .catch((error) => {
        // res.status(400).send({ success: false, message: error });
        throw new CustomError.BadRequestError(
          "Could not find the role with user"
        );
      });
  }
});

router.post("/signin", async function (req, res) {
  console.log("reqbody::::", req.body);
  if (!req.body.email || !req.body.password) {
    throw new CustomError.BadRequestError("Please provide email  and password");
  } else {
    const user = await User.findOne({ email });
    User.findOne({where: {email: req.body.email}})
      .then((user) => {
        // if (!user) {
        //   // return res.status(401).send({
        //   //   message: "Authentication failed. User not found.",
        //   // });
        //   throw new CustomError.UnauthenticatedError("Invalid Credentials email");
        // }
        user.comparePassword(req.body.password, (err, isMatch) => {
          if (isMatch && !err) {
            // var token = jwt.sign( JSON.parse(JSON.stringify(user)),"nodeauthsecret", { expiresIn: 86400 * 30 } );
            // jwt.verify(token, "nodeauthsecret", function (err, data) {console.log(err, data);});
            // res.json({ success: true,token: "JWT " + token,});
            // res.cookie("jwt", token, {
            //     httpOnly: true,
            //     secure: false, //--> SET TO TRUE ON PRODUCTION
            //    }).status(200) .json({token: "JWT " + token,message: "You have logged in :D",});
            const tokenUser = createTokenUser(user);
            attachCookiesToResponse({ res, user: tokenUser });
            res.status(StatusCodes.OK).json({ user: tokenUser });
          } else {
            // res.status(401).send({ success: false,message: "Authentication failed. Wrong password.",});
            // throw new CustomError.UnauthenticatedError("Invalid Credentials Password");
            throw new CustomError.BadRequestError("sample check password");
          }
        });
      })
      .catch((error) => {
        // res.status(400).send(error)
        throw new CustomError.UnauthenticatedError("Invalid Credentials email");
      });
  }
});

router.get("/logout", async (req, res) => {
  res.cookie("token", "logout", {
    httpOnly: true,
    expires: new Date(Date.now() + 1000),
  });
  res.status(StatusCodes.OK).json({ msg: "user logged out!" });
});

// router.get("/logout", (req, res) => {
//   if (req.cookies["jwt"]) {
//     res.clearCookie("jwt").status(200).json({
//       message: "You have logged out",
//     });
//   } else {
//     res.status(401).json({
//       error: "Invalid jwt",
//     });
//   }
// });

module.exports = router;
