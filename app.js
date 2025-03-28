if(process.env.NODE_ENV !="production"){
  require('dotenv').config();
}



const express=require("express");
const app=express();
const mongoose=require("mongoose");

const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");

const ExpressError=require("./utils/ExpressError.js");

const Review=require("./models/review.js");
const listings=require("./routes/listing.js");
const review = require("./models/review.js");
const reviews=require("./routes/review.js");
const session=require("express-session");
const MongoStore = require('connect-mongo');
const flash=require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User=require("./models/user.js");
const user=require("./routes/user.js");

const dbUrl=process.env.ATLASDB_URL;
main()
  .then(()=>{
    console.log("connect to DB");
  })
  .catch((err)=>{
     console.log(err);
  });
async function main () {
    await mongoose.connect(dbUrl);
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname,"/public")));
app.use(express.static("public"));

const store=MongoStore.create({
  mongoUrl:dbUrl,
  crypto: {
    secret:process.env.SECRET,
  },
  touchAfter:24*3600,

});

store.on("error",()=>{
  console.log("Error in mongo session",err);
});
const sessionOptions={
  store,
  secret:process.env.SECRET,
  resave:false,
  saveUninitialized:true,
  cookie:{
    expires:Date.now()+7*24*60*60*1000,
    maxAge:7*24*60*60*1000,
    httpOnly:true
  },
};

//app.get("/",(req,res)=>{
  //res.send("hi i am groot");
//});

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
  res.locals.success=req.flash("success");
  res.locals.error=req.flash("error");
  res.locals.currUser=req.user;
  next();
});

//app.get("/demouser",async(req,res)=>{
  //let fakeUser=new User({
    //email:"mukesh@gmail.com",
    //username:"mukeshck",
  //});
  //let registerUser=await User.register(fakeUser,"helloWorld");
  //res.send(registerUser);
//});
app.use("/listings",listings);
app.use("/listings/:id/reviews",reviews);
app.use("/",user);



//app.get("/testListing",async(req,res)=>{
//    let sampleListing=new Listing({
//      title:"My new villa",
//      description:"By the beach",
//      price:1300,
//      location:"Manglore,Karantaka",
//      country:"india"
//    });
//    await sampleListing.save();
//    console.log("sample is saved");
//    res.send("succesful");

//});


app.all("*",(req,res,next)=>{
  next( new ExpressError(404,"page not found!"));
});
//error finding
app.use((err,req,res,next)=>{
  let {statusCode=500, message="something wrong"}=err;
  res.render("error.ejs",{err});
  //res.status(statusCode).send(message);
});
app.listen(8080,()=>{
    console.log("server is listening to port 8080")
});