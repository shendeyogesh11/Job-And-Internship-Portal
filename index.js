const express = require('express')
const app = express()
const port = 3000


const mongoose = require('mongoose');
main().catch(err => console.log(err));
async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/jobAndIntern');
}

const path=require("path");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, 'public')));

const ejsMate = require("ejs-mate");
app.engine("ejs",ejsMate);


app.use(express.urlencoded({ extended: false }));

const methodOverride = require('method-override');
app.use(methodOverride('_method'))

const Users= require("./models/users"); 
const Candidates = require('./models/candidates');
const Recruiters = require("./models/recruiters");
const Jobposting = require("./models/jobposting");
const { profile } = require('console');

const wrapAsync = require("./utils/wrapAsync");
const ExpressError = require("./utils/ExpressError");


app.get("/jobAndIntern", (req,res)=>{
  res.redirect("/jobAndIntern/home");
});

//Home page
app.get('/jobAndIntern/home', (req, res) => {
  res.render("home.ejs");
});


//Signup page
app.get("/jobAndIntern/signup",wrapAsync(async (req,res)=>{
  res.render("signup.ejs",{msg:""});
}));


//post request from signup page
app.post("/jobAndIntern/signup",wrapAsync(async (req,res)=>{
  // console.log(req.body);
  let result= await Users.findOne({email:req.body.email});
  if(result===null){
    const user = new Users(req.body);
    await user.save();
    res.redirect("/jobAndIntern/home");
  }
  else{
    res.render("signup.ejs",{msg:"User Already Exists!"});
  }
  
}))


//login page
app.get("/jobAndIntern/login",wrapAsync(async (req,res)=>{
    res.render("login.ejs",{msg:""});
}))


//post request from login page
app.post("/jobAndIntern/login",wrapAsync(async (req,res)=>{
  // console.log(req.body);
  let result= await Users.findOne(req.body);
  if(result===null){
    // alert("email or password is Wrong!");
    res.render("login.ejs",{msg:"Email or Password are Wrong!, please try again."});
  }else{
      if(result.userType === "job-seeker"){
        res.redirect(`/jobAndIntern/${result._id}/dashboard`);
      }
      else{
        res.redirect(`/jobAndIntern/${result._id}/dashboard`);
      }
  }
  

}))




//user dashboard page
app.get("/jobAndIntern/:userId/dashboard", wrapAsync(async (req,res)=>{
  let result= await Users.findOne({_id: req.params.userId});
  if(result.userType === "job-seeker"){
    res.render("candidates/seekerHome.ejs",result);          //if user is candidate then its dashboard
  }
  else{
    res.render("recruiters/recruiterHome.ejs",result);                        //else recruiters dashboard
  }
}))




//seekers profile page
app.get("/jobAndIntern/:userId/profile", wrapAsync(async (req,res)=>{
  let result= await Users.findOne({_id: req.params.userId});
  let profile= await Candidates.findOne({profile: req.params.userId}).populate("profile");
  // console.log(profile);
  if(profile===null){
    res.redirect(`/jobAndIntern/${req.params.userId}/profileCreate`);
  }
  else{
    res.render("candidates/seekerProfile.ejs",profile);
  }
  // res.render("seekerProfile.ejs",result);
}))

//seekers profile create page
app.get("/jobAndIntern/:userId/profileCreate", wrapAsync(async(req,res)=>{
  let result= await Users.findOne({_id: req.params.userId});
  res.render("candidates/seekerProfileCreate.ejs",result);
}))

//post request on creating seeker's profile
app.post("/jobAndIntern/:userId/profileCreate", wrapAsync(async (req,res)=>{
  let result= await Users.findOne({_id: req.params.userId});
  let profile1= new Candidates(req.body);
  profile1.profile=result;
  await profile1.save();
  res.redirect(`/jobAndIntern/${req.params.userId}/profile`);
  // console.log(req.body);
  // res.send("working");
  
}))

// seekers profile update page
app.get("/jobAndIntern/:userId/profileUpdate",wrapAsync(async(req,res)=>{
  let profile= await Candidates.findOne({profile: req.params.userId}).populate("profile");
  // let result= await Users.findOne({_id: req.params.userId});
  res.render("candidates/seekerProfileUpdate.ejs",profile);
}))

