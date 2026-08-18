import Report from "../models/report.model.js"
import MedicalCase from "../models/medicalCase.model.js";


const createReport = async (req,res) => {
    try{
       const {medicalCaseId,reportName,reportType,fileUrl,fileType} = req.body

       const medicalCase = await MedicalCase.findById(medicalCaseId);

       if(!medicalCase){
        return res.status(404).json({
            message : "Medical Case not found"
        })
       }
       if(medicalCase.patientId.toString() !== req.patient.patientID){
        return res.status(403).json({
            message : "Access denied"
        })
       }

       const report = await Report.create({
        medicalCaseId,
        reportName,
        reportType,
        fileUrl,
        fileType,
        uploadedByType: "Patient",
        uploadedById: req.patient.patientID
       })

       return res.status(201).json({
        message : "Report Created",
        report
       })
    }catch(error){
      console.log(error)
      return res.status(500).json({
        message : "Internal Server Error"
      })
    }
}

const getReportsByMedicalCase = async (req,res) => {
  try{
     const {medicalCaseId} = req.params

    const medicalCase = await MedicalCase.findById(medicalCaseId);

    if(!medicalCase){
      return res.status(404).json({
        message : "Medical Case not available"
      });
    }
    if(medicalCase.patientId.toString() !== req.patient.patientID){
       return res.status(403).json({
        message:"Access denied"
       })
    }
    const reports = await Report.find({medicalCaseId})

    return res.status(200).json({
      message : "Reports fetched",
      reports
    })
  }catch(error){
    console.error(error)
    return res.status(500).json({
      message : "Internal Server Error"
    })
  }
}

export {createReport,getReportsByMedicalCase}