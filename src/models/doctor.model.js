import mongoose from "mongoose"

const doctorSchema = new mongoose.Schema(
    {
        fullName : {
            type:String,
            required:true,
            trim : true,
        },
        email : {
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true
        },
        phone : {
            type:String,
            required:true,
            unique:true
        },
        password : {
            type : String,
            required : true
        },
        registrationNumber : {
            type:String,
            required:true,
            unique:true
        },
        qualification : {
            type : String
        },
        specialization : {
            type : String
        },
        workplace : {
            type : String
        }
    },
    {
        timestamps : true
    }
)


const Doctor = mongoose.model("Doctor",doctorSchema);

export default Doctor