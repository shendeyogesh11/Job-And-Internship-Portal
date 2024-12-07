const mongoose = require("mongoose");

const jobposting = new mongoose.Schema({
    appliedCandidates:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:"Users",
        },
    ],
    jobTitle:{
        type: String,
        required: true,
    },
    location:{
        type: String,
        required: true,
    },
    locationType:{
        type: String,
        required: true,
    },
    jobType:{
        type: String,
        required: true,
    },
    jobDescription:{
        type: String,
        required: true,
    },
    responsibilities:{
        type: String,
        required: true,
    },
    desiredSkills:{
        type: String,
        required: true,
    },
    qualification:{
        type: String,
        required: true,
    },
    from:{
        type: Number,
        required: true,
    },
    to:{
        type: Number,
        required: true,
    },

})



const Jobposting = mongoose.model('Jobposting', jobposting);

  module.exports = Jobposting;



