import Prescription from "../models/prescription.model.js";
import MedicalCase from "../models/medicalCase.model.js";

const createPrescription = async (req,res) => {
    try{
       const {medicalCaseId,medicines} = req.body

       const medicalCase = await MedicalCase.findById(medicalCaseId);

       if(!medicalCase){
        return res.status(404).json({
            message : "Medical Case not found"
        })
       }
       
       const prescription = await Prescription.create({
         patientId : medicalCase.patientId,
         doctorId : req.doctor._id,
         medicalCaseId,
         medicines
       })

        return res.status(201).json({
          message: "Prescription Created Successfully",
          prescription,
        });

    }catch(error){
        console.error(error);

        return res.status(500).json({
            message : "Internal Server Error"
        })
    }
}

export { createPrescription };