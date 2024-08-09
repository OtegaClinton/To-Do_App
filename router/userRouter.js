const router = require("express").Router();
const {createTodo,getOne,getAll,updateContent,deleteContent}= require("../controllers/todoController");
const {
    signUpUser,
    verifyEmail,
    newEmail,
    logIn,
    makeAdmin,
    getAllUsers,
    deleteUser,
    changePassword,
    forgotPassword,
    resetPassword,
    getUserWithTodos,
    logOut
} = require("../controllers/userController");
const {authorization,authenticateUser} = require("../helpers/authorization");


router.route("/signUpUser").post(signUpUser);
router.get("/verify/:id/:token",verifyEmail);
router.get("/newemail/:id",newEmail);

router.post("/logIn",logIn);
router.get('/users',authenticateUser, authorization, getAllUsers);
router.delete('/deleteuser/:id',authenticateUser, authorization, deleteUser);
router.put("/makeadmin/:id",authenticateUser,authorization,makeAdmin);
router.get('/user/:id',authenticateUser, getUserWithTodos);
router.post('/logout',authenticateUser, logOut);




router.post('/changePassword/:token', changePassword);
router.post('/forgotPassword', forgotPassword);
router.post('/resetpassword/:token', resetPassword);



router.post("/createcontent",authenticateUser,createTodo);
router.get('/content/:id',authenticateUser, getOne);
router.get('/contents',authenticateUser, getAll);
router.put('/content/:id',authenticateUser, updateContent);
router.delete('/content/:id',authenticateUser, deleteContent);








module.exports = router;
