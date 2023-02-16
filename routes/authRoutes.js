const express = require("express");
const router = express.Router();
const { signup, signin, logout ,autoLogin} = require("../controllers/authController");
const passport = require("passport");
require("../config/passport")(passport);
const { isTokenValid, createTokenUser } = require("../utils");
const { token } = require("morgan");
const { StatusCodes } = require("http-status-codes");

router.post("/signup", signup);
router.post("/signin", signin);
router.get("/logout", logout);

// this path will be used to check if the cookie is valid to auto login inside the application;
router.get("/autoLogin",autoLogin);

router.get(
  "/protected",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.send(200).json({
      message: "welcome to the protected route!",
    });
  }
);

module.exports = router;
