const userimgController = require("../controllers/UserimgController");

// router
const router = require("express").Router();

router.post('/',((req,res)=>{
    res.send("hellow");
}))
// use routers
router.post("/adduser", userimgController.upload, userimgController.addUser);

router.get("/allusers", userimgController.getAllUsers);

module.exports = router;
