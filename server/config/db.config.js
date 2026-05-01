import mongoose from 'mongoose'

const connectDB = async () => {
    try { 
        mongoose.connection.on('connected', () => {
            console.log(`DB Connected || Host: ${mongoose.connection.host}`)
        })

        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: process.env.DB_NAME
        })
        
    } catch (error) {
        console.log('MongoDB Connection error : ', error.message);
    }
}

export default connectDB;