import Doctor from "../models/doctor.model.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import crypto from "crypto";
import Patient from "../models/patient.model.js";
import MedicalCase from "../models/medicalCase.model.js";
import Report from "../models/report.model.js";
import DoctorNote from "../models/doctorNote.model.js";

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

const getDoctorProfile = async (req,res)=>{
    return res.status(200).json({
        message : "Doctor's profile fetched successfully",
        doctor : req.doctor
    })
}

const changePassword = async (req,res) => {
   
   try{
    const {oldPassword,newPassword} = req.body;

    const doctor = await Doctor.findById(req.doctor._id);

    if(!doctor){
        return res.status(404).json({
            message : "Doctor does not exist"
        })
    }

    
   const isPasswordCorrect = await bcrypt.compare(
    oldPassword,
    doctor.password
   );

   if (!isPasswordCorrect) {
    return res.status(401).json({
    message: "Old password is incorrect"
   });
  }

   const hashedPassword = await bcrypt.hash(newPassword,10);

   doctor.password = hashedPassword;
   await doctor.save();
    

    return res.status(200).json({
        message : "Password Updated Successfully"
    })

   }catch(error){
     console.error(error);

     return res.status(500).json({
        message : "Internal Server Error"
     })
   }

}

const updateProfile = async (req,res) => {
    
  try{
    
     const {
        fullName,
        phone,
        qualification,
        specialization,
        workplace
     } = req.body;

     

     const doctor = await Doctor.findById(req.doctor._id);

     console.log(req.doctor);

     if(!doctor){
        return res.status(404).json({
            message : "Doctor Not Found"
        })
     }

     if(fullName) doctor.fullName = fullName;
     if(phone) doctor.phone = phone;
     if(qualification) doctor.qualification = qualification;
     if(specialization) doctor.specialization = specialization;
     if(workplace) doctor.workplace = workplace;

     await doctor.save();

     return res.status(200).json({
        message : "Profile Updated Successfully",
        doctor,
     })

  }catch(error){
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

const searchPatientByOHID = async (req,res) => {
    console.log("SEARCH HIT");
    try{
      const {ohid} = req.params;

      const patient = await Patient.findOne({ohid})

      if(!patient){
        return res.status(404).json({
            message : "Patient Not Found"
        })
      }
      return res.status(200).json({
        message : "Patient Fetched Successfully",
        patient
      })
    }catch(error){
        console.log(error);
        return res.status(500).json({
            message : "Internal Server Error"
        })
    }
}

const getPatientTimeline = async (req,res) => {
   try{
           const { patientId } = req.params;

            const patient = await Patient.findById(patientId);

             if (!patient) {
                 return res.status(404).json({
                 message: "Patient not found",
                 });
             }
   
           const medicalCases = await MedicalCase.find({
               patientId
           }).sort({createdAt : -1});

            
   
           const timeline = await Promise.all(
               medicalCases.map(async (medicalCase) => {
                   const reports = await Report.find({
                       medicalCaseId : medicalCase._id,
                   })
   
                   const doctorNotes = await DoctorNote.find({
                       reportId : { $in : reports.map(report => report._id)}
                   })
   
                   return {medicalCase,reports,doctorNotes};
               }) 
           )
   
           return res.status(200).json({
               message : "Timeline fetched successfully",
               timeline
           })
   
       }catch(error){
           console.error(error);
           return res.status(500).json({
               message : "Internal Server Error"
           })
       }
}
export {registerDoctor,loginDoctor,getDoctorProfile,changePassword,updateProfile,searchPatientByOHID,getPatientTimeline}