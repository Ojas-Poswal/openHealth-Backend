import ai from "../config/gemini.js";

const testAI = async (req, res) => {
    try {

        const response = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: "Say Hello OpenHealth"
        });

        return res.status(200).json({
            reply: response.text
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "AI Test Failed"
        });

    }
};

export { testAI };