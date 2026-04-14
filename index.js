const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const app = express();
app.use(express.json());
app.use(require('cors')());

// API Key của bạn
const genAI = new GoogleGenerativeAI("AIzaSyA9Be9Tcd2A3dp3sq2QjXRopYr82buQISs"); 
const SHEET_URL = "https://docs.google.com/spreadsheets/d/1DPnhqKzpOSCaB3jF7Gdd-YCSAssurW8soySKNa1AHIo/gviz/tq?tqx=out:csv";

app.post('/chat', async (req, res) => {
    try {
        const sheetRes = await fetch(SHEET_URL);
        const tourData = await sheetRes.text();

        // Sử dụng model với hậu tố -latest để đảm bảo tìm thấy
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        
        const prompt = `Bạn là nhân viên tư vấn của Safitour. Dựa trên dữ liệu:
${tourData}
Hãy trả lời khách: ${req.body.message}`;

        const result = await model.generateContent(prompt);
        res.json({ reply: result.response.text() });

    } catch (error) {
        console.error("Lỗi:", error.message);
        res.json({ reply: "SafiBot đang khởi động lại thư viện AI, bạn đợi 10 giây nhé!" });
    }
});

app.listen(3000, () => console.log('SafiBot v2 Online'));
