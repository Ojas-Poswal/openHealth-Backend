import Patient from "../models/patient.model.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken" 


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
    try{
        const {email,password} = req.body;

        const patient = await Patient.findOne({email});

        if(!patient){
            return res.status(401).json({
                message : "Invalid Credentials"
            })
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,patient.password
        );
        if(!isPasswordCorrect){
            return res.status(401).json({
                message : "Invalid Credentials"
            })
        }
        
        const token = jwt.sign(
            {
                patientID : patient._id,
                ohid : patient.ohid
            },
            process.env.JWT_SECRET,
            {
                expiresIn : "7d"
            }
        )

        return res.status(200).json({
            message : "Login Successful",
            token
        })
    }catch(error){
        console.error(error);

        return res.status(500).json({
            message : "Internal Server Error"
        })
    }
}

const getPatientProfile = async (req,res)=>{

    const patient = await Patient.findById(
        req.patient.patientID
    ).select("-password")

    return res.status(200).json({
        message : "Profile fetched successfully",
        patient,
    })
}

export {registerPatient,loginPatient,getPatientProfile}