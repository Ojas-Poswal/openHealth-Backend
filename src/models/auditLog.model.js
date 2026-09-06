import mongoose from "mongoose"

const auditLogSchema = new mongoose.Schema(
    {
        patientId : {
          type : mongoose.Schema.Types.ObjectId,
          ref : "Patient",
          required : true
        },
        doctorId : {
           type : mongoose.Schema.Types.ObjectId,
           ref : "Doctor",
           required : true
        },
        action : {
           type : String,
           required : true,
           enum : [
            "CONSENT_REQUESTED",
            "CONSENT_GRANTED",
            "TIMELINE_VIEWED",
            "SESSION_ENDED"
           ]
        }
    },
    {
        timestamps : true
    }
)

const AuditLog = mongoose.model("AuditLog",auditLogSchema);

export default AuditLog