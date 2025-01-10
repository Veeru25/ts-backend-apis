// import express from 'express';
// // import mongoose from 'mongoose'

// import authRoutes from './routes/authRoutes';


// import dotenv from 'dotenv';
// dotenv.config();
// // import cors from 'cors';
// // import dotenv from 'dotenv';
// import connectDb from './config/db.Config';

// connectDb()
// const PORT = 6000;


// // const connectDb = async()=>{
// //     try {
// //         const connect = await mongoose.connect(`${process.env.MONGO_URI}`)
// //         console.log("Database Connected")
// //     } catch (error) {
// //         console.log(error)
// //     }
// // }

// // connectDb();

// const app = express();

// // app.get('/',(req,res)=>{
// //     res.send("Hello")
// // }


// app.use('/api/auth', authRoutes);

// app.get('/',(req,res)=>{
//     res.send("Hello")
// })

// app.listen(PORT,()=>{
//     console.log(`STARTED ${PORT}`)
// })

import express from 'express';
import authRoutes from './routes/authRoutes'; 
import userDetailsRoutes from './routes/userDetailsRoutes'
import connectDb from './config/db.Config';

const app = express();

app.use(express.json());
connectDb()

app.use('/auth', authRoutes);
app.use('/api',userDetailsRoutes)

app.listen(4000, () => {
  console.log('Server is running on http://localhost:4000');
});
