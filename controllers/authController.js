const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const {
  attachCookiesToResponse,
  createTokenUser,
  isTokenValid,
} = require("../utils");
const User = require("../models").User;
const Role = require("../models").Role;

const signup = async (req, res) => {
  console.log("reqbody::::", req.body);
  if (!req.body.email || !req.body.password || !req.body.fullname) {
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

    const role = await Role.findOne({
      where: {
        // role_name: 'admin'
        role_name: req.body.role ? req.body.role : "user",
      },
    });

    console.log("roleid:::::", role.id);
    const user = await User.create({
      email: req.body.email,
      password: req.body.password,
      fullname: req.body.fullname,
      phone: req.body.phone,
      role_id: role.id,
    });
    // console.log("created user::::",user)
    if (user) {
      const tokenUser = await createTokenUser(user);
      console.log("tokenUser:::", tokenUser);
      attachCookiesToResponse({ res, user: tokenUser });
      res.status(StatusCodes.CREATED).json({ user: tokenUser });
    } else {
      throw new CustomError.BadRequestError(
        "Could not update db please try again"
      );
    }
  }
};

const signin = async (req, res) => {
  console.log("reqbody::::", req.body);
  const { email, password } = req.body;
  if (!req.body.email || !req.body.password) {
    throw new CustomError.BadRequestError("Please provide email  and password");
  } else {
    const user = await User.findOne({ where: { email: req.body.email } });
    if (!user) {
      throw new CustomError.UnauthenticatedError("Invalid Credentials email");
    }
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      throw new CustomError.UnauthenticatedError(
        "Invalid Credentials password"
      );
    }
    const tokenUser = await createTokenUser(user);
    attachCookiesToResponse({ res, user: tokenUser });
    res.status(StatusCodes.OK).json({ user: tokenUser });
  }
};

const logout = async (req, res) => {
  //   res.cookie("jwt", "logout", {
  //     httpOnly: true,
  //     expires: new Date(Date.now() + 1000),
  //   });
  //   res.status(StatusCodes.OK).json({ msg: "user logged out!" });

  if (req.cookies["jwt"]) {
    res
      .clearCookie("jwt")
      .status(StatusCodes.OK)
      .json({ msg: "user logged out!" });
  } else {
    res.status(StatusCodes.UNAUTHORIZED).json(
      // error: "Invalid jwt",
      { msg: "Invalid jwt!" }
    );
  }
};

const autoLogin = async (req, res) => {
  const cookie = req.cookies["jwt"];
  const token = req.cookies["jwt"];
  console.log(token, ":::cookie");
  // if we received no cookies then user needs to login.
  if (!cookie || cookie === null) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ msg: "np cookies" });
  }

  const { id, name, email, role } = isTokenValid({ token });
  const user = { id, name, email, role };
  console.log("token:::::", user);
  return res.status(StatusCodes.OK).json({ user: user });
};

module.exports = {
  signup,
  signin,
  logout,
  autoLogin,
};
