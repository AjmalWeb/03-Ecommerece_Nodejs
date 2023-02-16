const User = require("../models").User;
const Role = require("../models").Role;
const Permission = require("../models").Permission;

const Helper = require("../utils/helper");
const helper = new Helper();

const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");

const { createTokenUser } = require("../utils");

// image Upload
const multer = require("multer");
const path = require("path");

// Create a new User

const addUser = async (req, res) => {
  const rolePerm = await helper.checkPermission(req.user.role_id, "user_add");

  if (rolePerm) {
    console.log("body:::", req.body);
    if (
      !req.body.role_id ||
      !req.body.email ||
      !req.body.password ||
      !req.body.fullname ||
      !req.body.phone
    ) {
      throw new CustomError.BadRequestError(
        "Please pass Role ID, email, password, phone or fullname."
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
      try {
        const user = await User.create({
          image: req.file?.path ? req.file.path : null,
          email: req.body.email,
          password: req.body.password,
          fullname: req.body.fullname,
          phone: req.body.phone,
          role_id: req.body.role_id,
        });
        if (user) {
          const tokenUser = await createTokenUser(user);
          console.log("tokenUser:::", tokenUser);
          res.status(StatusCodes.CREATED).json({ user: tokenUser });
        } else {
          throw new CustomError.BadRequestError(
            "Could not update db please try again"
          );
        }
      } catch (error) {
        throw new CustomError.BadRequestError(error);
      }
    }
  } else {
    throw new CustomError.UnauthenticatedError("Forbidden user");
  }
};

// Get List of Users
const getUsers = async (req, res) => {
  const rolePerm = await helper.checkPermission(
    req.user.role_id,
    "user_get_all"
  );

  if (rolePerm) {
    const users = await User.findAll({
      include: [
        {
          model: Role,
          include: [
            {
              model: Permission,
              as: "permissions",
            },
          ],
        },
      ],
      attributes: {
        exclude: ["password"],
      },
    });

    if (users) {
      res.status(StatusCodes.OK).json({ users });
    } else {
      throw new CustomError.BadRequestError("No users found");
    }
  } else {
    throw new CustomError.UnauthenticatedError("Forbidden user");
  }
};

// Get User by ID
const getUserbyId = async (req, res) => {
  const rolePerm = await helper.checkPermission(req.user.role_id, "user_get");
  if (rolePerm) {
    const user = await User.findByPk(req.params.id, {
      attributes: {
        exclude: ["password"],
      },
    });
    if (user) {
      res.status(StatusCodes.OK).json({ user });
    } else {
      throw new CustomError.NotFoundError(`No user with id : ${req.params.id}`);
    }
  } else {
    throw new CustomError.UnauthenticatedError("Forbidden user");
  }
};

// Update a User
const updateUser = async (req, res) => {
  const rolePerm = await helper.checkPermission(
    req.user.role_id,
    "role_update"
  );
  if (rolePerm) {
    console.log("req.body:::", req.body);
    if (
      !req.body.role_id ||
      !req.body.email ||
      !req.body.fullname ||
      !req.body.phone
    ) {
      throw new CustomError.BadRequestError(
        "Please pass Role ID, email, password, phone or fullname."
      );
    } else {
      const user = await User.findByPk(req.params.id);

      if (user) {
        // console.log('user::::',user);
        try {
          const userid = user.id;
          console.log("params:::", req.params.id);
          const userUpdate = await User.update(
            {
              image: req.file?.path
                ? req.file.path
                : user.image
                ? user.image
                : null,
              email: req.body.email || user.email,
              fullname: req.body.fullname || user.fullname,
              phone: req.body.phone || user.phone,
              role_id: req.body.role_id || user.role_id,
            },
            {
              where: {
                id: req.params.id,
              },
            }
          );
          if (userUpdate) {
            const tokenUser = await createTokenUser(user);
            console.log("updated token", tokenUser);
            res.status(StatusCodes.OK).json({ user: tokenUser });
          } else {
            throw new CustomError.BadRequestError(
              "Could not update db please try again"
            );
          }
        } catch (error) {
          // throw new CustomError.BadRequestError("Email already exists");
          throw new CustomError.BadRequestError(error);
        }
      } else {
        throw new CustomError.NotFoundError(
          `No user with id : ${req.params.id}`
        );
      }
    }
  } else {
    throw new CustomError.UnauthenticatedError("Forbidden user");
  }
};

// Delete a User

const deleteUser = async (req, res) => {
  const rolePerm = await helper.checkPermission(
    req.user.role_id,
    "role_delete"
  );
  if (rolePerm) {
    if (!req.params.id) {
      throw new CustomError.BadRequestError("Please pass user ID.");
    } else {
      const user = await User.findByPk(req.params.id);
      if (user) {
        const userDelete = await User.destroy({
          where: {
            id: req.params.id,
          },
        });
        if (userDelete) {
          res.status(StatusCodes.OK).json({ msg: "Success! User removed." });
        } else {
          throw new CustomError.BadRequestError(
            "Could not update db please try again"
          );
        }
      } else {
        throw new CustomError.NotFoundError(
          `No user with id : ${req.params.id}`
        );
      }
    }
  } else {
    throw new CustomError.UnauthenticatedError("Forbidden user");
  }
};

//  Upload Image Controller

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "Images");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const uploaduserImage = multer({
  storage: storage,
  limits: { fileSize: "1000000" },
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const mimeType = fileTypes.test(file.mimetype);
    const extname = fileTypes.test(path.extname(file.originalname));

    if (mimeType && extname) {
      return cb(null, true);
    }
    cb("Give proper files formate to upload");
  },
}).single("image");

module.exports = {
  addUser,
  getUsers,
  getUserbyId,
  updateUser,
  deleteUser,
  uploaduserImage,
};