// patch request seekers profile update page
app.patch("/jobAndIntern/:userId/profileUpdate", wrapAsync(async (req,res)=>{
  
  // console.log(req.body);
  await Candidates.findOneAndUpdate({_id:req.params.userId},req.body);
  let profile= await Candidates.findOne({_id: req.params.userId}).populate("profile");
  // console.log(profile);
  res.redirect(`/jobAndIntern/${profile.profile._id}/profile`);
  
}))

//get request for education in candidate login
app.get("/jobAndIntern/:userId/education", wrapAsync(async (req,res)=>{
  let profile= await Candidates.findOne({profile: req.params.userId}).populate("profile");
  res.render("candidates/education.ejs",profile);
}))

// post request to add education for candidate
app.post("/jobAndIntern/:userId/education", wrapAsync(async (req,res)=>{
  let profile= await Candidates.findOne({profile: req.params.userId}).populate("profile");
  // console.log(education);
  profile.education.push(req.body);
  await profile.save();
  // console.log(profile);
  res.redirect(`/jobAndIntern/${req.params.userId}/profile`);
}))

//delete request for deleteing education from candidate profile
app.delete("/jobAndIntern/:userId/education/:edId", wrapAsync(async(req,res)=>{
  let profile= await Candidates.findOne({profile:req.params.userId}).populate("profile");
  // console.log(profile);
  for (let index = 0; index < profile.education.length; index++) {
    if(profile.education[index]._id == req.params.edId){
      // console.log(profile.education[index]);
      profile.education.splice(index, 1);
      // console.log(profile);
      await Candidates.findByIdAndUpdate(profile._id, profile);
      res.redirect(`/jobAndIntern/${req.params.userId}/profile`);
    }
    
    
  }
}))

//get request for updating education
app.get("/jobAndIntern/:userId/education/:edId", wrapAsync(async(req,res)=>{
  let profile= await Candidates.findOne({profile: req.params.userId}).populate("profile");

  for (let index = 0; index < profile.education.length; index++) {
    if(profile.education[index]._id == req.params.edId){
      profile.edIndex= index;
    }
    
  }
  
  // console.log(profile.edIndex);
  profile.edId=req.params.edId;
  // console.log(profile.edId);
  // res.send("route is working");
  res.render("candidates/educationEdit.ejs",profile);
}))

//patch request for updating education
app.patch("/jobAndIntern/:userId/education/:edId", wrapAsync(async(req,res)=>{
  let profile= await Candidates.findOne({profile:req.params.userId}).populate("profile");
  // console.log(profile);
  for (let index = 0; index < profile.education.length; index++) {
    if(profile.education[index]._id == req.params.edId){
      // console.log(profile.education[index]);
      profile.education.splice(index, 1,req.body);
      // console.log(profile);
      await Candidates.findByIdAndUpdate(profile._id, profile);
      res.redirect(`/jobAndIntern/${req.params.userId}/profile`);
    }
    
    
  }
}))

//get request for work experience in candidate login
app.get("/jobAndIntern/:userId/workExperience", wrapAsync(async (req,res)=>{
  let profile= await Candidates.findOne({profile: req.params.userId}).populate("profile");
  res.render("candidates/workExperience.ejs",profile);
}))

// post request to add work experience for candidate
app.post("/jobAndIntern/:userId/workExperience", wrapAsync(async (req,res)=>{
  let profile= await Candidates.findOne({profile: req.params.userId}).populate("profile");
  // console.log(education);
  profile.workExperience.push(req.body);
  await profile.save();
  // console.log(profile);
  res.redirect(`/jobAndIntern/${req.params.userId}/profile`);
}))

//delete request to delete work experience from candidate profile
app.delete("/jobAndIntern/:userId/workExperience/:edId", wrapAsync(async(req,res)=>{
  let profile= await Candidates.findOne({profile:req.params.userId}).populate("profile");
  // console.log(profile);
  for (let index = 0; index < profile.workExperience.length; index++) {
    if(profile.workExperience[index]._id == req.params.edId){
      // console.log(profile.education[index]);
      profile.workExperience.splice(index, 1);
      // console.log(profile);
      await Candidates.findByIdAndUpdate(profile._id, profile);
      res.redirect(`/jobAndIntern/${req.params.userId}/profile`);
    }
    
    
  }
}))

