import Doctor from "../models/doctor.model.js"
import Otp, { issueOtp, generateOtp } from "../models/otp.model.js"
import { sendOtpEmail } from "../config/mailer.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import crypto from "crypto";
import Patient from "../models/patient.model.js";
import MedicalCase from "../models/medicalCase.model.js";
import Report from "../models/report.model.js";
import DoctorNote from "../models/doctorNote.model.js";
import Prescription from "../models/prescription.model.js";
import Consent from "../models/consent.model.js";
import AuditLog from "../models/auditLog.model.js";


const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const isValidEmail = (email) =>
    typeof email === "string" && EMAIL_PATTERN.test(email.trim())

const normaliseEmail = (email) => email.trim().toLowerCase()

/**
 * Step 1 of doctor registration — mirrors the patient flow exactly, so an
 * address is proven to exist before any doctor record is written.
 */
const sendDoctorRegistrationOtp = async (req,res) => {
    try{
        const {email} = req.body;

        if(!isValidEmail(email)){
            return res.status(400).json({
                message : "Enter a valid email address"
            })
        }

        const normalised = normaliseEmail(email)

        const existingDoctor = await Doctor.findOne({email : normalised})

        if(existingDoctor){
            return res.status(409).json({
                message : "That email is already registered. Try signing in instead"
            })
        }

        const otp = await issueOtp(normalised,"doctor-register")

        await sendOtpEmail({
            to : normalised,
            otp,
            purpose : "doctor-register"
        })

        return res.status(200).json({
            message : "Verification code sent to your email"
        })
    }catch(error){
        console.error(error);

        return res.status(500).json({
            message : "Internal Server Error"
        })
    }
}

/** Step 2: confirm the code arrived. */
const verifyDoctorRegistrationOtp = async (req,res) => {
    try{
        const {email,otp} = req.body;

        if(!isValidEmail(email)){
            return res.status(400).json({
                message : "Enter a valid email address"
            })
        }

        const pending = await Otp.findOne({
            email : normaliseEmail(email),
            purpose : "doctor-register"
        })

        if(!pending){
            return res.status(400).json({
                message : "Request a verification code for this email first"
            })
        }

        if(pending.expiresAt < Date.now()){
            return res.status(400).json({
                message : "That code has expired. Request a new one"
            })
        }

        if(pending.otp !== otp){
            return res.status(400).json({
                message : "Invalid OTP"
            })
        }

        pending.verified = true

        await pending.save()

        return res.status(200).json({
            message : "Email verified successfully"
        })
    }catch(error){
        console.error(error);

        return res.status(500).json({
            message : "Internal Server Error"
        })
    }
}

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
        workplace,
        otp
     } = req.body;

     if(!isValidEmail(email)){
        return res.status(400).json({
            message : "Enter a valid email address"
        })
     }

     const normalised = normaliseEmail(email)

     const pending = await Otp.findOne({
        email : normalised,
        purpose : "doctor-register"
     })

     if(!pending){
        return res.status(400).json({
            message : "Request a verification code for this email first"
        })
     }

     if(!pending.verified){
        return res.status(400).json({
            message : "Verify the code we emailed you before creating your account"
        })
     }

     if(pending.expiresAt < Date.now()){
        return res.status(400).json({
            message : "That code has expired. Request a new one"
        })
     }

     if(pending.otp !== otp){
        return res.status(400).json({
            message : "Invalid OTP"
        })
     }

     const existingDoctor = await Doctor.findOne({
        $or : [{email : normalised},{phone},{registrationNumber}]
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
        email : normalised,
        phone,
        password:hashedPassword,
        registrationNumber,
        qualification,
        specialization,
        dhid,
        workplace
     })

      await Otp.deleteOne({_id : pending._id})

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
        
        // Returned alongside the token so the client can show the doctor's
        // name immediately instead of painting a nameless header while
        // /doctors/profile is still in flight.
        const doctorResponse = await Doctor.findById(doctor._id).select("-password")

        return res.status(200).json({
            message : "Login Successfull",
            token,
            doctor : doctorResponse
        })
    }
    catch(error){
        console.error(error)
        return res.status(500).json({
            message : "Internal server error"
        })
    }

}

