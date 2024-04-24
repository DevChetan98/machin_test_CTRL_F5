module.exports = app => {
    const express = require('express');
    const router = express.Router();
    const userController = require("../controller/user.controller.js");
    const { authJwt } = require("../Middleware/index.js");

    // Route for user registration
    router.post("/register", userController.register);

    // Route for user login
    router.post("/login", userController.login);

    // Route for refreshing token
    router.get("/refresh_token", userController.refreshToken);

    // Route for getting user profile
    router.get("/get_user_profile", [authJwt.verifyToken], userController.getUserPofile);


    // Mount the router under the '/users/' prefix
    app.use('/users', router);
};
