const mongoose = require("mongoose");

const candidates = new mongoose.Schema({
   profile:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"Users",
   },
   mobile:{
      type:String,
      required:true,
   },
   dob:{
      type:Date,
      required:true,
   },
   gender:{
      type:String,
      required:true,
   },
   currentLocation:{
      type:String,
      required:true,
   },
   relocate:{
      type:String,
      required:true,
   },
   jobPreference:{
      type:String,
      required: true,
   },
   resume:{
      type:String,
      required:true,
   },
   linkdin:{
      type:String,
      required:true,
   },
   education:[
      {
         institution: String,
         degree: String,
         fieldOfStudy: String,
         startingYear: Number,
         endingYear: Number,
         gpa: String,
      },
   ],
   workExperience:[
      {
         jobTitle: String,
         companyName: String,
         description: String,
         location: String,
         startingYear: Number,
         endingYear: Number,
      },
   ],
   certificates:[
      {
         nameOfCertification: String,
         issuedBy: String,
         issueDate: Date,
         linkOfCertificate: String,
      },
   ],
   appliedJobs:[
      {
         type: mongoose.Schema.Types.ObjectId,
         ref:"Jobposting",
      },
   ],







  });

  const Candidates = mongoose.model('Candidates', candidates);

  module.exports = Candidates;