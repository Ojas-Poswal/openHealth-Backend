import jwt from "jsonwebtoken"

const verifyJWT = async (req,res,next)=>{
    try{
        const authHeader = req.header("Authorization")

        if(!authHeader){
            return res.status(401).json({
                message : "unauthorized request"
            })
        }
        const token = authHeader.split(" ")[1];

        const decodedToken = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.patient = decodedToken;
        console.log(decodedToken);

        next()
    }catch(error){
        return res.send(401).json({
            message : "Invalid Token"
        })
    }
}

export default verifyJWT;