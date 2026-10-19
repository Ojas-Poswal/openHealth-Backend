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
            required : function(){ return !this.googleId },
            unique:true,
            sparse : true
        },
        password : {
            type : String,
            required : function(){ return !this.googleId }
        },
        registrationNumber : {
            type:String,
            // A doctor created through Google starts with no registration
            // number and is held out of every clinical route until they add
            // one. `sparse` matters as much here as it does on `phone`: the
            // unique index would otherwise allow only one such pending doctor.
            required : function(){ return !this.googleId },
            unique:true,
            sparse : true
        },
        // Set only by the Google path; absent for every password account.
        googleId : {
            type : String,
            unique : true,
            sparse : true
        },
        qualification : {
            type : String
        },
        specialization : {
            type : String
        },
        dhid : {
          type : String,
          unique : true
        },
        workplace : {
            type : String
        },
        resetOtp: {
          type: String
        },

        resetOtpExpiry: {
          type: Date
        }
    },
    {
        timestamps : true
    }
)
const Doctor = mongoose.model("Doctor",doctorSchema);

export default Doctor