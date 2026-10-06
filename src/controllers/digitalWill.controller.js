import DigitalWill from "../models/digitalWill.model.js";
import FamilyGroup from "../models/familyGroup.model.js";
import DeathCertificate from "../models/deathCertificate.model.js";

const defaultSections = [
    { title: "Personal Message" },
    { title: "Important Documents" },
    { title: "Insurance" },
    { title: "Emergency Contacts" },
    { title: "Bank Details" },
    { title: "Passwords" },
    { title: "Final Wishes" },
    { title: "Custom Notes" }
]

const createDigitalWill = async (req,res) => {
    try {
      const existingWill = await DigitalWill.findOne({
        patientId: req.patient.patientID
      });

      if(existingWill){
        return res.status(400).json({
            message : "Digital Will Already Exists"
        })
      }

      const digitalWill = await DigitalWill.create({
        patientId: req.patient.patientID,
        sections: defaultSections
      })

      return res.status(201).json({
        message : "Digital Will Created Successfully"
      })
    }catch(error){
        console.error(error);

        return res.status(500).json({
            message : "Internal Server Error"
        })
    }
}

const getMyDigitalWill = async (req,res) => {
    try{
      const digitalWill = await DigitalWill.findOne({
        patientId: req.patient.patientID
      })

      if(!digitalWill){
        return res.status(404).json({
            message : "Digital Will Does Not Exist"
        })
      }

      return res.status(200).json({
        digitalWill
      })
    }catch(error){
        console.error(error);

        return res.status(500).json({
            message : "Internal Server Error"
        })
    }
}

const updateSection = async (req, res) => {
    try {

        const { title, content, links } = req.body;

        const digitalWill = await DigitalWill.findOne({
            patientId: req.patient.patientID
        });

        if (!digitalWill) {
            return res.status(404).json({
                message: "Digital Will not found"
            });
        }

        const section = digitalWill.sections.find(
            sec => sec.title === title
        );

        if (!section) {
            return res.status(404).json({
                message: "Section not found"
            });
        }

        section.content = content ?? section.content;
        section.links = links ?? section.links;

        await digitalWill.save();

        return res.status(200).json({
            message: "Section updated successfully",
            digitalWill
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

const deleteDigitalWill = async (req, res) => {
    try {

        const digitalWill = await DigitalWill.findOneAndDelete({
            patientId: req.patient.patientID
        });

        if (!digitalWill) {
            return res.status(404).json({
                message: "Digital Will not found"
            });
        }

        return res.status(200).json({
            message: "Digital Will deleted successfully"
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

const getFamilyMemberDigitalWill = async (req,res) => {
    try{
      const {patientId} = req.params;

      const familyGroup = await FamilyGroup.findOne({
        "members.patientId": {
            $all: [
                req.patient.patientID,
                patientId
            ]
        }
      })

      if(!familyGroup){
        return res.status(403).json({
            message : "You are not authorized to view this Digital Will"
        })
      }

      const digitalWill = await DigitalWill.findOne({
         patientId
      })

      if(!digitalWill){
        return res.status(404).json({
            message : "Digital Will Does Not Exist"
        })
      }

        if (!digitalWill.isUnlocked) {
            return res.status(403).json({
                message: "Digital Will is locked"
            });
        }

      return res.status(200).json({
        message : "Digital Will fetched successfully",
        digitalWill
      })
    }catch(error){
        console.error(error);

        return res.status(500).json({
            message : "Internal Server Error"
        })
    }
}

const approveDeathCertificate = async (req, res) => {
    try {

        const { patientId } = req.body;

        const familyGroup = await FamilyGroup.findOne({
            "members.patientId": patientId,
            admins: req.patient.patientID
        });

        if (!familyGroup) {
            return res.status(403).json({
                message: "Only family admins can approve"
            });
        }

        const certificate = await DeathCertificate.findOne({
            patientId
        });

        if (!certificate) {
            return res.status(404).json({
                message: "Death Certificate not found"
            });
        }

        certificate.status = "APPROVED";

        await certificate.save();

        await DigitalWill.findOneAndUpdate(
            { patientId },
            { isUnlocked: true }
        );

        return res.status(200).json({
            message: "Death Certificate approved and Digital Will unlocked"
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

/**
 * Sections are keyed by title (see `updateSection`), so a title has to be
 * unique within one will or the wrong section would be written to.
 */
const addSection = async (req,res) => {
    try {
        const { title } = req.body;

        if(!title || !title.trim()){
            return res.status(400).json({
                message : "A section title is required"
            })
        }

        const cleanTitle = title.trim();

        const digitalWill = await DigitalWill.findOne({
            patientId: req.patient.patientID
        });

        if(!digitalWill){
            return res.status(404).json({
                message : "Digital Will not found"
            })
        }

        const exists = digitalWill.sections.some(
            section => section.title.toLowerCase() === cleanTitle.toLowerCase()
        )

        if(exists){
            return res.status(409).json({
                message : `You already have a section called "${cleanTitle}"`
            })
        }

        digitalWill.sections.push({ title : cleanTitle })

        await digitalWill.save()

        return res.status(201).json({
            message : "Section added successfully",
            digitalWill
        })
    }catch(error){
        console.error(error);

        return res.status(500).json({
            message : "Internal Server Error"
        })
    }
}

const deleteSection = async (req,res) => {
    try {
        const { title } = req.body;

        const digitalWill = await DigitalWill.findOne({
            patientId: req.patient.patientID
        });

        if(!digitalWill){
            return res.status(404).json({
                message : "Digital Will not found"
            })
        }

        const before = digitalWill.sections.length;

        digitalWill.sections = digitalWill.sections.filter(
            section => section.title !== title
        )

        if(digitalWill.sections.length === before){
            return res.status(404).json({
                message : "Section not found"
            })
        }

        await digitalWill.save()

        return res.status(200).json({
            message : "Section deleted successfully",
            digitalWill
        })
    }catch(error){
        console.error(error);

        return res.status(500).json({
            message : "Internal Server Error"
        })
    }
}

export {createDigitalWill,getMyDigitalWill,updateSection,addSection,deleteSection,deleteDigitalWill,getFamilyMemberDigitalWill,approveDeathCertificate}