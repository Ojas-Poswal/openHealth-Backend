import Patient from "../models/patient.model.js"
import bcrypt from "bcrypt"

const registerPatient = async (req,res)=>{

    try{
        const {fullName,email,phone,password} = req.body;

    const existingPatient = await Patient.findOne({
        $or : [{email},{phone}]
    })

    if(existingPatient){
        return res.status(409).json({
            message : "Email or phone already registered"
        })
    }
    
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
    catch(error){
        console.error(error);
        return res.status(500).json({
            message : "Internal Server Error"
        })
    }
    
}

const loginPatient = async (req,res) => {
    res.json({
        message : "Login route Working"
    })
}

export {registerPatient,loginPatient}