import FamilyGroup from "../models/familyGroup.model.js";
import FamilyInvite from "../models/familyInvite.model.js";
import { v4 as uuidv4 } from "uuid";
import Patient from "../models/patient.model.js";
import MedicalCase from "../models/medicalCase.model.js";
import Report from "../models/report.model.js";
import DoctorNote from "../models/doctorNote.model.js";
import Prescription from "../models/prescription.model.js";


/* ------------------------------------------------------------------------ *
 * Relationship labels
 *
 * A member's `relationship` is whatever the person who added them typed, and
 * they always typed it about themselves — the creator's mother adds herself
 * as "Mother". That string is only correct for the creator. Everyone else
 * reading "Mother" would take it to mean *their* mother, which is the
 * confusion this block removes.
 *
 * So every label is reduced to a role (PARENT / CHILD / SIBLING / ...) plus a
 * gender, and then re-expressed from the viewer's side using the table below.
 * Combinations the table does not cover fall back to naming the person the
 * label is actually relative to ("Mother of Asha") rather than inventing a
 * kinship term.
 * ------------------------------------------------------------------------ */

const RELATION_ROLES = {
    self:          { role: "SELF",          gender: null },
    father:        { role: "PARENT",        gender: "male" },
    mother:        { role: "PARENT",        gender: "female" },
    parent:        { role: "PARENT",        gender: null },
    son:           { role: "CHILD",         gender: "male" },
    daughter:      { role: "CHILD",         gender: "female" },
    child:         { role: "CHILD",         gender: null },
    brother:       { role: "SIBLING",       gender: "male" },
    sister:        { role: "SIBLING",       gender: "female" },
    sibling:       { role: "SIBLING",       gender: null },
    husband:       { role: "SPOUSE",        gender: "male" },
    wife:          { role: "SPOUSE",        gender: "female" },
    spouse:        { role: "SPOUSE",        gender: null },
    partner:       { role: "SPOUSE",        gender: null },
    grandfather:   { role: "GRANDPARENT",   gender: "male" },
    grandmother:   { role: "GRANDPARENT",   gender: "female" },
    grandparent:   { role: "GRANDPARENT",   gender: null },
    grandson:      { role: "GRANDCHILD",    gender: "male" },
    granddaughter: { role: "GRANDCHILD",    gender: "female" },
    grandchild:    { role: "GRANDCHILD",    gender: null },
    uncle:         { role: "UNCLE_AUNT",    gender: "male" },
    aunt:          { role: "UNCLE_AUNT",    gender: "female" },
    nephew:        { role: "NIECE_NEPHEW",  gender: "male" },
    niece:         { role: "NIECE_NEPHEW",  gender: "female" },
    cousin:        { role: "COUSIN",        gender: null },
    guardian:      { role: "GUARDIAN",      gender: null },
    other:         { role: "OTHER",         gender: null },
}

const ROLE_WORDS = {
    SELF:               { male: "You", female: "You", neutral: "You" },
    PARENT:             { male: "Father", female: "Mother", neutral: "Parent" },
    CHILD:              { male: "Son", female: "Daughter", neutral: "Child" },
    SIBLING:            { male: "Brother", female: "Sister", neutral: "Sibling" },
    SPOUSE:             { male: "Husband", female: "Wife", neutral: "Spouse" },
    GRANDPARENT:        { male: "Grandfather", female: "Grandmother", neutral: "Grandparent" },
    GRANDCHILD:         { male: "Grandson", female: "Granddaughter", neutral: "Grandchild" },
    UNCLE_AUNT:         { male: "Uncle", female: "Aunt", neutral: "Uncle or aunt" },
    NIECE_NEPHEW:       { male: "Nephew", female: "Niece", neutral: "Niece or nephew" },
    GREAT_GRANDPARENT:  { male: "Great-grandfather", female: "Great-grandmother", neutral: "Great-grandparent" },
    GREAT_GRANDCHILD:   { male: "Great-grandson", female: "Great-granddaughter", neutral: "Great-grandchild" },
    CO_PARENT:          { male: "Co-parent", female: "Co-parent", neutral: "Co-parent" },
    IN_LAW_PARENT:      { male: "Father-in-law", female: "Mother-in-law", neutral: "Parent-in-law" },
    IN_LAW_SIBLING:     { male: "Brother-in-law", female: "Sister-in-law", neutral: "Sibling-in-law" },
    IN_LAW_CHILD:       { male: "Son-in-law", female: "Daughter-in-law", neutral: "Child-in-law" },
    STEP_PARENT:        { male: "Stepfather", female: "Stepmother", neutral: "Stepparent" },
    STEP_CHILD:         { male: "Stepson", female: "Stepdaughter", neutral: "Stepchild" },
}

