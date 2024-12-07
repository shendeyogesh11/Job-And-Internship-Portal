const mongoose = require("mongoose");

const users = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    email:{
        type:String,
        required: true,
    },
    userType:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true,
    },
  });

  const Users = mongoose.model('Users', users);

  module.exports = Users;