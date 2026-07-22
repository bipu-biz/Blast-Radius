import mongoose,{Schema} from "mongoose";

const graphSnapshot = new Schema({
    repoId:{
        type:Schema.Types.ObjectId,
        ref:'Repo',
        required:[true,'repoId is required']
    },

    sha:{
        type:String,
        required:[true,'sha is required'],
    },

    nodes:[
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
            }
        }
    ],

    edges:[
        {
            from:{
                type:String,
                required:[true,'edge from is required']
            },
            to:{
                type:String,
                required:[true,'edge to is required']
            },
            type:{
                type:String,
                enum:['imports','calls','fetches'],
                required:[true,'type is required']
            }
        }
    ]
},{
    timestamps:true
})

graphSnapshot.index({repoId:1,sha:1})

export default mongoose.model('graphSnapshot',graphSnapshot)