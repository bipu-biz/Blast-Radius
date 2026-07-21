import mongoose ,{ Schema } from "mongoose";

const repo = new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:[true,'userid is required']
    },

    owner:{
        type:String,
        required:[true,'owner is required']
    },

    name:{
        type:String,
        required:[true,'repo name is required']
    },

    fullname:{
        type:String,
        required:[true,'fullname is required'],
        unique:true
    },

    githubRepoId:{
        type:Number,
        required:[true,'github repoid is required'],
        unique:true

    },

    webhookSecret:{
        type:String,
        select:false
    },

    webhookId:{
        type:String
    },

    defaultBranch:{
        type:String,
        default:'main'
    },

    baselineGraphId:{
        type:Schema.Types.ObjectId,
        ref:'graphSnapshot',
        default:null,
    }

},
{
    timestamps:true
})

export default mongoose.model('Repo',repo)