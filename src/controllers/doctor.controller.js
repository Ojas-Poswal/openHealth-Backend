import Doctor from "../models/doctor.model.js"
import bcrypt from "bcrypt"

const registerDoctor = async (req,res)=>{
   try {
     const {
        fullName,
        email,
        phone,
        password,
        registrationNumber,
        qualification,
        specialization,
        workplace
     } = req.body;

     const existingDoctor = await Doctor.findOne({
        $or : [{email},{phone},{registrationNumber}]
     })

     if(existingDoctor){
        return res.status(409).json({
            message : "Doctor already exists"
        })
     }

     const hashedPassword = await bcrypt.hash(
        password,
        10
     )

     const doctor = await Doctor.create({
        fullName,
        email,
        phone,
        password,
        registrationNumber,
        qualification,
        specialization,
        workplace
     })

     return res.status(201).json({
        message : "Doctor registered successfully",
        doctor
     })
   }catch(error){
     console.error(error)

     return res.status(500).json({
        message : "Internal Server Error"
     })
   }
}

export {registerDoctor}