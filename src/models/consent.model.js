import mongoose from "mongoose";

const consentSchema = new mongoose.Schema(
    {
        patientId:{
          type: mongoose.Schema.Types.ObjectId,
          ref : "Patient",
          required : true
        },
        doctorId:{
          type: mongoose.Schema.Types.ObjectId,
          ref : "Doctor",
          required : true
        },
        otp:{
          type : String,
          required : true
         },
        expiresAt:{
            type : Date,
            required : true
         },
        isUsed:{
            type : Boolean,
            default : false
        }
    },
    {
        timestamps: true
    }
)

const consent = mongoose.model("Consent",consentSchema);

export default consent;