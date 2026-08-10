import dotenv from 'dotenv/config'
import app from './src/app'
import connectDB from './src/config/db'

const port = process.env.PORT || 5000

const startserver = async()=>{
    try{
        await connectDB()
        
        app.listen(port,()=>{
            console.log(`server running on port ${port}`)
        })
    }
    catch(error){
        console.log('server failed to start')
        process.exit(1)
    }
}

startserver()
