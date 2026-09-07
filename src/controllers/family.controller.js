import FamilyGroup from "../models/familyGroup.model.js";
import { v4 as uuidv4 } from "uuid";

const createFamilyGroup = async (req, res) => {
  try {
    const { groupName, joinPolicy } = req.body;

    if (!groupName) {
      return res.status(400).json({
      message: "Group Name is required",
      });
    }

    const familyGroup = await FamilyGroup.create({
      groupName,
      joinPolicy,

      invitationCode: uuidv4(),

      admins: [req.patient.patientID],

      members: [
        {
          patientId: req.patient.patientID,
          relationship: "Self",
        },
      ],
    });

    return res.status(201).json({
      message: "Family Group Created Successfully",
      familyGroup,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const getMyGroups = async (req, res) => {
  try {

    const groups = await FamilyGroup.find({
      "members.patientId": req.patient.patientID
    });

    if (!groups || groups.length === 0) {
      return res.status(404).json({
        message: "No groups found for the patient"
      });
    }

    return res.status(200).json({
      message: "Groups fetched successfully",
      groups
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};

export { createFamilyGroup, getMyGroups };