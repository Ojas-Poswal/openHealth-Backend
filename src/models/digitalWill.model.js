import mongoose from "mongoose";

const sectionSchema = new mongoose.Schema({
    title : {
      type : String,
      required : true,
      trim : true
    },
    content : {
      type : String,
      default : ""
    },
    links : [
      {
        type : String,
        trim : true,
      }
    ]
},{_id: false})

const digitalWillSchema = new mongoose.Schema({
    patientId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Patient",
        required : true,
        unique : true
    },
    sections : [sectionSchema],

    isUnlocked : {
        type : Boolean,
        default : false
    },
  },
    {
        timestamps : true
    } )

const DigitalWill = mongoose.model("DigitalWill",digitalWillSchema)    

export default DigitalWill