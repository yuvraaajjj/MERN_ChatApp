const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

dotenv.config();

const jwtsecret = process.env.JWT_SECRET;
const bcryptSalt = bcrypt.genSaltSync(10)

async function handleRegister(req, res){
    const { name, lastname, username, password, dob } = req.body; 
    
        try {
            const hashedPassword = bcrypt.hashSync(password, bcryptSalt)
            const createdUser = await User.create({ name, lastname, username: username, password: hashedPassword, dob});
            jwt.sign({ userID: createdUser._id,username }, jwtsecret, {}, (err, token) => {
                if (err) throw err;
                res.cookie("token", token, {httpOnly: true,sameSite: "none", secure: true}).status(201).json({ message: "User registered successfully!", id: createdUser._id});
            });
        } catch (err) {
            console.error("Error:", err);
            res.status(500).json({ message: "Internal Server Error" });
        }
}

function handleLoggedIn(req, res){
    const {token} = req.cookies
    if(token){
        jwt.verify(token, jwtsecret, {}, (err, userData) => {
            if(err) throw err
            res.json(userData)
        })
    }else{
        res.status(401).json("no token")
    }
}

async function handleLogIn(req, res) {
    const { username, password } = req.body;
    const foundUser = await User.findOne({username})
    if(foundUser){
        const OK = bcrypt.compareSync(password, foundUser.password)
        if(OK){
            jwt.sign({ userID: foundUser._id,username }, jwtsecret, {}, (err, token) => {
                if (err) throw err;
                res.cookie("token",token,{httpOnly: true,sameSite: "none", secure: true}).status(201).json({ 
                    message: "User login successfully!",
                    id: foundUser._id
                });
            });
        }
    }
}

module.exports = {
    handleRegister,
    handleLoggedIn,
    handleLogIn
}
