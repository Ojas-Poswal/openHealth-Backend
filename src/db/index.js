import mongoose from "mongoose"
import Patient from "../models/patient.model.js"
import Doctor from "../models/doctor.model.js"

/**
 * Reconciles the auth collections' indexes with their schemas, once, at boot.
 *
 * Mongoose only ever *creates* the indexes a schema declares — it never alters
 * one. So changing `phone` from a plain unique index to a sparse one does
 * nothing on a database that already holds the old index: MongoDB refuses to
 * change the options of an existing index, and Mongoose swallows that refusal
 * rather than crashing. The result is a silent no-op and an app that works
 * until the *second* phone-less account signs up, at which point the missing
 * phone indexes as `null` and collides with the first one.
 *
 * `syncIndexes` is the one call that drops the stale index and builds the new
 * one. It is scoped to these two models on purpose — the global
 * `mongoose.syncIndexes()` would rebuild every index on every other collection
 * too, which is not our business here.
 */
const reconcileIndexes = async () => {
    for(const model of [Patient,Doctor]){
        const dropped = await model.syncIndexes();

        if(dropped?.length){
            console.log(
                `${model.modelName} indexes reconciled — dropped: ${dropped.join(", ")}`
            )
        }
    }
}

const connectDB = async ()=>{
    try{
        const connectionInstance = await mongoose.connect(process.env.MONGODB_URI);
        console.log(
            `Mongodb connected: ${connectionInstance.connection.host} `
        )

        await reconcileIndexes()
    }catch(error){
        console.error("mongodb connection failes",error);
        process.exit(1);
    }
}

export default connectDB;
