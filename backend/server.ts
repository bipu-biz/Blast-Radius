import dotenv from 'dotenv/config'
import app from './src/app.ts'

const port = process.env.PORT || 5000

app.listen(port,()=>{
    console.log(`running on port ${port}`)
})