const jwt = require("jsonwebtoken");
const User = require("../models/User");
const dotenv = require("dotenv");

dotenv.config();

const jwtsecret = process.env.JWT_SECRET;

async function handleOfflinePeople(req, res){
     const users = await User.find({}, {'_id':1, username:1})
        res.json(users)
}

module.exports = {
    handleOfflinePeople,
}