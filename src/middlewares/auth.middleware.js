import jwt from "jsonwebtoken"

const verifyJWT = async (req,resizeBy,next)=>{
    try{
        const token = req.header("Authorization")

        if(!token){
            return res.send(401).json({
                message : "Unauthorized request"
            })
        }

        const decodedToken = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.patient = decodedToken;

        next()
    }catch(error){
        return res.send(401).json({
            message : "Invalid Token"
        })
    }
}

export default verifyJWT;