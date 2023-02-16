const RolePermission = require('../models').RolePermission;
const Permission = require('../models').Permission;

const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");

class Helper {
    constructor() {}

    checkPermission(roleId, permName) {
        return new Promise(
            (resolve, reject) => {
                Permission.findOne({
                    where: {
                        perm_name: permName
                    }
                }).then((perm) => {
                    RolePermission.findOne({
                        where: {
                            role_id: roleId,
                            perm_id: perm.id
                        }
                    }).then((rolePermission) => {
                        // console.log(rolePermission);
                        if(rolePermission) {
                            resolve(rolePermission);
                        } else {
                            // reject({message: 'Forbidden'});
                            throw new CustomError.UnauthenticatedError("Forbidden user");
                        }
                    }).catch((error) => {
                        reject(error);
                    });
                }).catch(() => {
                    // reject({message: 'Forbidden'});
                    throw new CustomError.UnauthenticatedError("Forbidden user");
                });
            }
        );
    }
}


module.exports = Helper;