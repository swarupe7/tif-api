const mongoose = require('mongoose');
const { Snowflake} = require('@theinternetfolks/snowflake');

const memSchema=new mongoose.Schema({
    id:{
        type:String,
        default:Snowflake.generate(),
        primaryKey:true
    },
    community:{
        type:String,
        required:true

    },
    user:{
        type:String,
        required:true,
        unique:true

    },
    role:{
          type:String,
          required:true
    }

},{timestamps:true});

const Member=mongoose.model('member',memSchema);

module.exports =Member;
