const { Snowflake} = require('@theinternetfolks/snowflake');

const mongoose= require('mongoose');

const userSchema=new mongoose.Schema({
    id:{
        type: String,
        default:Snowflake.generate()
        
    },
    name:{
        type:String,
        required:true

    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String
    }
},{timestamps:true});

const User=mongoose.model('user',userSchema);

module.exports =User;




