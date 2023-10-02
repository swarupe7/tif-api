const mongoose = require('mongoose');
const { Snowflake} = require('@theinternetfolks/snowflake');

const commSchema=new mongoose.Schema({
    id:{
        type:String,
        default:Snowflake.generate(),
        primaryKey:true
    },
    name:{
        type:String,
        required:true

    },
    slug:{
        type:String,
        required:true,
        unique:true

    },
    owner:{
          type:String,
         
    }
    
},{timestamps:true});

const Comm=mongoose.model('comm',commSchema);

module.exports =Comm;

