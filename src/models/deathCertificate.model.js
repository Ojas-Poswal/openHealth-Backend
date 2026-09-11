import mongoose from "mongoose"

const deathCertificateSchema = new mongoose.Schema({
    patientId:{
      type: mongoose.Schema.Types.ObjectId,
      ref:"Patient",
      required:true
    },
    uploadedBy:{
      type: mongoose.Schema.Types.ObjectId,
      ref:"Patient",
      required:true
    },
    fileUrl:{
      type:String,
      required:true
    },
    status:{
      type : String,
      enum : ["PENDING","APPROVED","REJECTED"],
      default : "PENDING"
    },
    remarks:{
      type : String,
      default : ""
    }
},
{
    timestamps:true
})

const DeathCertificate = mongoose.model("DeathCertificate",deathCertificateSchema)

export default DeathCertificate