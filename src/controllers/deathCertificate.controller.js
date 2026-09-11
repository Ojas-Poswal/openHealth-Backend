import DeathCertificate from "../models/deathCertificate.model.js";
import FamilyGroup from "../models/familyGroup.model.js";

const uploadDeathCertificate = async (req,res) => {
    try{
        const {patientId} = req.body

        if(!req.file){
            return res.status(400).json({
                message : "Death Certificate Is Required"
            })
        }

          const familyGroup = await FamilyGroup.findOne({
            "members.patientId": req.patient.patientID
          });

          if (!familyGroup) {
           return res.status(403).json({
           message: "Access Denied"
           });
        }

        const targetMemberExists = familyGroup.members.some(
         member => member.patientId.toString() === patientId
        );

        if (!targetMemberExists) {
          return res.status(403).json({
           message: "Patient is not in your family group"
         });
        }

        

        const existingCertificate = await DeathCertificate.findOne({
            patientId
        })

        if(existingCertificate){
             return res.status(400).json({
                message : "Death Certificate Already Uploaded"
            })
        }

        const deathCertificate = await DeathCertificate.create({
            patientId,
            uploadedBy:req.patient.patientID,
            fileUrl:req.file.path
        })

        return res.status(201).json({
            message: "Death certificate uploaded successfully",
            deathCertificate
        });


    }catch(error){
        console.error(error);

        return res.status(500).json({
            message : "Internal Server Error"
        })
    }
}

const getDeathCertificate = async (req, res) => {
    try {

        const { patientId } = req.params;

        const deathCertificate =
            await DeathCertificate.findOne({
                patientId
            });

        if (!deathCertificate) {
            return res.status(404).json({
                message: "Death certificate not found"
            });
        }

        return res.status(200).json({
            deathCertificate
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

export {uploadDeathCertificate,getDeathCertificate}