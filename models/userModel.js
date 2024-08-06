const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    fullName:{
        type: String,
        required: [true,'Full name is required.']
    },

    email:{
        type: String,
        required:[true,'Email is required.'],
        unique: true
    },

    password:{
        type: String,
        required:[true,'password is required.']
    },
   
    isAdmin:{
        type: Boolean,
        default:false
    },

    isVerified: {
        type:Boolean,
        default: false
    },

    todo: [
        {
            type:mongoose.SchemaTypes.ObjectId,
            ref:"Todo"
        }
    ]
    
}, {timestamps: true});

const userModel = mongoose.model("User",userSchema);


module.exports = userModel;