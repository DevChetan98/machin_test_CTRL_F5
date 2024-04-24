const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
app.use(cookieParser());
const db = require('../model/index');
require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const config = require("../config/auth.config"); 


//*IsEmpty Check function
function isEmpty(obj) {
    return !obj || Object.keys(obj).length === 0;
}

//*Remove Password in Responce
function removePasswordFromRows(rows) {
    const rowWithoutPassword = rows[0];
    delete rowWithoutPassword.password
    return [rowWithoutPassword]
}


    //*Registration API
    module.exports.register = (req, res) => {
        console.log("APi CAlling");
        const email = req.body.email
        const password = req.body.password
        const username = req.body.username
        if (!email) {
            return res.send({ status: false, message: "email can not be empty" })
        }

        let final_password = bcrypt.hashSync(password, 8);
        const findUSer = "SELECT * FROM user WHERE email='" + email + "'";
        db.sequelize.query(findUSer, null, { raw: true, }).then(function (myTableRows) {
            if (isEmpty(myTableRows[0])) {
              let InserQuery = "INSERT INTO user(username,email,password)VALUES('" + username + "','" + email + "','" + final_password + "')";
                db.sequelize.query(InserQuery, null, { raw: true, }).then(async function (myTableRows) {
                    return res.send({
                        status: true,
                        message: "User successfully registered",
                        id: myTableRows[0],
                    })
                })
            } else {
                if (myTableRows[0][0].email == email) {
                    return res.send({ status: false, message: "email already exists!" })
                }
            }
        })
    }

//*Login API

exports.login = (req, res) => {
    const cookies = req.cookies;
    console.log(`cookie available at login : ${JSON.stringify(cookies)}`);
    const email = req.body.email;
    const password = req.body.password;

    if (!email) {
        return res.send({
            status: false,
            message: "Email cannot be empty!",
            data: [],
        });
    }

    if (!password) {
        return res.send({
            status: false,
            message: "Password cannot be empty!",
            data: [],
        });
    }

    let emailExists = "SELECT * FROM user WHERE email='" + email + "'";

    db.sequelize.query(emailExists, null, { raw: true }).then(function (myTableRows) {
        if (isEmpty(myTableRows[0])) {
            return res.send({ status: false, message: "These credentials do not match our records!" });
        } else {
            bcrypt.compare(password, myTableRows[0][0].password, async function (err, isPasswordValid) {
                if (err) {
                    return res.send({
                        status: false,
                        message: "Email and password do not match",
                        data: [],
                    });
                }
                if (isPasswordValid) {
                    // Send JWT Token
                    const foundUser = myTableRows[0][0];
                    const secretKey = process.env.JWT_KEY;
                  
                    const payload = {
                        id:myTableRows[0][0].id,
                        email: myTableRows[0][0].email,
                        username: myTableRows[0][0].username,
                    };
                    const options = {
                        expiresIn: "1m", // 1 minute
                    };
                    const token = jwt.sign(payload, secretKey, options);
                    const username = myTableRows[0][0].username;

                    // Assign the refresh token to an HTTP-Only cookie
                    const refreshToken = jwt.sign({ email, password }, secretKey, { expiresIn: "1d" });
                 
                    res.cookie("access_token", token, {
                        httpOnly: true,
                        sameSite: "None",
                        secure: true,
                        maxAge: 24 * 60 * 60 * 1000,
                    });
                       res.cookie("refresh_token", refreshToken, {
                        httpOnly: true,
                        sameSite: "None",
                        secure: true,
                        maxAge: 24 * 60 * 60 * 1000, // 1 day
                    });

                    myTableRows[0][0]["accessToken"] = token;
                    myTableRows[0][0]["refreshToken"] = refreshToken;

                    let result = removePasswordFromRows(myTableRows[0]);
                    return res.send({
                        status: true,
                        message: "You are successfully logged in as: " + username,
                        data: result,
                    });
                } else {
                    return res.send({ status: false, message: "Password does not match" });
                }
            });
        }
    });
};


//Genrate New Access Token using Refresh Token 
exports.refreshToken = (req, res) => {
    // console.log("req : ", req);
    if (req.cookies?.refresh_token) {
        const refreshToken = req.cookies.refresh_token;

        jwt.verify(refreshToken, process.env.JWT_KEY, (err, decoded) => {
            if (err) {
                // Invalid or expired refresh token
                console.error("Invalid or expired refresh token:", err);
                return res.status(401).json({ status: false, message: "Unauthorized" });
            } else {
                // Correct token, generate new access token
                const { email, username } = decoded;
                const accessToken = jwt.sign({
                    username: username,
                    email: email
                }, process.env.JWT_KEY, {
                    expiresIn: '1m' // Set expiration time as needed
                });

                res.cookie("access_token", accessToken, {
                    httpOnly: true,
                    sameSite: "None",
                    secure: true,
                    expiresIn: '1m' 
                    // maxAge: 24 * 60 * 60 * 100, // 1 day
                });

                // Return access token and additional user info if needed
                return res.status(200).json({
                    status: true,
                    message: "New access token generated",
                    accessToken: accessToken,
                    user: { email: email, username: username }
                });
            }
        });
    } else {
        // No refresh token found
        return res.status(401).json({
            status: false,
            message: "Unauthorized: Refresh token not found"
        });
    }
};


//Get User Profile (Is Logged)
exports.getUserPofile=async(req,res)=>{
    try {       
    
     // Access token is valid, find the user by ID        
        const getLoginUserQuery = `SELECT * FROM user`;
        const [LoginUser, _] = await db.sequelize.query(getLoginUserQuery, {
            type: db.sequelize.QueryTypes.SELECT
        });

                if (!LoginUser) {
                    return res.status(404).json({
                        success: false,
                        message: "User not found"
                    });
                } else {
                    // User is logged in, return user information
                    return res.status(200).json({
                        success: true,
                        message: "Get user profile details",
                        data: LoginUser
                    });
                }         
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
    
}