//get request for updating workExperience
app.get("/jobAndIntern/:userId/workExperience/:edId", wrapAsync(async(req,res)=>{
  let profile= await Candidates.findOne({profile: req.params.userId}).populate("profile");

  for (let index = 0; index < profile.workExperience.length; index++) {
    if(profile.workExperience[index]._id == req.params.edId){
      profile.weIndex= index;
    }
    
  }
  
  // console.log(profile.edIndex);
  profile.weId=req.params.edId;
  // console.log(profile.edId);
  // res.send("route is working");
  res.render("candidates/workExperienceEdit.ejs",profile);
}))

//patch request for updating workExperience
app.patch("/jobAndIntern/:userId/workExperience/:edId", wrapAsync(async(req,res)=>{
  let profile= await Candidates.findOne({profile:req.params.userId}).populate("profile");
  // console.log(profile);
  for (let index = 0; index < profile.workExperience.length; index++) {
    if(profile.workExperience[index]._id == req.params.edId){
      // console.log(profile.education[index]);
      profile.workExperience.splice(index, 1,req.body);
      // console.log(profile);
      await Candidates.findByIdAndUpdate(profile._id, profile);
      res.redirect(`/jobAndIntern/${req.params.userId}/profile`);
    }
    
    
  }
}))

//get request for certificates in candidate login
app.get("/jobAndIntern/:userId/certificates", wrapAsync(async (req,res)=>{
  let profile= await Candidates.findOne({profile: req.params.userId}).populate("profile");
  res.render("candidates/certificates.ejs",profile);
}))

// post request to add certificates for candidate
app.post("/jobAndIntern/:userId/certificates", wrapAsync(async (req,res)=>{
  let profile= await Candidates.findOne({profile: req.params.userId}).populate("profile");
  // console.log(education);
  profile.certificates.push(req.body);
  await profile.save();
  // console.log(profile);
  res.redirect(`/jobAndIntern/${req.params.userId}/profile`);
}))

//delete request to delete certificates from candidate profile
app.delete("/jobAndIntern/:userId/certificates/:edId", wrapAsync(async(req,res)=>{
  let profile= await Candidates.findOne({profile:req.params.userId}).populate("profile");
  // console.log(profile);
  for (let index = 0; index < profile.certificates.length; index++) {
    if(profile.certificates[index]._id == req.params.edId){
      // console.log(profile.education[index]);
      profile.certificates.splice(index, 1);
      // console.log(profile);
      await Candidates.findByIdAndUpdate(profile._id, profile);
      res.redirect(`/jobAndIntern/${req.params.userId}/profile`);
    }
    
    
  }
}))

//get request for updating certificates
app.get("/jobAndIntern/:userId/certificates/:edId",wrapAsync(async(req,res)=>{
  let profile= await Candidates.findOne({profile: req.params.userId}).populate("profile");

  for (let index = 0; index < profile.certificates.length; index++) {
    if(profile.certificates[index]._id == req.params.edId){
      profile.cIndex= index;
    }
    
  }
  
  // console.log(profile.edIndex);
  profile.cId=req.params.edId;
  // console.log(profile.edId);
  // res.send("route is working");
  res.render("candidates/certificatesEdit.ejs",profile);
}))

//patch request for updating certificates
app.patch("/jobAndIntern/:userId/certificates/:edId", wrapAsync(async(req,res)=>{
  let profile= await Candidates.findOne({profile:req.params.userId}).populate("profile");
  // console.log(profile);
  for (let index = 0; index < profile.certificates.length; index++) {
    if(profile.certificates[index]._id == req.params.edId){
      // console.log(profile.education[index]);
      profile.certificates.splice(index, 1,req.body);
      // console.log(profile);
      await Candidates.findByIdAndUpdate(profile._id, profile);
      res.redirect(`/jobAndIntern/${req.params.userId}/profile`);
    }
    
    
  }
}))

