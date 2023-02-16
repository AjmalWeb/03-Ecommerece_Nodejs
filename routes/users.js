const express = require("express");
const router = express.Router();
const passport = require("passport");
require("../config/passport")(passport);

const UserController = require("../controllers/UserController");

// Create a new User
router.post(
  "/",
  passport.authenticate("jwt", {
    session: false,
  }),
  UserController.uploaduserImage,
  UserController.addUser
);

// Get List of Users
router.get(
  "/",
  passport.authenticate("jwt", {
    session: false,
  }),
  UserController.getUsers
);

// Get User by ID
router.get(
  "/:id",
  passport.authenticate("jwt", {
    session: false,
  }),
  UserController.getUserbyId
);

// Update a User
router.put(
  "/:id",
  passport.authenticate("jwt", {
    session: false,
  }),
  UserController.uploaduserImage,
  UserController.updateUser
);

// Delete a User
router.delete(
  "/:id",
  passport.authenticate("jwt", {
    session: false,
  }),
  UserController.deleteUser
);

module.exports = router;
