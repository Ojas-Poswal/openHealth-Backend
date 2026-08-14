import Doctor from "../models/doctor.model.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import crypto from "crypto";

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
     const dhid = `DH-${crypto.randomUUID()}`;

     const doctor = await Doctor.create({
        fullName,
        email,
        phone,
        password:hashedPassword,
        registrationNumber,
        qualification,
        specialization,
        dhid,
        workplace
     })
     
      const doctorResponse = await Doctor.findById(
       doctor._id
       ).select("-password");

       return res.status(201).json({
          message : "Doctor registered successfully",
          doctor : doctorResponse
        });
   }catch(error){
     console.error(error)

     return res.status(500).json({
        message : "Internal Server Error"
     })
   }
}

const loginDoctor = async (req,res)=>{

    try{
        const {email,password} = req.body;

        const doctor = await Doctor.findOne({email})

        if(!doctor){
            return res.status(401).json({
               message : "Invalid credentials"
            })
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,doctor.password
        )

        if(!isPasswordCorrect){
            return res.status(401).json({
               message : "Invalid Credentials"
            })
        }

        const token = jwt.sign(
            {
                doctorId : doctor._id,
                dhid : doctor.dhid
            },
            process.env.JWT_SECRET,
            {
              expiresIn : "7d"
            }
                
            
        )
        
        return res.status(200).json({
            message : "Login Successfull",
            token
        })
    }
    catch(error){
        console.error(error)
        return res.status(500).json({
            message : "Internal server error"
        })
    }
    
}

export {registerDoctor,loginDoctor}