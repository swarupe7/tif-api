const mongoose= require('mongoose');
const { Snowflake} = require('@theinternetfolks/snowflake');

const roleSchema=new mongoose.Schema({
    id:{
        type: String,
        default:Snowflake.generate(),
        primaryKey: true
    },
    name:{
        type:String,
        required:true,
       

    }
},{timestamps:true});

const Role=mongoose.model('role',roleSchema);

module.exports =Role;




