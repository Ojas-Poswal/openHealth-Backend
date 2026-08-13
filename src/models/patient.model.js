import mongoose from "mongoose"

const patientSchema = new mongoose.Schema(
    {
        fullName : {
            type : String,
            required : true,
            trim : true
        },
        email : {
            type : String,
            required : true,
            unique : true,
            lowercase : true,
            trim : true
        },
        phone : {
            type : String,
            required : true,
            unique : true
        },
        password : {
            type : String,
            required : true,
        },
        dateOfBirth :{
            type : Date,
        },
        gender : {
            type : String,
            enum : ["male","female","other"]
        },
        bloodGroup : {
            type : String
        },
        allergies : [{
            type : String
        }],
        ohid : {
            type : String,
            unique : true
        },
        resetOtp: {
          type: String
        },

        resetOtpExpiry: {
          type: Date
        },
    },
    {
        timestamps : true
    }
    
)

const Patient = mongoose.model("Patient",patientSchema);

export default Patient;