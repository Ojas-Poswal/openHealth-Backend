import AISummary from "../models/aiSummary.model.js"
import MedicalCase from "../models/medicalCase.model.js";
import openai from "../config/openai.js";

const generateAISummary = async (req,res) => {
    try{
      const {patientId} = req.params;
      
      const medicalCases = await MedicalCase.find({
        patientId
      })

      if(medicalCases.length === 0){
        return res.status(404).json({
            message : "No medical cases found"
        })
      }

      const patientData = medicalCases.map((medicalCase) => ({
            diagnosis: medicalCase.diagnosis,
            verdict: medicalCase.verdict,
            finalAdvice: medicalCase.finalAdvice,
            prescriptions: medicalCase.prescriptions,
            tags: medicalCase.tags,
            status: medicalCase.status
        }));

        const promp = `Generate a concise medical summary for a patient.

                Focus on:
                - Major diagnoses
                - Chronic diseases
                - Allergies
                - Major injuries
                - Surgeries
                - Important medications
                - Significant medical history

                Patient Data: ${JSON.stringify(patientData,null,2)}
                
                Return only the summary`

        const response = await openai.responses.create({
            model : "gpt-5-mini",
            input : prompt
        })
        const summary = response.output_text;
        const aiSummary = await AISummary.findOneAndUpdate(
            {patientId},
            {
                summary,
                generatedAt: new Date()
            },
            {
                upsert: true,
                new: true
            }
        )
       
         return res.status(200).json({
            message: "AI Summary Generated",
            aiSummary
        });        

    }catch(error){
        console.error(error)

        return res.status(500).json({
            message : "Internal Server Error"
        })
    }
}

const getAISummary = async (req,res) => {
    try{
        const {patientId} = req.params

        const aiSummary = await AISummary.findOne({
            patientId
        })

        if(!aiSummary){
            return res.status(404).json({
                message : "AI Summary does not exist"
            })
        }
        return res.status(200).json({
            aiSummary
        })
    }catch(error){
        console.error(error)

        return res.status(500).json({
            message : "Internal Server Error"
        })
    }
}

export {generateAISummary,getAISummary}