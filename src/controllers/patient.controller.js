import Patient from "../models/patient.model.js"

const registerPatient = async (req,res)=>{
    const {fullName,email,phone,password} = req.body;
    
    const patient = await Patient.create({
        fullName,
        email,
        phone,
        password
    })
    res.status(201).json({
        message : "Patient Registered Successfully",
        patient
    })
}

export {registerPatient}