import mongoose from "mongoose"

const doctorNoteSchema = new mongoose.Schema(
    {
        reportId: {
            type : mongoose.Schema.Types.ObjectId,
            ref: "Report",
            required : true
        },
        doctorId : {
            type : mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
            required : true
        },
        note:{
            type : String,
            required : true,
            trim : true
        }
    },
    {
        timestamps : true
    }
)

const DoctorNote = mongoose.model("DoctorNote",doctorNoteSchema)

export default DoctorNote