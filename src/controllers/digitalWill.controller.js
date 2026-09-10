import DigitalWill from "../models/digitalWill.model.js";

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

export {createDigitalWill,getMyDigitalWill,updateSection,deleteDigitalWill}