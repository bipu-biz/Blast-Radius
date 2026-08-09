import mongoose,{ Schema } from "mongoose";

const pranalysis = new Schema({
    repoId:{
        type:Schema.Types.ObjectId,
        ref:'Repo',
        required:[true,'repoId is required'],
    },
    prNumber:{
        type:Number,
        required:[true,'prNumber is required'],
    },
    headSha:{
        type:String,
        required:[true,'headSha is required'],

    },
    status:{
        type:String,
        enum:['queued','cloning','parsing','analyzing','complete','failed'],
        default:'queued',
        required:[true,'status is required']
    },
    changedFiles:[
        {
            type:String
        }
    ],
    graphSnapshotId:{
        type:Schema.Types.ObjectId,
        ref:'graphSnapshot',
    },
    affectedNodes:[
        {
            nodeId:{
                type:String,
                required:[true,'nodeId is required']
            },
            type:{
                type:String,
                enum:['file','route','component'],
                required:[true,'node type is required']
            },
            path:{
                type:String,
                required:[true,'path is required']
            },
            riskWeight:{
                type:Number,
                required:[true,'riskWeight is required']
            }
        },
    ],
    riskScore:{
        type:Number,
        default:0
    },
    aiSummary:{
        type:String,
        default:null,
    },
    errorMessage:{
        type:String,
        default:null
    },

},
{
    timestamps:true
})

pranalysis.index({repoId:1,prNumber:1})

export default mongoose.model('PRAnalysis',pranalysis)