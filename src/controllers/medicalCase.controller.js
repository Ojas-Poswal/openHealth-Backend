import MedicalCase from "../models/medicalCase.model.js";
import Patient from "../models/patient.model.js";

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

export {createMedicalCase,getMyMedicalCases}