import mongoose from "mongoose"

/**
 * One-time codes issued before an account exists.
 *
 * Registration has to prove the email address before a Patient or Doctor
 * document is written, so the code cannot live on either model the way the
 * password-reset code does. It gets its own short-lived collection instead,
 * and Mongo drops the document automatically once it expires.
 */
const otpSchema = new mongoose.Schema(
    {
        email : {
            type : String,
            required : true,
            lowercase : true,
            trim : true
        },
        otp : {
            type : String,
            required : true
        },
        purpose : {
            type : String,
            required : true,
            enum : ["patient-register","doctor-register"]
        },
        verified : {
            type : Boolean,
            default : false
        },
        expiresAt : {
            type : Date,
            required : true
        }
    },
    {
        timestamps : true
    }
)

otpSchema.index({ expiresAt : 1 }, { expireAfterSeconds : 0 })
otpSchema.index({ email : 1, purpose : 1 })

const Otp = mongoose.model("Otp",otpSchema)

const OTP_TTL_MS = 10 * 60 * 1000

/** Six digits — the same shape the existing password-reset flow uses. */
const generateOtp = () =>
    Math.floor(100000 + Math.random() * 900000).toString()

/**
 * Issues a fresh code, clearing any earlier one for the same email and
 * purpose so only the most recent code is ever valid.
 */
const issueOtp = async (email, purpose) => {
    const otp = generateOtp()

    await Otp.deleteMany({ email, purpose })

    await Otp.create({
        email,
        otp,
        purpose,
        expiresAt : Date.now() + OTP_TTL_MS
    })

    return otp
}

export { generateOtp, issueOtp, OTP_TTL_MS }
export default Otp