const forgotPassword = async (req,res) => {
    try{
        const {email} = req.body;

        if(!isValidEmail(email)){
            return res.status(400).json({
                message : "Enter a valid email address"
            })
        }

        const doctor = await Doctor.findOne({email : normaliseEmail(email)})

        if(!doctor){
            return res.status(404).json({
                message : "No doctor account is registered with that email"
            })
        }

        const otp = generateOtp()

        doctor.resetOtp = otp;
        doctor.resetOtpExpiry = Date.now() + 10*60*1000

        await doctor.save()

        await sendOtpEmail({
            to : doctor.email,
            otp,
            purpose : "doctor-reset",
            name : doctor.fullName
        })

        return res.status(200).json({
            message : "We emailed a reset code to that address"
        })
    }catch(error){
        console.error(error);

        return res.status(500).json({
            message : "Internal Server Error"
        })
    }
}

const verifyOtp = async (req,res) => {
    try{
        const {email,otp} = req.body;

        const doctor = await Doctor.findOne({email : normaliseEmail(email)})

        if(!doctor){
            return res.status(404).json({
                message : "Doctor not found"
            })
        }

        if(doctor.resetOtp !== otp){
            return res.status(400).json({
                message : "Invalid OTP"
            })
        }

        if(doctor.resetOtpExpiry < Date.now()){
            return res.status(400).json({
                message : "OTP expired"
            })
        }

        return res.status(200).json({
            message : "OTP verified successfully"
        })
    }catch(error){
        console.error(error);

        return res.status(500).json({
            message : "Internal Server Error"
        })
    }
}