/**
 * VIEWER_RELATIONSHIPS[viewerRole][memberRole] = what the member is to the
 * viewer. Only combinations that are unambiguous are listed; anything else
 * falls through to the named fallback.
 */
const VIEWER_RELATIONSHIPS = {
    SELF: {
        PARENT: "PARENT", CHILD: "CHILD", SIBLING: "SIBLING", SPOUSE: "SPOUSE",
        GRANDPARENT: "GRANDPARENT", GRANDCHILD: "GRANDCHILD",
        UNCLE_AUNT: "UNCLE_AUNT", NIECE_NEPHEW: "NIECE_NEPHEW", COUSIN: "COUSIN",
        GUARDIAN: "GUARDIAN", OTHER: "OTHER",
    },
    PARENT: {
        PARENT: "CO_PARENT",
        CHILD: "GRANDCHILD",
        SIBLING: "CHILD",
        SPOUSE: "IN_LAW_CHILD",
        GRANDCHILD: "GREAT_GRANDCHILD",
        SELF: "CHILD",
    },
    CHILD: {
        PARENT: "GRANDPARENT",
        CHILD: "SIBLING",
        SIBLING: "UNCLE_AUNT",
        SPOUSE: "STEP_PARENT",
        GRANDPARENT: "GREAT_GRANDPARENT",
        SELF: "PARENT",
    },
    SIBLING: {
        PARENT: "PARENT",
        CHILD: "NIECE_NEPHEW",
        SIBLING: "SIBLING",
        SPOUSE: "IN_LAW_SIBLING",
        GRANDPARENT: "GRANDPARENT",
        SELF: "SIBLING",
    },
    SPOUSE: {
        PARENT: "IN_LAW_PARENT",
        CHILD: "STEP_CHILD",
        SIBLING: "IN_LAW_SIBLING",
        SELF: "SPOUSE",
    },
    GRANDCHILD: {
        SELF: "GRANDPARENT",
    },
    GRANDPARENT: {
        CHILD: "GREAT_GRANDCHILD",
        SELF: "GRANDCHILD",
    },
}

const roleFromLabel = (label) =>
    RELATION_ROLES[String(label ?? "").trim().toLowerCase()] ?? null

const genderOf = (patient) =>
    ["male","female"].includes(patient?.gender) ? patient.gender : null

const wordForRole = (role, gender) => {
    const words = ROLE_WORDS[role]
    if (!words) return null
    return words[gender] ?? words.neutral
}

/** The member the labels are written against — the one who created the group. */
const findAnchor = (members) =>
    members.find(
        member => String(member.relationship ?? "").trim().toLowerCase() === "self"
    ) ?? members[0] ?? null

/**
 * What `member` is to `viewer`, or a named fallback when the pairing is not
 * one the table can answer confidently.
 */
const describeRelationship = ({ member, members, viewerId, anchor }) => {
    const memberId = String(member.patientId?._id ?? member.patientId)

    if (memberId === String(viewerId)) return "You"

    const stored = String(member.relationship ?? "").trim() || "Family member"
    const memberInfo = roleFromLabel(stored)
    const anchorName = anchor?.patientId?.fullName?.split(" ")[0] ?? "the group's creator"

    // The creator typed every label about themselves, so for them it is
    // already correct and should be shown exactly as entered.
    if (String(viewerId) === String(anchor?._id)) return stored

    const viewerMember = members.find(
        item => String(item.patientId?._id ?? item.patientId) === String(viewerId)
    )
    const viewerInfo = roleFromLabel(viewerMember?.relationship)

    if (memberInfo && viewerInfo) {
        const outputRole = VIEWER_RELATIONSHIPS[viewerInfo.role]?.[memberInfo.role]

        if (outputRole) {
            const gender =
                memberInfo.role === "SELF"
                    ? genderOf(anchor?.patientId)
                    : memberInfo.gender ?? genderOf(member.patientId)

            const word = wordForRole(outputRole, gender)

            if (word) return word
        }
    }

    return `${stored} of ${anchorName}`
}

