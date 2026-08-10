import mongoose, { Schema } from 'mongoose'

const user = new Schema({
    name:{
        type:String,
        required:[true,'name is required'],
        trim:true,
    },

    email:{
        type:String,
        required:[true,'email is required'],
        unique:true,
        trim:true,
        lowercase:true
    },

    password:{
        type:String,
        required:[true,'password is required'],
        minlength:[3,'password should be atleast 3 character long']
    },

    refreshToken: {
        type: String,
        default: null
    },

    githubaccesstoken:{
        type:String,
        select:false
    },

    repos:[{
        type:Schema.Types.ObjectId,
        ref:'Repo'
    }]
},
{
    timestamps:true
})

export default mongoose.model('User',user)