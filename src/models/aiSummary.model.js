import mongoose from "mongoose"

const aiSummarySchema = new mongoose.Schema({
    patientId: {
      type : mongoose.Schema.Types.ObjectId,
      ref : "Patient",
      required : true,
      uniquie : true
    },
    generatedAt: {
      type : Date,
      default : Date.now
    },
    summary: {
      type : String,
      required : true
    }
},  
   {
    timestamps: true
})

const AISummary = mongoose.model(
    "AI Summary",
    aiSummarySchema
)  

export default AISummary