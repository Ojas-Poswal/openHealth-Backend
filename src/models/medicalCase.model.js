import mongoose from "mongoose"

const medicalCaseSchema = new mongoose.Schema(
    {
        patientId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Patient",
            required : true,
        },
        diagnosis : {
            type : String,
            required : true,
            trim : true
        },
        reports : [
            {
              reportName : String,
              reportUrl : String,
              reportType : String,
              uploadedBy : String,
              uploadedByRole : String,
              uploadedAt : {
                  type : Date,
                  default : Date.now
               }
           }
        ],
        prescriptions : [
            {
                medicine : String,
                dosage : String,
                frequency : String,
                duration : String,
                notes: String
            }
        ],
        doctors : [
            {
                type : mongoose.Schema.Types.ObjectId,
                ref : "Doctor"
            }
        ],
        verdict : {
            type : String
        },
        finalAdvice : {
            type : String
        },
        status : {
            type : String,
            enum : ["active","resolved"],
            default : "active"
        },
        tags : [String],

        diagnosedAt : {
           type : Date,
           default : Date.now
        },
        resolvedAt : {
           type : Date
        }
    },
    {
        timestamps: true
    }
)

const MedicalCase = mongoose.model(
    "MedicalCase",
    medicalCaseSchema
)

export default MedicalCase