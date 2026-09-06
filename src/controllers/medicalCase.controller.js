import MedicalCase from "../models/medicalCase.model.js";
import Patient from "../models/patient.model.js";
import Report from "../models/report.model.js";
import DoctorNote from "../models/doctorNote.model.js";
import Prescription from "../models/prescription.model.js";

const createMedicalCase = async (req,res) => {
    try{
        const {diagnosis,verdict,finalAdvice} = req.body
        console.log(req.patient);

        const medicalCase = await MedicalCase.create({
            patientId : req.patient.patientID,
            diagnosis,
            verdict,
            finalAdvice
        })

        return res.status(201).json({
            message : "Medical case created",
            medicalCase
        })
            

        
    }catch(error){

       console.log(error)

        return res.status(500).json({
            message : "Internal server error"
        })
    }
    
}

const getMyMedicalCases = async (req,res) => {
    try{
       const medicalCases = await MedicalCase.find({
        patientId : req.patient.patientID,
       })
        return res.status(200).json({
          message : "Medical cases fetched successfully",
          medicalCases
        })
    }catch(error){
        console.log(error);
        return res.status(500).json({
            message : "Internal server error"
        })
    }
    
}

const getMedicalCaseByID = async (req,res) => {
    try{
        const {caseId} = req.params
        const medicalCase = await MedicalCase.findById(caseId)
        if(!medicalCase){
            return res.status(404).json({
                message : "Medical case not found"
            })
        }
        if(
            medicalCase.patientId.toString() !== req.patient.patientID
        ){
            return res.status(403).json({
                message : "Access denied"
            })
        }
        return res.status(200).json({
            message:"Fetched medical case",
            medicalCase
        })
    }catch(error){
        console.log(error)

        return res.status(500).json({
            message : "Internal Server Error"
        })
    }
}

const updateCaseStatus = async (req,res) => {
    try{
        const {caseId} = req.params
        const {status} = req.body

        if(!["active","resolved"].includes(status)){
            return res.status(400).json({
                message : "Invalid status"
            })
        }

        

        const medicalCase = await MedicalCase.findById(caseId);

        if(!medicalCase){
            return res.status(404).json({
                message : "Medical Case Not Found"
            })
           
        }
        if(medicalCase.patientId.toString() !== req.patient.patientID){
                return res.status(403).json({
                    message : "Access Denied"
                })
        }

        medicalCase.status = status

        await medicalCase.save()

        return res.status(200).json({
            message : "Medical Case Status Updated Successfully",
            medicalCase
        })

    }catch(error){
        console.error(error);
        return res.status(500).json({
            message : "Internal Server Error"
        })
    }
}

const getMyTimeline = async (req,res) => {
    try{
        const patientId = req.patient.patientID;

        const medicalCases = await MedicalCase.find({
            patientId
        }).sort({createdAt : -1});

        const timeline = await Promise.all(
            medicalCases.map(async (medicalCase) => {
                const reports = await Report.find({
                    medicalCaseId : medicalCase._id,
                })

                const doctorNotes = await DoctorNote.find({
                    reportId : { $in : reports.map(report => report._id)}
                })

                const prescriptions = await Prescription.find({
                    medicalCaseId : medicalCase._id
                }).sort({createdAt : -1})

                return {medicalCase,reports,doctorNotes,prescriptions};
            }) 
        )

        return res.status(200).json({
            message : "Timeline fetched successfully",
            timeline
        })

    }catch(error){
        console.error(error);
        return res.status(500).json({
            message : "Internal Server Error"
        })
    }
}

const getActiveCases = async (req,res) => {
    try{
       const activeCases = await MedicalCase.find({
        patientId : req.patient.patientID,
        status : "active"
    });
        return res.status(200).json({
            message : "Active cases fetched successfully",
            activeCases
        })
    }catch(error){
        console.log(error);
        return res.status(500).json({
            message : "Internal server error"
        })
    }
}

const getResolvedCases = async (req, res) => {
  try {
    const resolvedCases = await MedicalCase.find({
      patientId: req.patient.patientID,
      status: "resolved",
    });

    return res.status(200).json({
      message: "Resolved cases fetched successfully",
      resolvedCases,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export {createMedicalCase,getMyMedicalCases,getMedicalCaseByID,updateCaseStatus,getMyTimeline,getActiveCases,getResolvedCases}