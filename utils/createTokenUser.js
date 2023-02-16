const User = require("../models").User;
const Role = require("../models").Role;
const Permission = require("../models").Permission;

const createTokenUser = async (cruser) => {
  const user = await User.findAll({ where: { id: cruser.id }, include: Role });
  if (user) {
    //  console.log("tokenuser::::",JSON.stringify(user));
    // console.log(typeof(user),"type of user")
    const token = {
      id: user[0].id,
      name: user[0].fullname,
      email: user[0].email,
      phone: user[0].phone,
      role: user[0].Role.role_name,
      image:user[0].image?user[0].image:null,
    };
    console.log("token:::::", token);
    return {
      id: user[0].id,
      name: user[0].fullname,
      email: user[0].email,
      phone: user[0].phone,
      role: user[0].Role.role_name,
      image:user[0].image?user[0].image:null,
    };
  }
};

module.exports = createTokenUser;
