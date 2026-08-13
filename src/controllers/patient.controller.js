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
    const {email} = req.body;

    const patient = await Patient.findOne({email})

    if(!patient){
        return res.status(404).json({
            message : "Patient not found"
        })
    }

    const otp = Math.floor(
        100000 + Math.random() * 900000
    ).toString()

    patient.resetOtp = otp;
    patient.resetOtpExpiry = Date.now( ) + 10*60*1000

    await patient.save()

    return res.status(200).json({
        message : "otp Generated successfully",
        otp
    })
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

export {registerPatient,loginPatient,getPatientProfile,updatePatientProfile,changePassword,forgotPassword,verifyOtp,resetPassword}