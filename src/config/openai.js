import openAI from "openai"

const openai = new openAI({
    apiKey : process.env.OPEN_API_KEY
})

export default openai