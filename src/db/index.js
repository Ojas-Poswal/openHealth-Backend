import mongoose from "mongoose"

const connectDB = async ()=>{
    try{
        const connectionInstance = await mongoose.connect(process.env.MONGODB_URI);
        console.log(
            `Mongodb connected: ${connectionInstance.connection.host} `
        )
    }catch(error){
        console.error("mongodb connection failes",error);
        process.exit(1);
    }
}

export default connectDB;