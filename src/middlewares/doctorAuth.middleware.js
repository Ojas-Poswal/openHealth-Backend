import jwt from "jsonwebtoken"
import Doctor from "../models/doctor.model.js"

const verifyDoctor = async (req,res,next) => {
    try{

        const authHeader = req.headers.authorization

        if(!authHeader || !authHeader.startsWith("Bearer ")){
            return res.status(401).json({
                message : "Access denied"
            })
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        )

        const doctor = await Doctor.findById(decoded.doctorId).select("-password")

        if(!doctor){
            return res.status(404).json({
                message : "Doctor not found"
            })
        }
        req.doctor = doctor;
        
        next();

    }catch(error){
        console.error(error)
        return res.status(401).json({
            message : "Invalid Token"
        })
    }
}

/**
 * Holds an incomplete doctor account out of every clinical route.
 *
 * An account created through Google starts with no registration number. Google
 * proves the person owns the address — the same thing the emailed OTP proves —
 * but says nothing about who they are, so the registration number is still
 * owed before the account can look at anyone's records. A doctor with none can
 * reach their own profile and nothing else, which is where they supply it.
 */
const requireCompleteProfile = (req,res,next) => {
    if(!req.doctor.registrationNumber){
        return res.status(403).json({
            message : "Add your registration number to your profile to continue"
        })
    }

    next()
}

export { requireCompleteProfile }
export default verifyDoctor