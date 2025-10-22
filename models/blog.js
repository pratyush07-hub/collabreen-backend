const mongoose = require("mongoose")

const blogSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        trim:true
    },
    description:{
        type:String,
        required:true,
        trim:true
    },
    duration:{
        type:String,
        required:true,
        trim:true
    },
    date:{
        type:Date,
        default:Date.now
    },
    content:{
        type:String,
        required:true,
        trim:true
    },
    image:{
        type:String,
        required:true,
        trim:true
    },
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    author:{
        type:String,
        required:true,
        trim:true
    },
    categories: {
        type: [String],
        default: []
    },    
},{ timestamps: true })

const Blog = mongoose.model("Blog",blogSchema)

module.exports = Blog