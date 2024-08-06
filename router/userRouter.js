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
    getUserWithTodos
} = require("../controllers/userController");
const {authorization} = require("../helpers/authorization");

router.route("/signUpUser").post(signUpUser);
router.get("/verify/:id/:token",verifyEmail);
router.get("/newemail/:id",newEmail);

router.post("/logIn",logIn);
router.get('/users', authorization, getAllUsers);
router.get('/deleteuser', authorization, deleteUser);
router.put("/makeadmin/:id",authorization,makeAdmin);
router.get('/user/:id', getUserWithTodos);




router.post('/changePassword/:token', changePassword);
router.post('/forgotPassword', forgotPassword);
router.post('/resetpassword/:token', resetPassword);



router.post("/createcontent",createTodo);
router.get('/content/:id', getOne);
router.get('/contents', getAll);
router.put('/content/:id', updateContent);
router.delete('/content/:id', deleteContent);








module.exports = router;
