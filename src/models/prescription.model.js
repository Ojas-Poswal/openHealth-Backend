import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema(
    {
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true,
        },
        doctorId: {
             type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
            required: true,
        },
        medicalCaseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "MedicalCase",
            required: true,  
        },
        medicines: [
            {
                medicine : {
                    type: String,
                    required: true,
                },
                dosage: {
                    type: String,
                    required: true,
                },
                frequency: {
                    type: String,
                    required: true,
                },
                duration: {
                    type: String,
                    required: true,
                },
                notes: {
                    type: String,
                }
            }
        ]
    },
    {
        timestamps: true,
    }
)

const Prescription = mongoose.model("Prescription", prescriptionSchema);

export default Prescription;