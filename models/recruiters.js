const mongoose = require("mongoose");

const recruiters = new mongoose.Schema({
   profile:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"Users",
   },
   jobposting:[
      {
         type: mongoose.Schema.Types.ObjectId,
         ref:"Jobposting",
      },
   ],
   overview:{
      type:String,
      required:true,
   },
   website:{
      type:String,
      required:true,
   },
   industry:{
      type:String,
      required:true,
   },
   companySize:{
      type:String,
      required:true,
   },
   headquarters:{
      type:String,
      required:true,
   },
   specialties:{
      type:String,
      required:true,
   },
   


  });

  const Recruiters = mongoose.model('Recruiters', recruiters);

  module.exports = Recruiters;