/** Adds `relationshipToMe` to every member, for one viewer. */
const shapeGroupForViewer = (group, viewerId) => {
    const plain = group.toObject()
    const anchor = findAnchor(group.members)

    return {
        ...plain,
        members: plain.members.map((member, index) => ({
            ...member,
            relationshipToMe: describeRelationship({
                member : group.members[index],
                members : group.members,
                viewerId,
                anchor,
            }),
        })),
    }
}


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
    })
    .populate("members.patientId", "fullName ohid gender");

    if (!groups || groups.length === 0) {
      return res.status(404).json({
        message: "No groups found for the patient"
      });
    }

    // `admins` is deliberately left as raw ids — the frontend compares against
    // them with `adminIds.map(String)`, which a populated doc would break.
    const viewerId = req.patient.patientID;

    return res.status(200).json({
      message: "Groups fetched successfully",
      groups: groups.map(group => shapeGroupForViewer(group, viewerId))
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

    // Every relationship in a group is written from the creator's side so it
    // can be translated for each viewer. "Self" is what marks the creator's own
    // row, so nobody else may claim it, and an empty label leaves nothing to
    // translate.
    if (!relationship || !relationship.trim()) {
      return res.status(400).json({
        message: "Please say how this person is related to the group's creator",
      });
    }

    if (relationship.trim().toLowerCase() === "self") {
      return res.status(400).json({
        message: `"Self" is the group creator's own entry — pick how they are related to them`,
      });
    }

    const alreadyMember = familyGroup.members.some(
      (member) => member.patientId.toString() === patient._id.toString()
    );

    if (alreadyMember) {
      return res.status(409).json({
        message: "They are already in this group",
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

    if (invite.status !== "PENDING") {
        return res.status(400).json({
        message: "Invite already processed"
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

const rejectInvite = async (req,res) => {
  try {
    const {inviteId} = req.body;

    const invite = await FamilyInvite.findById(inviteId);

    if(!invite){
      return res.status(404).json({
        message : "Invite not found"
      })
    }

    if (invite.status !== "PENDING") {
        return res.status(400).json({
        message: "Invite already processed"
      });
    }

    if(invite.invitedPatientId.toString() !== req.patient.patientID){
      return res.status(403).json({
        message : "Access Denied"
      })
    }

    invite.status = "REJECTED"

    await invite.save();

    return res.status(200).json({
      message : "Invite Rejected Successfully"
    })
  }catch(error){
    console.error(error);

    return res.status(500).json({
      message : "internal Server Error"
    })
  }
}

const leaveGroup = async (req,res) => {
  try{
    const {groupId} = req.body;

    const group = await FamilyGroup.findById(groupId);

    if(!group){
      return res.status(404).json({
        message : "Group not found"
      })
    }

    const patientId = req.patient.patientID;

    const isMember = group.members.some(member => member.patientId.toString() === patientId);

    if(!isMember){
      return res.status(403).json({
        message : "You are not a member of this group"
      })
    }

    // Sole member: leaving *is* deleting the group. Checked before the
    // last-admin rule below, which only matters while other people remain.
    if (group.members.length === 1) {
      await FamilyGroup.findByIdAndDelete(groupId);
      await FamilyInvite.deleteMany({ groupId });

      return res.status(200).json({
        message: "You were the only member, so the group has been deleted"
      });
    }

    const isAdmin = group.admins.some(admin => admin.toString() === patientId)

    if(isAdmin && group.admins.length === 1){
      return res.status(400).json({
        message : "You are the last admin. Please promote someone else to an admin before leaving this group"
      })
    }

    group.members = group.members.filter(member => member.patientId.toString() !== patientId)

    if (isAdmin) {
      group.admins = group.admins.filter(
        admin =>
          admin.toString() !== patientId
      );
    }

    await group.save();

    return res.status(200).json({
      message : "Group Left Successfully"
    })
  }catch(error){
    console.error(error);
    return res.status(500).json({
      message : "internal Server Error"
    })
  }
}

const promoteToAdmin = async (req,res) => {
  try{
    const {groupId,patientId} = req.body;

    const group = await FamilyGroup.findById(groupId)

    if (!group) {
      return res.status(404).json({
        message: "Group not found"
      });
    }

     const isAdmin = group.admins.some(
      admin =>
        admin.toString() === req.patient.patientID
    );

    if (!isAdmin) {
      return res.status(403).json({
        message: "Only admins can promote members"
      });
    }

    const isMember = group.members.some(
      member =>
        member.patientId.toString() === patientId
    );

    if (!isMember) {
      return res.status(400).json({
        message: "Patient is not a member of this group"
      });
    }

    const alreadyAdmin = group.admins.some(
      admin =>
        admin.toString() === patientId
    );

    if (alreadyAdmin) {
      return res.status(400).json({
        message: "Patient is already an admin"
      });
    }

    group.admins.push(patientId);

    await group.save();

    return res.status(200).json({
      message: "Admin promoted successfully"
    });

   }catch(error){
    console.error(error);

    return res.status(500).json({
      message : "Internal Server Error"
    })
  }
}

const demoteAdmin = async (req, res) => {
  try {

    const { groupId, patientId } = req.body;

    const group = await FamilyGroup.findById(groupId);

    if (!group) {
      return res.status(404).json({
        message: "Group not found"
      });
    }

    const isRequesterAdmin = group.admins.some(
      admin =>
        admin.toString() === req.patient.patientID
    );

    if (!isRequesterAdmin) {
      return res.status(403).json({
        message: "Only admins can demote admins"
      });
    }

    const isTargetAdmin = group.admins.some(
      admin =>
        admin.toString() === patientId
    );

    if (!isTargetAdmin) {
      return res.status(400).json({
        message: "Patient is not an admin"
      });
    }

    if (group.admins.length === 1) {
      return res.status(400).json({
        message: "Cannot demote the last admin"
      });
    }

    group.admins = group.admins.filter(
      admin =>
        admin.toString() !== patientId
    );

    await group.save();

    return res.status(200).json({
      message: "Admin demoted successfully"
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};

const removeMember = async (req, res) => {
  try {

    const { groupId, patientId } = req.body;

    const group = await FamilyGroup.findById(groupId);

    if (!group) {
      return res.status(404).json({
        message: "Group not found"
      });
    }

    const isAdmin = group.admins.some(
      admin =>
        admin.toString() === req.patient.patientID
    );

    if (!isAdmin) {
      return res.status(403).json({
        message: "Only admins can remove members"
      });
    }

    if (patientId === req.patient.patientID) {
      return res.status(400).json({
        message: "Use leave group instead"
      });
    }

    const isMember = group.members.some(
      member =>
        member.patientId.toString() === patientId
    );

    if (!isMember) {
      return res.status(404).json({
        message: "Member not found"
      });
    }

    const isTargetAdmin = group.admins.some(
      admin =>
        admin.toString() === patientId
    );

    if (
      isTargetAdmin &&
      group.admins.length === 1
    ) {
      return res.status(400).json({
        message: "Cannot remove the last admin"
      });
    }

    group.members = group.members.filter(
      member =>
        member.patientId.toString() !== patientId
    );

    if (isTargetAdmin) {
      group.admins = group.admins.filter(
        admin =>
          admin.toString() !== patientId
      );
    }

    if (group.members.length === 0) {
      await FamilyGroup.findByIdAndDelete(groupId);

      return res.status(200).json({
        message: "Group deleted successfully"
      });
    }

    await group.save();

    return res.status(200).json({
      message: "Member removed successfully"
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};

const deleteGroup = async (req, res) => {
  try {

    const { groupId } = req.body;

    const group = await FamilyGroup.findById(groupId);

    if (!group) {
      return res.status(404).json({
        message: "Group not found"
      });
    }

    const isAdmin = group.admins.some(
      admin =>
        admin.toString() === req.patient.patientID
    );

    if (!isAdmin) {
      return res.status(403).json({
        message: "Only admins can delete groups"
      });
    }

    await FamilyGroup.findByIdAndDelete(groupId);

    await FamilyInvite.deleteMany({
      groupId
    });

    return res.status(200).json({
      message: "Group deleted successfully"
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};

const getFamilyMemberTimeline = async (req,res) => {
    try {

        const { patientId } = req.params;

        const familyGroup = await FamilyGroup.findOne({
            "members.patientId": {
                $all: [
                    req.patient.patientID,
                    patientId
                ]
            }
        });

        if(!familyGroup){
            return res.status(403).json({
                message: "Access Denied"
            });
        }

        const medicalCases = await MedicalCase.find({
            patientId
        }).sort({ createdAt: -1 });

        const timeline = await Promise.all(
            medicalCases.map(async (medicalCase) => {

                const reports = await Report.find({
                    medicalCaseId: medicalCase._id
                });

                const doctorNotes = await DoctorNote.find({
                    reportId: {
                        $in: reports.map(
                            report => report._id
                        )
                    }
                });

                const prescriptions = await Prescription.find({
                    medicalCaseId: medicalCase._id
                }).sort({ createdAt: -1 });

                return {
                    medicalCase,
                    reports,
                    doctorNotes,
                    prescriptions
                };
            })
        );

        return res.status(200).json({
            message: "Timeline fetched successfully",
            timeline
        });

    } catch(error) {

        console.error(error);

        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

export {createFamilyGroup, getMyGroups, inviteMember, getMyInvites, acceptInvite, rejectInvite, leaveGroup,promoteToAdmin,demoteAdmin,removeMember,deleteGroup,getFamilyMemberTimeline};