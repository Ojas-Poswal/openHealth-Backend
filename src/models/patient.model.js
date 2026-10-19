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
            // Required of an email/password account, absent by design for one
            // created through Google. `sparse` keeps the unique index from
            // treating every missing phone as the same `null` value, which
            // would allow only the first Google account to exist.
            required : function(){ return !this.googleId },
            unique : true,
            sparse : true
        },
        password : {
            type : String,
            required : function(){ return !this.googleId },
        },
        // Set only by the Google path; absent for every password account.
        googleId : {
            type : String,
            unique : true,
            sparse : true
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
            required : true,
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