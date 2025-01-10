import mongoose from 'mongoose'

import dotenv from 'dotenv';
dotenv.config();

const connectDb = async()=>{
    try {
        const connect = await mongoose.connect(`${process.env.MONGO_URI}`)
        console.log("Database Connected")
    } catch (error) {
        
    }
}

export default connectDb; 