const resetPassword = async (req,res) => {
    try{
        const {email,otp,newPassword} = req.body;

        const doctor = await Doctor.findOne({email : normaliseEmail(email)})

        if(!doctor){
            return res.status(404).json({
                message : "Doctor not found"
            })
        }

        if(doctor.resetOtp !== otp){
            return res.status(400).json({
                message : "Invalid OTP"
            })
        }

        if(doctor.resetOtpExpiry < Date.now()){
            return res.status(400).json({
                message : "OTP expired"
            })
        }

        doctor.password = await bcrypt.hash(newPassword,10)

        doctor.resetOtp = undefined;
        doctor.resetOtpExpiry = undefined;

        await doctor.save()

        return res.status(200).json({
            message : "Password reset successful"
        })
    }catch(error){
        console.error(error);

        return res.status(500).json({
            message : "Internal Server Error"
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

             const consent = await Consent.findOne({
                patientId,
                doctorId: req.doctor._id,
                isUsed: true,
                accessGranted: true,
             })

             if(!consent){
                return res.status(403).json({
                    message : "Access Denied"
                })
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

                   const prescriptions = await Prescription.find({
                       medicalCaseId: medicalCase._id
                    }).sort({ createdAt: -1 });
   
                   return {medicalCase,reports,doctorNotes,prescriptions};
               }) 
           )

           await AuditLog.create({
            patientId,
            doctorId: req.doctor._id,
            action: "TIMELINE_VIEWED",
           });
   
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

const requestConsent = async (req, res) => {
  try {
    const { patientId } = req.body;

    const patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({
        message: "Patient Not Found",
      });
    }

    const existingConsent = await Consent.findOne({
        patientId,
        doctorId: req.doctor._id,
        accessGranted: true
    });

    if(existingConsent){
       return res.status(400).json({
       message: "Active session already exists"
     });
    }

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const expiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );

    await Consent.create({
      patientId,
      doctorId: req.doctor._id,
      otp,
      expiresAt,
    });

     await AuditLog.create({
        patientId,
        doctorId: req.doctor._id,
        action: "CONSENT_REQUESTED",
     })
    // The code belongs to the patient — they are the one who decides whether
    // to read it out, so it is deliberately NOT returned here. It reaches
    // them through GET /patients/consent-requests instead.
    return res.status(201).json({
      message: "Consent requested — a code is now waiting in the patient's portal",
      doctorName: req.doctor.fullName,
      dhid: req.doctor.dhid,
      expiresAt,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const verifyConsent = async (req,res) => {
    try{
      const {patientId,otp} = req.body;

      const consent = await Consent.findOne({
        patientId,
        doctorId : req.doctor._id,
        otp,
        isUsed : false,
      });

      if(!consent){
        return res.status(404).json({
            message : "Invalid OTP"
        })
      }

      if(consent.expiresAt < Date.now()){
        return res.status(400).json({
            message : "OTP Expired"
        })
      }

      consent.isUsed = true;
      consent.accessGranted = true;
      await consent.save();

      await AuditLog.create({
       patientId,
       doctorId: req.doctor._id,
       action: "CONSENT_GRANTED",
     });

      return res.status(200).json({
        message: "Consent Verified Successfully"
      });


    }catch(error){
        console.error(error);
        return res.status(500).json({
            message : "Internal Server Error"
        })
    }
}

const endSession = async (req,res) => {
    try{
        const {patientId} = req.body;

        const consent = await Consent.findOne({
            patientId,
            doctorId : req.doctor._id,
            accessGranted : true
        })

        if(!consent){
            return res.status(404).json({
                message : "No active session found"
            })
        }
        consent.accessGranted = false;
        await consent.save();

        await AuditLog.create({
         patientId,
         doctorId: req.doctor._id,
         action: "SESSION_ENDED",
        });

        return res.status(200).json({
            message : "Session Ended Successfully"
        })
    }catch(error){
        console.error(error);
        return res.status(500).json({
            message : "Internal Server Error"
        })
    }
}

const getActiveSessions = async (req,res) => {
  try {

    const sessions = await Consent.find({
      doctorId: req.doctor._id,
      accessGranted: true
    })
    .populate(
      "patientId",
      "fullName ohid"
    )
    .sort({createdAt:-1});

    return res.status(200).json({
      message: "Active sessions fetched successfully",
      sessions
    });

  } catch(error) {

    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error"
    });

  }
}

/**
 * Every patient this doctor has ever opened, newest first.
 *
 * The point of this is practical: a doctor should not have to ask the patient
 * for their OHID again just to reopen a record they already hold consent for.
 */
const getAccessedPatients = async (req,res) => {
  try {

    const logs = await AuditLog.find({
      doctorId: req.doctor._id
    })
    .populate("patientId","fullName ohid")
    .sort({ createdAt: -1 });

    // Matches the guard `getPatientTimeline` applies, so the flag means the
    // same thing on the client as it does on the server.
    const activeSessions = await Consent.find({
      doctorId: req.doctor._id,
      isUsed: true,
      accessGranted: true
    }).select("patientId");

    const activeIds = new Set(
      activeSessions.map(session => session.patientId.toString())
    );

    const byPatient = new Map();

    logs.forEach(log => {
      const patient = log.patientId;

      if(!patient) return;

      const id = patient._id.toString();

      if(!byPatient.has(id)){
        byPatient.set(id,{
          patient : {
            _id : patient._id,
            fullName : patient.fullName,
            ohid : patient.ohid
          },
          lastAccessedAt : log.createdAt,
          events : 0,
          actions : {},
          hasActiveSession : activeIds.has(id)
        });
      }

      const entry = byPatient.get(id);

      entry.events += 1;
      entry.actions[log.action] = (entry.actions[log.action] ?? 0) + 1;
    });

    return res.status(200).json({
      message : "Accessed patients fetched successfully",
      patients : [...byPatient.values()]
    });

  } catch(error) {

    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error"
    });

  }
}

/** The doctor's own chronological audit trail, optionally for one patient. */
const getDoctorAuditLogs = async (req,res) => {
  try {

    const { patientId } = req.query;

    const filter = { doctorId : req.doctor._id };

    if(patientId) filter.patientId = patientId;

    const logs = await AuditLog.find(filter)
      .populate("patientId","fullName ohid")
      .sort({createdAt:-1});

    return res.status(200).json({
      message: "Audit logs fetched successfully",
      logs
    });

  } catch(error) {

    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error"
    });

  }
}

export {sendDoctorRegistrationOtp,verifyDoctorRegistrationOtp,registerDoctor,loginDoctor,getDoctorProfile,changePassword,updateProfile,searchPatientByOHID,getPatientTimeline,requestConsent,verifyConsent,endSession,getActiveSessions,forgotPassword,verifyOtp,resetPassword,getAccessedPatients,getDoctorAuditLogs}