import DoctorNote from "../models/doctorNote.model.js";
import Report from "../models/report.model.js"
import MedicalCase from "../models/medicalCase.model.js";
import Consent from "../models/consent.model.js";

const createDoctorNote = async (req,res) => {
    try{
        const {reportId,note} = req.body;
        const report = await Report.findById(reportId);

        if(!report){
            return res.status(404).json({
                message : "Report not found"
            })
        }

        const medicalCase = await MedicalCase.findById(report.medicalCaseId);

        if(!medicalCase){
            return res.status(404).json({
                message : "Medical Case not found"
            })
        }

        // A note hangs off a report, so the patient has to be resolved through
        // the case before consent can be checked — same gate as the timeline.
        const consent = await Consent.findOne({
            patientId : medicalCase.patientId,
            doctorId : req.doctor._id,
            isUsed : true,
            accessGranted : true
        })

        if(!consent){
            return res.status(403).json({
                message : "Access Denied"
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
