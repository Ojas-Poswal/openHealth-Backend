import FamilyGroup from "../models/familyGroup.model.js";
import FamilyInvite from "../models/familyInvite.model.js";
import { v4 as uuidv4 } from "uuid";
import Patient from "../models/patient.model.js";


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

const inviteMember = async (req, res) => {
  try {
    const { groupId, ohid, relationship } = req.body;

    const familyGroup = await FamilyGroup.findById(groupId);

    if (!familyGroup) {
      return res.status(404).json({
        message: "Family Group not found",
      });
    }

    const isAdmin = familyGroup.admins.some(
      (admin) => admin.toString() === req.patient.patientID
    );

    if (!isAdmin) {
      return res.status(403).json({
        message: "Only admins can invite members",
      });
    }

    const patient = await Patient.findOne({
      ohid,
    });

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found",
      });
    }

    const existingInvite = await FamilyInvite.findOne({
      groupId,
      invitedPatientId: patient._id,
      status: "PENDING",
    });

    if (existingInvite) {
      return res.status(400).json({
        message: "Invite already pending",
      });
    }

    const invite = await FamilyInvite.create({
      groupId,
      invitedPatientId: patient._id,
      invitedBy: req.patient.patientID,
      relationship,
    });

    return res.status(201).json({
      message: "Invitation sent successfully",
      invite,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const getMyInvites = async (req, res) => {
  try {

    const invites = await FamilyInvite.find({
      invitedPatientId: req.patient.patientID,
      status: "PENDING"
    })
    .populate("groupId", "groupName")
    .populate("invitedBy", "fullName");

    return res.status(200).json({
      message: "Invites fetched successfully",
      invites
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};

const acceptInvite = async (req, res) => {
  try {

    const { inviteId } = req.body;

    const invite = await FamilyInvite.findById(inviteId);

    if (!invite) {
      return res.status(404).json({
        message: "Invite not found"
      });
    }

    if (
      invite.invitedPatientId.toString() !==
      req.patient.patientID
    ) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    invite.status = "ACCEPTED";
    await invite.save();

    const group = await FamilyGroup.findById(
      invite.groupId
    );

    group.members.push({
      patientId: invite.invitedPatientId,
      relationship: invite.relationship
    });

    await group.save();

    return res.status(200).json({
      message: "Invite accepted successfully"
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};

export { createFamilyGroup, getMyGroups, inviteMember, getMyInvites, acceptInvite };