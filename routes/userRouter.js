const express = require("express");
const { checkAuth } = require("../middlewares/auth");
const {
  handleUserSignup,
  handleUserSignin,
  handleUserEmailVerification,
  handleUserProfile,
  handleUserProfileEdit,
  handleUserPasswordChange,
  handleUserDelete,
  handleUserForgotPassword,
  handleValidateResetToken,
  handleUserResetPassword,
  handleUserLogout,
  handleGetCurrentUser,
} = require("../controllers/userController");

require("dotenv").config();

const userRouter = express.Router();

userRouter.post("/signup", handleUserSignup);

userRouter.post("/verify-email", checkAuth, handleUserEmailVerification);

userRouter.post("/signin", handleUserSignin);

userRouter.get("/profile", checkAuth, handleUserProfile);

userRouter.patch("/edit-profile", checkAuth, handleUserProfileEdit);

userRouter.patch("/change-password", checkAuth, handleUserPasswordChange);

userRouter.delete("/delete-account", checkAuth, handleUserDelete);

userRouter.post("/forgot-password", handleUserForgotPassword);

userRouter.post("/reset-password/:token",handleUserResetPassword)

userRouter.get("/check-token/:token",handleValidateResetToken)

userRouter.post("/logout", checkAuth, handleUserLogout);

userRouter.get("/currentuser", checkAuth, handleGetCurrentUser);

module.exports = userRouter;
