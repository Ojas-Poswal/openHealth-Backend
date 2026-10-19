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

export default verifyDoctor