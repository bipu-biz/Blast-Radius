import mongoose from "mongoose";

const connectDB = async() => {
    try{
        const connection = await mongoose.connect(process.env.MONGO_URI as string)
        console.log(`mongodb is connected to host: ${connection.connection.host}`)
    }
    catch(error){
        console.log('mongodb failed to connect',error)
        process.exit(1)
    }
}

export default connectDB