// get request for showing jobs
app.get("/jobAndIntern/:userId/jobs", wrapAsync(async(req,res)=>{
  let result= await Users.findOne({_id: req.params.userId});
  let recruiters = await Recruiters.find({}).populate("profile");
  result.data=[];
  for(let i of recruiters){
    if(i.jobposting.length === 0){
      continue;
    }
    else{
      i.jobs = await Jobposting.find({ _id: { $in: i.jobposting } });
      result.data.push(i);
    }
  }
  // console.log(result.data[1].jobs);
  res.render("candidates/jobs.ejs", result);
}))

//get request for showing individual job
app.get("/jobAndIntern/:userId/jobs/:jobId",wrapAsync(async(req,res)=>{
  let result= await Users.findOne({_id: req.params.userId});
  result.recruiter = await Recruiters.findOne({jobposting: {$in: req.params.jobId}}).populate("profile");
  result.recruiter.thisjob = await Jobposting.findById(req.params.jobId);
  // console.log(result.recruiter.thisjob.appliedCandidates);

  result.alreadyApplied = "false";
  for(let i of result.recruiter.thisjob.appliedCandidates){
    if(req.params.userId == i){
      result.alreadyApplied = "true";
    }
  }

  res.render("candidates/job.ejs",result);
}))

// get request for applying for job
app.get("/jobAndIntern/:userId/applyJob/:jobId",wrapAsync(async(req,res)=>{
  let result= await Users.findOne({_id: req.params.userId});
  let jobp= await Jobposting.findById(req.params.jobId);
  // console.log(jobp);
  // console.log(result);
  jobp.appliedCandidates.push(result);
  await jobp.save()

  let candidate = await Candidates.findOne({profile:req.params.userId});
  // console.log(candidate);
  candidate.appliedJobs.push(jobp);
  await candidate.save()

  

  res.redirect(`/jobAndIntern/${req.params.userId}/appliedJobs`);
}))



//get request for showing applied jobs
app.get("/jobAndIntern/:userId/appliedJobs",wrapAsync(async(req,res)=>{
  let profile= await Candidates.findOne({profile:req.params.userId}).populate("profile").populate("appliedJobs");
  // console.log(profile);
  let recruiter = await Recruiters.find({jobposting: {$in: profile.appliedJobs}}).populate("profile").populate("jobposting");
  // console.log(recruiter);

  for(let i of profile.appliedJobs){
    for(let j of recruiter){
      for(let k of j.jobposting){
        let a = i._id;
        let b = k._id;
        if( a.equals(b)){
          i.company= j;
        }
        else{
          continue;
        }
      }
    }
  }
  
  profile.counter = 1;

  res.render("candidates/appliedJobs.ejs",profile);

}))












//recruiters profile page
app.get("/jobAndIntern/:userId/recruiterProfile", wrapAsync(async (req,res)=>{
  let result= await Users.findOne({_id: req.params.userId});
  let profile= await Recruiters.findOne({profile: req.params.userId}).populate("profile");
  // console.log(profile);
  if(profile===null){
    res.redirect(`/jobAndIntern/${req.params.userId}/recruiterProfileCreate`);
  }
  else{
    res.render("recruiters/recruiterProfile.ejs",profile);
  }
}))


//recruiters profile create page
app.get("/jobAndIntern/:userId/recruiterProfileCreate",wrapAsync(async(req,res)=>{
  let result= await Users.findOne({_id: req.params.userId});
  res.render("recruiters/recruiterProfileCreate.ejs",result);
}))

//post request on creating recruiter's profile
app.post("/jobAndIntern/:userId/recruiterProfileCreate", wrapAsync(async (req,res)=>{
  let result= await Users.findOne({_id: req.params.userId});
  let profile1= new Recruiters(req.body);
  profile1.profile=result;
  await profile1.save();
  res.redirect(`/jobAndIntern/${req.params.userId}/recruiterProfile`);
  // console.log(req.body);
  // res.send("working");
  
}))

// recruiters profile update page
app.get("/jobAndIntern/:userId/recruiterProfileUpdate", wrapAsync(async(req,res)=>{
  let profile= await Recruiters.findOne({profile: req.params.userId}).populate("profile");
  // console.log(profile);
  // let result= await Users.findOne({_id: req.params.userId});
  res.render("recruiters/recruiterProfileUpdate.ejs",profile);
}))

