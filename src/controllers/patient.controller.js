import Patient from "../models/patient.model.js"
import Otp, { issueOtp, generateOtp } from "../models/otp.model.js"
import { sendOtpEmail } from "../config/mailer.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import crypto from "crypto"
import AuditLog from "../models/auditLog.model.js"
import Consent from "../models/consent.model.js";


const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const isValidEmail = (email) =>
    typeof email === "string" && EMAIL_PATTERN.test(email.trim())

const normaliseEmail = (email) => email.trim().toLowerCase()

/**
 * Step 1 of registration: prove the address exists before an account is made.
 *
 * The code is emailed, never returned — receiving it is the only proof that
 * the address is real, which is why a typo simply cannot get past this step.
 */
const sendRegistrationOtp = async (req,res) => {
    try{
        const {email} = req.body;

        if(!isValidEmail(email)){
            return res.status(400).json({
                message : "Enter a valid email address"
            })
        }

        const normalised = normaliseEmail(email)

        const existingPatient = await Patient.findOne({email : normalised})

        if(existingPatient){
            return res.status(409).json({
                message : "That email is already registered. Try signing in instead"
            })
        }

        const otp = await issueOtp(normalised,"patient-register")

        await sendOtpEmail({
            to : normalised,
            otp,
            purpose : "patient-register"
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

/** Step 2: confirm the code actually arrived in the patient's inbox. */
const verifyRegistrationOtp = async (req,res) => {
    try{
        const {email,otp} = req.body;

        if(!isValidEmail(email)){
            return res.status(400).json({
                message : "Enter a valid email address"
            })
        }

        const pending = await Otp.findOne({
            email : normaliseEmail(email),
            purpose : "patient-register"
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

/** Step 3: the profile itself, which now requires the verified code. */
const registerPatient = async (req,res)=>{

    try{
        const {fullName,email,phone,password,otp} = req.body;

    if(!isValidEmail(email)){
        return res.status(400).json({
            message : "Enter a valid email address"
        })
    }

    const normalised = normaliseEmail(email)

    const pending = await Otp.findOne({
        email : normalised,
        purpose : "patient-register"
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

    const existingPatient = await Patient.findOne({
        $or : [{email : normalised},{phone}]
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
        email : normalised,
        phone,
        password : hashedPassword
    })

    await Otp.deleteOne({_id : pending._id})

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

        const patientResponse = await Patient.findById(patient._id).select("-password")

        return res.status(200).json({
            message : "Login Successful",
            token,
            patient : patientResponse
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

const updatePatientProfile = async (req,res)=>{
    const {fullName,phone,dateOfBirth,gender,bloodGroup,allergies} = req.body;

    const patient = await Patient.findByIdAndUpdate(
        req.patient.patientID,
        {
            fullName,
            phone,
            dateOfBirth,
            gender,
            bloodGroup,
            allergies
        },
        {
            new : true
        }
    ).select("-password")

    return res.status(200).json({
        message : "Profile Updated Successfully",
        patient
    })
}

const changePassword = async (req,res)=>{
    const {oldPassword,newPassword} = req.body;
    const patient = await Patient.findById(
        req.patient.patientID
    )

    const isPasswordCorrect = await bcrypt.compare(
        oldPassword,
        patient.password
    )

    if(!isPasswordCorrect){
        return res.status(401).json({
            message : "Old password is incorrect"
        })
    }
    const hashedPassword = await bcrypt.hash(
        newPassword,
        10
    )
    patient.password = hashedPassword

    await patient.save();

    return res.status(200).json({
        message : "Password Changed successfully"
    })
}

const forgotPassword = async (req,res)=>{
    try{
        const {email} = req.body;

        if(!isValidEmail(email)){
            return res.status(400).json({
                message : "Enter a valid email address"
            })
        }

        const patient = await Patient.findOne({email : normaliseEmail(email)})

        if(!patient){
            return res.status(404).json({
                message : "No patient account is registered with that email"
            })
        }

        const otp = generateOtp()

        patient.resetOtp = otp;
        patient.resetOtpExpiry = Date.now( ) + 10*60*1000

        await patient.save()

        await sendOtpEmail({
            to : patient.email,
            otp,
            purpose : "patient-reset",
            name : patient.fullName
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

    const { email, otp } = req.body;

    const patient = await Patient.findOne({ email });

    if(!patient){
        return res.status(404).json({
            message : "Patient not found"
        });
    }

    if(patient.resetOtp !== otp){
        return res.status(400).json({
            message : "Invalid OTP"
        });
    }

    if(patient.resetOtpExpiry < Date.now()){
        return res.status(400).json({
            message : "OTP expired"
        });
    }

    return res.status(200).json({
        message : "OTP verified successfully"
    });
}

const resetPassword = async (req,res) => {

    const { email, otp, newPassword } = req.body;

    const patient = await Patient.findOne({ email });

    if(!patient){
        return res.status(404).json({
            message : "Patient not found"
        });
    }

    if(patient.resetOtp !== otp){
        return res.status(400).json({
            message : "Invalid OTP"
        });
    }

    if(patient.resetOtpExpiry < Date.now()){
        return res.status(400).json({
            message : "OTP expired"
        });
    }

    const hashedPassword = await bcrypt.hash(
        newPassword,
        10
    );

    patient.password = hashedPassword;

    patient.resetOtp = undefined;
    patient.resetOtpExpiry = undefined;

    await patient.save();

    return res.status(200).json({
        message : "Password reset successful"
    });
}

const getMyAuditLogs = async (req,res) => {
  try {

    const logs = await AuditLog.find({
      patientId: req.patient.patientID
    })
    .populate("doctorId", "fullName dhid")
    .sort({ createdAt: -1 });

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

const getMyConsents = async (req,res) => {
  try {

    const consents = await Consent.find({
      patientId: req.patient.patientID
    })
    .populate("doctorId","fullName dhid specialization")
    .sort({createdAt:-1});

    return res.status(200).json({
      message: "Consents fetched successfully",
      consents
    });

  } catch(error) {

    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error"
    });

  }
}

const revokeConsent = async (req, res) => {
  try {
    const { doctorId } = req.body;

    const consent = await Consent.findOne({
      patientId: req.patient.patientID,
      doctorId,
      accessGranted: true,
    });

    if (!consent) {
      return res.status(404).json({
        message: "No Active Consent Found",
      });
    }

    consent.accessGranted = false;

    await consent.save();

    return res.status(200).json({
      message: "Consent Revoked Successfully",
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

/**
 * The codes a doctor is currently waiting on.
 *
 * A doctor requesting consent mints a one-time code, and it belongs to the
 * patient — they are the one who decides whether to read it out. The doctor
 * never receives it, so this is the only place the code is ever visible.
 */
const getConsentRequests = async (req,res) => {
  try {

    const requests = await Consent.find({
      patientId: req.patient.patientID,
      isUsed: false,
      accessGranted: false,
      expiresAt: { $gt : new Date() }
    })
    .populate("doctorId","fullName dhid specialization workplace")
    .sort({createdAt:-1});

    return res.status(200).json({
      message: "Consent requests fetched successfully",
      requests
    });

  } catch(error) {

    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error"
    });

  }
}

export {sendRegistrationOtp,verifyRegistrationOtp,registerPatient,loginPatient,getPatientProfile,updatePatientProfile,changePassword,forgotPassword,verifyOtp,resetPassword,getMyAuditLogs,revokeConsent,getMyConsents,getConsentRequests}