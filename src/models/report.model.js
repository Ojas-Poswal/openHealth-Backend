import mongoose from "mongoose"

const reportSchema = new mongoose.Schema(
    {
        medicalCaseId:{
            type:mongoose.Schema.Types.ObjectId,
            ref: "MedicalCase",
            required : true
        },
        reportName:{
            type:String,
            required : true,
            trim:true
        },
        reportType:{
            type:String,
            required:true,
            enum : ["Blood Test","MRI","X-Ray","CT-Scan","Ultrasound","Prescription","Other"],
            trim:true
        },
        fileUrl:{
            type:String,
            required:true
        },
        fileType:{
            type:String,
            required:true,
            enum : ["pdf","jpeg","jpg","png"]

        },
        uploadedByType:{
            type : String,
            required:true,
            enum : ["Patient","Doctor","Lab"]
        },
        uploadedById:{
            type : mongoose.Schema.Types.ObjectId,
            required : true
        },
    },
    {
        timestamps : true
    }
)

const Report = mongoose.model("Report",reportSchema)

export default Report;