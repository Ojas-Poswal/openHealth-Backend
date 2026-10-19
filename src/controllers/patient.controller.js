import Patient from "../models/patient.model.js"
import Otp, { issueOtp, generateOtp } from "../models/otp.model.js"
import { sendOtpEmail } from "../config/mailer.js"
import verifyGoogleCredential, { GOOGLE_CLIENT_ID } from "../config/google.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import crypto from "crypto"
import AuditLog from "../models/auditLog.model.js"
import Consent from "../models/consent.model.js";


const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const isValidEmail = (email) =>
    typeof email === "string" && EMAIL_PATTERN.test(email.trim())

const normaliseEmail = (email) => email.trim().toLowerCase()

const signPatientToken = (patient) =>
    jwt.sign(
        {
            patientID : patient._id,
            ohid : patient.ohid
        },
        process.env.JWT_SECRET,
        {
            expiresIn : "7d"
        }
    )

/**
 * Shapes a patient for a response.
 *
 * The hash never leaves the server, but the client is told whether one
 * *exists* — the Profile screen has to know whether to ask for the current
 * password or just a new one, and an account made through Google has none.
 */
const toPatientResponse = (patient) => {
    const plain = patient.toObject();

    delete plain.password;

    return {
        ...plain,
        hasPassword : Boolean(patient.password)
    }
}

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

    // Only fields that were actually sent go into the filter. An absent phone
    // becomes `undefined`, which Mongoose drops from the clause — leaving an
    // empty `$or` that matches *any* document and rejected every registration
    // with a false "already registered".
    const duplicateFilters = [{email : normalised}]

    if(phone) duplicateFilters.push({phone})

    const existingPatient = await Patient.findOne({
        $or : duplicateFilters
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
        patient : toPatientResponse(patient)
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

        // An account created through Google has no password to compare
        // against. Without this guard `bcrypt.compare` throws, and the catch
        // below turns a wrong-choice sign-in into a 500.
        if(!patient.password){
            return res.status(401).json({
                message : "This account signs in with Google"
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

        const token = signPatientToken(patient)

        return res.status(200).json({
            message : "Login Successful",
            token,
            patient : toPatientResponse(patient)
        })
    }catch(error){
        console.error(error);

        return res.status(500).json({
            message : "Internal Server Error"
        })
    }
}

/**
 * Sign in with Google.
 *
 * Google hands back a signed token carrying an address it has already verified
 * — the same guarantee the three-step registration flow exists to produce.
 * That is why an existing password account can be signed in through this route
 * without a password: the proof of the address is the whole gate.
 *
 * A first-time sign-in creates the account. It has no phone number and no
 * password, both of which the schema allows precisely for this case.
 */
const googleLogin = async (req,res) => {
    try{
        const {credential} = req.body;

        if(!GOOGLE_CLIENT_ID){
            return res.status(503).json({
                message : "Google sign-in is not configured on this server"
            })
        }

        const payload = await verifyGoogleCredential(credential)

        if(!payload){
            return res.status(401).json({
                message : "Google sign-in failed. Please try again"
            })
        }

        const email = normaliseEmail(payload.email)

        let patient = await Patient.findOne({
            $or : [{googleId : payload.sub},{email}]
        })

        if(patient){
            // An address can only ever be linked to one Google identity. If it
            // is already someone else's, this is not the same person — a
            // Workspace admin can delete and recreate an account at the same
            // address, and that must not hand over the health record with it.
            if(patient.googleId && patient.googleId !== payload.sub){
                return res.status(409).json({
                    message : "That email is already linked to a different Google account"
                })
            }

            if(!patient.googleId){
                patient.googleId = payload.sub;
                await patient.save();
            }
        }else{
            patient = await createGooglePatient(payload,email)

            if(!patient){
                return res.status(409).json({
                    message : "That email was just registered. Try signing in"
                })
            }
        }

        return res.status(200).json({
            message : "Login Successful",
            token : signPatientToken(patient),
            patient : toPatientResponse(patient)
        })
    }catch(error){
        console.error(error);

        return res.status(500).json({
            message : "Internal Server Error"
        })
    }
}

/**
 * The create half of the Google sign-in, separated so its duplicate-key case
 * can be answered instead of falling through to a 500. Two sign-ins for the
 * same new address — a double click, or two tabs — can both miss the lookup
 * above; the one that loses simply signs the winner in.
 */
const createGooglePatient = async (payload,email) => {
    try{
        return await Patient.create({
            ohid : `OH-${crypto.randomUUID()}`,
            // `name` is not guaranteed, and fullName is required and trimmed.
            fullName : payload.name || payload.given_name || email.split("@")[0],
            email,
            googleId : payload.sub
        })
    }catch(error){
        if(error?.code === 11000){
            return await Patient.findOne({email})
        }

        throw error
    }
}

const getPatientProfile = async (req,res)=>{

    const patient = await Patient.findById(
        req.patient.patientID
    )

    if(!patient){
        return res.status(404).json({
            message : "Patient not found"
        })
    }

    return res.status(200).json({
        message : "Profile fetched successfully",
        patient : toPatientResponse(patient),
    })
}

const updatePatientProfile = async (req,res)=>{
    const {fullName,phone,dateOfBirth,gender,bloodGroup,allergies} = req.body;

    const updates = {
        fullName,
        dateOfBirth,
        gender,
        bloodGroup,
        allergies
    }

    // Only a real number is written. An empty string is a real value as far as
    // the unique index is concerned, so storing one would collide with the
    // next account that has no phone number either.
    if(typeof phone === "string" && phone.trim()){
        updates.phone = phone.trim()
    }

    const patient = await Patient.findByIdAndUpdate(
        req.patient.patientID,
        updates,
        {
            new : true
        }
    )

    if(!patient){
        return res.status(404).json({
            message : "Patient not found"
        })
    }

    return res.status(200).json({
        message : "Profile Updated Successfully",
        patient : toPatientResponse(patient)
    })
}

const changePassword = async (req,res)=>{
    try{
        const {oldPassword,newPassword} = req.body;

        if(typeof newPassword !== "string" || !newPassword.trim()){
            return res.status(400).json({
                message : "Enter a new password"
            })
        }

        const patient = await Patient.findById(
            req.patient.patientID
        )

        if(!patient){
            return res.status(404).json({
                message : "Patient not found"
            })
        }

        // An account created through Google has no password to confirm. The
        // request is already authenticated by its own token, so this is where
        // it gains a first one.
        const hadPassword = Boolean(patient.password)

        if(hadPassword){
            const isPasswordCorrect = await bcrypt.compare(
                oldPassword,
                patient.password
            )

            if(!isPasswordCorrect){
                return res.status(401).json({
                    message : "Old password is incorrect"
                })
            }
        }

        const hashedPassword = await bcrypt.hash(
            newPassword,
            10
        )
        patient.password = hashedPassword

        await patient.save();

        return res.status(200).json({
            message : hadPassword
                ? "Password Changed successfully"
                : "Password set successfully"
        })
    }catch(error){
        console.error(error);

        return res.status(500).json({
            message : "Internal Server Error"
        })
    }
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

export {sendRegistrationOtp,verifyRegistrationOtp,registerPatient,loginPatient,googleLogin,getPatientProfile,updatePatientProfile,changePassword,forgotPassword,verifyOtp,resetPassword,getMyAuditLogs,revokeConsent,getMyConsents,getConsentRequests}