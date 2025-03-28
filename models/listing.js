const mongoose=require("mongoose");
const review = require("./review");
const Schema=mongoose.Schema;
const Review=require("./review.js");

const listingSchema=new Schema({
    title:{
        type:String,
        required:true,
    },    
    description:String,
    image:{
        filename: String,
        url: String,
    },   
    price:Number,
    location:String,
    country:String,
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:"Review",
        },
    ],
    owner:{
        
        type:Schema.Types.ObjectId,
        ref:"User",
    },
    

});

listingSchema.post("findOneAndUpdate",async(listing)=>{
    if(listing){
        await review.deleteMany({_id: {$in: listing.reviews}});
    }
});
const Listing=mongoose.model("Listing",listingSchema);
module.exports=Listing;