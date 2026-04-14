const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const app = express();
app.use(express.json());
app.use(require('cors')());

const genAI = new GoogleGenerativeAI("AIzaSyA9Be9Tcd2A3dp3sq2QjXRopYr82buQISs");

// Link file Sheets của bạn (đã chuyển sang dạng xuất dữ liệu)
const SHEET_URL = "https://docs.google.com/spreadsheets/d/1DPnhqKzpOSCaB3jF7Gdd-YCSAssurW8soySKNa1AHIo/gviz/tq?tqx=out:csv";

app.post('/chat', async (req, res) => {
    try {
        // 1. Tải dữ liệu mới nhất từ Google Sheets
        const sheetRes = await fetch(SHEET_URL);
        const tourData = await sheetRes.text();

        // 2. Gửi dữ liệu đó cho Gemini xử lý
        const model = genAI.getGenerativeModel("gemini-1.5-flash");
        const prompt = `Bạn là nhân viên tư vấn của Safitour. 
Dưới đây là danh sách tour và giá mới nhất từ hệ thống:
${tourData}

Hãy dựa vào dữ liệu trên để trả lời câu hỏi của khách hàng một cách thân thiện, chuyên nghiệp. 
Nếu khách hỏi tour không có trong danh sách, hãy bảo khách để lại số điện thoại để nhân viên gọi lại tư vấn.
Câu hỏi của khách: ${req.body.message}`;

        const result = await model.generateContent(prompt);
        res.json({ reply: result.response.text() });
    } catch (error) {
        console.error(error);
        res.json({ reply: "SafiBot đang cập nhật dữ liệu tour, bạn vui lòng đợi vài giây rồi hỏi lại nhé!" });
    }
});

app.listen(3000, () => console.log('SafiBot is running with Google Sheets!'));
