import mongoose from "mongoose";

const familyGroupSchema = new mongoose.Schema(
  {
    groupName: {
      type: String,
      required: true,
      trim: true,
    },

    invitationCode: {
      type: String,
      unique: true,
      required: true,
    },

    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
      },
    ],

    members: [
      {
        patientId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Patient",
          required: true,
        },

        relationship: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const FamilyGroup = mongoose.model(
  "FamilyGroup",
  familyGroupSchema
);

export default FamilyGroup;