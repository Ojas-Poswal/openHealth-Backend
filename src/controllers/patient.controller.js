import Patient from "../models/patient.model.js"
import bcrypt from "bcrypt"

const registerPatient = async (req,res)=>{
    const {fullName,email,phone,password} = req.body;
    
    const hashedPassword = await bcrypt.hash(password,10)

    const ohid = `OH-${crypto.randomUUID()}`

    const patient = await Patient.create({
        ohid,
        fullName,
        email,
        phone,
        password : hashedPassword
    })
    res.status(201).json({
        message : "Patient Registered Successfully",
        patient
    })
}

export {registerPatient}