import Report from "../models/report.model.js"
import MedicalCase from "../models/medicalCase.model.js";


const createReport = async (req,res) => {
    try{
       const {medicalCaseId,reportName,reportType} = req.body

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

       if (!req.file) {
        return res.status(400).json({
        message: "File is required",
        });
      }

       const report = await Report.create({
        medicalCaseId,
        reportName,
        reportType,
        fileUrl: req.file.path,
        fileType: req.file.originalname
           .split(".")
           .pop()
           .toLowerCase(),
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

const getReportById = async (req,res) => {
  try{

    const {reportId} = req.params

    const report = await Report.findById(reportId)

     if(!report){
      return res.status(404).json({
        message : "Report doesn't exist"
      })
    }

    

    const medicalCase = await MedicalCase.findById(
      report.medicalCaseId
    )

   

    if(medicalCase.patientId.toString() != req.patient.patientID){
      return res.status(403).json({
        message : "Access Denied"
      })
    }

    return res.status(200).json({
      message: "Report fetched",
      report
    });
    


  }catch(error){
    console.error(error);

    return res.status(500).json({
      message : "Internal Server Error"
    })
  }
}

const deleteReport = async (req,res) => {
   console.log("DELETE HIT");
  console.log(req.params);
  try{
    const {reportId} = req.params

    const report = await Report.findById(reportId)
    console.log("REPORT:", report);
    if(!report){
      return res.status(404).json({
        message: "Report Not Found"
      })
    }
    console.log(report.medicalCaseId);
    const medicalCase = await MedicalCase.findOne({
      _id: report.medicalCaseId,
    });
    console.log("MEDICALCASE:", medicalCase);

    console.log(MedicalCase.collection.name);

    if(!medicalCase){
      return res.status(404).json({
        message: "Medical case Not Found"
      })
    }

    if(
      medicalCase.patientId.toString() !== req.patient.patientID
    ){
      return res.status(403).json({
        message : "Access Denied"
      })
    }

    await Report.findByIdAndDelete(reportId)

    return res.status(200).json({
      message : "Report Deleted Successfully"
    })
  }catch(error){
    console.error(error);

    return res.status(500).json({
      message : "Internal Server Error"
    })
  }
}

const updateReport = async (req,res) => {
  try{
     const {reportId} = req.params;
     const {reportName,reportType} = req.body

     const report = await Report.findById(reportId)

     if(!report){
      return res.status(404).json({
        message : "Report not found"
      })
     }
     
     const medicalCase = await MedicalCase.findOne({
      _id: report.medicalCaseId,
     })

     if(!medicalCase){
       return res.status(404).json({
        message : "Medical Case not found"
      })
     }

      if (
      medicalCase.patientId.toString() !==
      req.patient.patientID
    ) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    if (reportName) report.reportName = reportName;
    if (reportType) report.reportType = reportType;

    await report.save();

    return res.status(200).json({
      message: "Report updated successfully",
      report,
    });

  }catch(error){
   console.error(error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

export {createReport,getReportsByMedicalCase,getReportById,deleteReport,updateReport}