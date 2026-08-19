import DoctorNote from "../models/doctorNote.model.js";
import Report from "../models/report.model.js"

const createDoctorNote = async (req,res) => {
    try{
        const {reportId,note} = req.body;
        const report = await Report.findById(reportId);

        if(!report){
            return res.status(404).json({
                message : "Report not found"
            })
        }

        const doctorNote = await DoctorNote.create({
            reportId,
            doctorId:req.doctor._id,
            note
        })

        return res.status(201).json({
            message : "Doctor note created",
            doctorNote
        })

    }catch(error){
        console.error(error)

        return res.status(500).json({
            message : "Internal server error"
        })

    }
}

export {createDoctorNote}