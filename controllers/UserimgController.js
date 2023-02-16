const Userimg = require("../models").Userimg;

// image Upload
const multer = require("multer");
const path = require("path");

// main work

// 1. create product

const addUser = async (req, res) => {
    console.log("body:::",req.body)
  let info = {
    image: req.file.path,
    name: req.body.name,
  };

  const user = await Userimg.create(info);
  res.status(200).send(user);
  console.log(user);
};

// 2. get all products

const getAllUsers = async (req, res) => {
  let users = await Userimg.findAll({});
  res.status(200).send(users);
};

// 8. Upload Image Controller

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "Images");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
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
  getAllUsers,
  upload,
};
