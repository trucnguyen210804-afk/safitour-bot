const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const app = express();
app.use(express.json());
app.use(require('cors')());

const genAI = new GoogleGenerativeAI("AIzaSyA9Be9Tcd2A3dp3sq2QjXRopYr82buQISs"); 

const SHEET_URL = "https://docs.google.com/spreadsheets/d/1DPnhqKzpOSCaB3jF7Gdd-YCSAssurW8soySKNa1AHIo/gviz/tq?tqx=out:csv";

app.post('/chat', async (req, res) => {
    try {
        const sheetRes = await fetch(SHEET_URL);
        const tourData = await sheetRes.text();

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        
        const prompt = `Bạn là chuyên viên Safitour. Dựa trên dữ liệu tour:
${tourData}

Hãy trả lời câu hỏi: ${req.body.message}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text(); 
        
        res.json({ reply: text });

    } catch (error) {
        console.error(error);
        res.json({ reply: "SafiBot đang bận tí, bạn hỏi lại sau vài giây nhé!" });
    }
});

app.listen(3000, () => console.log('Bot Online'));
