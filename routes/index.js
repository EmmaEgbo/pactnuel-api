// Dependencies
import express from "express";
import userController from "../controller/UserController";
import fileController from "../controller/FileController";
import categoryController from "../controller/CategoryController";
import tagController from "../controller/TagController";
import blogController from "../controller/BlogController";
import publicationController from "../controller/PublicationController";
import followController from "../controller/FollowController";
import commentController from "../controller/CommentsController";
import middleware from "../middleware";
import upload from "../middleware/file-upload";

const router = express.Router();

// Routes
router.route("/").get((req, res) => res.status(200).send("Hola!!! You are one step away from Pactnuel API"));

router.use(middleware.checkFormatKey);

//User API
router.route("/login").post(middleware.checkFormatKey,userController.login);
router.route("/register").post(middleware.checkFormatKey,userController.register);
router.route("/userDetails").post(middleware.checkFormatKey,middleware.adjustUserAuth,userController.getDetails);
router.route("/user").get(middleware.checkFormatKey,middleware.adjustUserAuth,userController.getUserDetails);
router.route("/accountActivation").post(middleware.checkFormatKey,userController.accountActivation);
router.route("/forgotPasswordResendActivation").post(middleware.checkFormatKey,userController.forgotPasswordResendActivation);
router.route("/forgotPassword").post(middleware.checkFormatKey,userController.forgotPassword);
router.route("/getAllUsers").post(middleware.checkFormatKey,userController.getAllUsers);
router.route("/updateUser").put(middleware.checkUserAuth,userController.updateUser);
router.route("/updatePassword").put(middleware.checkUserAuth,userController.updatePassword);
router.route("/updateImage").put(middleware.checkUserAuth,userController.updateImage);
router.route("/refreshToken").post(userController.refreshTokens);
router.route("/logout").post(userController.logout);




//File API
router.route("/uploadFile").post(middleware.checkUserAuth, upload.single('file'),fileController.uploadFile);

//category API
router.route("/addCategory").post(middleware.checkUserAuth,categoryController.addCategory);
router.route("/getAllCategory").get(middleware.adjustUserAuth, categoryController.getAllCategory);
router.route("/updateCategory/:id").put(middleware.checkUserAuth,categoryController.updateCategory);
router.route("/getCategory/:id").get(middleware.adjustUserAuth,categoryController.getCategory);


//tags API
router.route("/addUpdateTags").post(middleware.checkUserAuth,tagController.addUpdateTags);
router.route("/getAllTags").get(middleware.adjustUserAuth,tagController.getAllTags);
router.route("/getTags/:id").get(middleware.checkUserAuth,tagController.getTag);

//blog API
router.route("/addBlog").post(middleware.checkUserAuth,blogController.addBlog);
router.route("/getAllBlog").post(middleware.adjustUserAuth,blogController.getAllBlog);
router.route("/updateBlog/:id").put(middleware.checkUserAuth,blogController.updateBlog);
router.route("/getBlog/:alias").get(middleware.adjustUserAuth,blogController.getBlog);
router.route("/relatedBlogs/:alias").get(middleware.adjustUserAuth,blogController.relatedBlogs);
router.route("/searchBlogs/:searchText").get(middleware.adjustUserAuth,blogController.searchBlogs);
router.route("/pickedBlogs").get(middleware.adjustUserAuth,blogController.pickedBlogs);
router.route("/markTopBlog/:id").put(middleware.checkUserAuth,blogController.markTop);
router.route("/markFeaturedBlog/:id").put(middleware.checkUserAuth,blogController.markFeatured);
router.route("/getViewsCount/:alias").get(blogController.getLikesCount);
router.route("/getLikesCount/:alias").get(blogController.getViewsCount);
router.route("/updateViewsCount/:alias").put(blogController.updateViewsCount);
router.route("/updateLikesCount/:alias").put(blogController.updateLikesCount);


//publication API
router.route("/addPublication").post(middleware.checkUserAuth,publicationController.addPublication);
router.route("/getAllPublication").post(middleware.adjustUserAuth,publicationController.getAllPublication);
router.route("/updatePublication/:id").put(middleware.checkUserAuth,publicationController.updatePublication);
router.route("/getPublication/:alias").get(middleware.adjustUserAuth,publicationController.getPublication);
router.route("/getUsersPublication/:userId").get(middleware.checkUserAuth,publicationController.getUsersPublication);
router.route("/removePublication/:userId/:publicationId").put(middleware.checkUserAuth,publicationController.removePublication);
router.route("/menuPublication/:publicationId").put(middleware.checkUserAuth,publicationController.menuPublication);

//user followed
router.route("/follow/blog/:id").post(middleware.checkUserAuth,followController.followBlog);
router.route("/like/blog/:id").post(middleware.checkUserAuth,followController.likeBlog);
router.route("/follow/publication/:id").post(middleware.checkUserAuth,followController.followPublication);
router.route("/follow/author/:id").post(middleware.checkUserAuth,followController.followAuthor);
router.route("/follow/category/:id").post(middleware.checkUserAuth,followController.followCategory);
router.route("/follow/blog/:id").get(middleware.checkUserAuth,followController.getFollowedBlog);
router.route("/like/blog/:id").get(followController.getBlogLikeCount);
router.route("/follow/publication/:id").get(middleware.checkUserAuth,followController.getFollowedPublication);
router.route("/follow/author/:id").get(middleware.checkUserAuth,followController.getFollowedAuthor);
router.route("/follow/category/:id").get(middleware.checkUserAuth,followController.getFollowedCategories);


//comment API
router.route("/addComment").post(middleware.checkUserAuth,commentController.addComment);
router.route("/getAllComment").post(middleware.adjustUserAuth,commentController.getAllComment);
router.route("/updateComment/:id").put(middleware.checkUserAuth,commentController.updateComment);
router.route("/changeStatus/:id").put(middleware.checkUserAuth,commentController.changeStatus);

export default router;