//patch request recruiters profile update page
app.patch("/jobAndIntern/:userId/recruiterProfileUpdate", wrapAsync(async (req,res)=>{
  // console.log(req.body);
  await Recruiters.findOneAndUpdate({_id:req.params.userId},req.body);
  let profile= await Recruiters.findOne({_id: req.params.userId}).populate("profile");
  // console.log(profile);
  res.redirect(`/jobAndIntern/${profile.profile._id}/recruiterProfile`);
  
}))


// get request for jobPosting page
app.get("/jobAndIntern/:userId/jobPosting",wrapAsync(async(req,res)=>{
  let profile= await Recruiters.findOne({profile: req.params.userId}).populate("profile");
  res.render("recruiters/postAJob.ejs",profile);
}))

// post request for taking job posting data
app.post("/jobAndIntern/:userId/jobPosting",wrapAsync(async(req,res)=>{
  // console.log(req.body);
    let profile= await Recruiters.findOne({_id: req.params.userId}).populate("profile"); 
    let post1= new Jobposting(req.body);
    profile.jobposting.push(await post1.save());
    await profile.save();
    res.redirect(`/jobAndIntern/${profile.profile._id}/dashboard`)
  
}))

// get request for list of all posted jobs
app.get("/jobAndIntern/:userId/postedJobs", wrapAsync(async(req,res)=>{
  let profile= await Recruiters.findOne({profile: req.params.userId}).populate("profile").populate("jobposting"); 
  res.render("recruiters/postedJobs.ejs",profile);
}))

// get request for showing details about individual posted job
app.get("/jobAndIntern/:userId/postedJobs/:jobId", wrapAsync(async(req,res)=>{
  let profile= await Recruiters.findOne({profile: req.params.userId}).populate("profile"); 
  profile.thisjob = await Jobposting.findById(req.params.jobId).populate("appliedCandidates");
  profile.counter = 1;
  // console.log(profile.thisjob);
  res.render("recruiters/indiJob.ejs", profile);
}))

app.get("/jobAndIntern/:userId/candidateProfile/:candidateId",wrapAsync(async(req,res)=>{
  let profile = await Candidates.findOne({profile: req.params.candidateId}).populate("profile");
  profile.recruiter = await Recruiters.findById(req.params.userId).populate("profile");
  
  res.render("recruiters/candidateProfile.ejs",profile);
}))

app.get("/jobAndIntern/:userId/updatejob/:jobId", wrapAsync(async(req,res)=>{
  let profile= await Recruiters.findOne({profile: req.params.userId}).populate("profile"); 
  profile.thisjob = await Jobposting.findById(req.params.jobId);
  res.render("recruiters/updateJob.ejs", profile);
}))

app.patch("/jobAndIntern/:userId/updatejob/:jobId", wrapAsync(async(req,res)=>{
  // console.log(req.body);
  await Jobposting.findByIdAndUpdate(req.params.jobId,req.body);
  res.redirect(`/jobAndIntern/${req.params.userId}/postedJobs/${req.params.jobId}`);
}))

app.delete("/jobAndIntern/:userId/updatejob/:jobId", wrapAsync(async(req,res)=>{
  await Candidates.updateMany(
    { appliedJobs: req.params.jobId },
    { $pull: { appliedJobs: req.params.jobId } }
);

await Recruiters.updateMany(
    { jobposting: req.params.jobId },
    { $pull: { jobposting: req.params.jobId } }
);
  await Jobposting.findByIdAndDelete(req.params.jobId);
  res.redirect(`/jobAndIntern/${req.params.userId}/postedJobs`);
}))






app.all("*",(req,res,next)=>{
  next(new ExpressError(404,"Page Not Found!"));
})




app.use((err,req,res,next)=>{
  let {status=500, message="Something is Broken!"} = err;
  // res.status(status).send(message);
  res.status(status).render("error.ejs",{status,message});
})

  



app.listen(port, () => {
  console.log(`server is running on port ${port}`);
})
