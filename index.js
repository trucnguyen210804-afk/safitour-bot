const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const app = express();
app.use(express.json());
app.use(require('cors')());

// Dán cái mã lấy từ AI Studio (lúc nãy làm bên Make) vào giữa hai dấu nháy kép bên dưới
const genAI = new GoogleGenerativeAI("AIzaSyA9Be9Tcd2A3dp3sq2QjXRopYr82buQISs");

app.post('/chat', async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Bạn là trợ lý ảo của Safitour. Hãy trả lời khách thật thân thiện và chuyên nghiệp dựa trên câu hỏi: ${req.body.message}`;
    
    const result = await model.generateContent(prompt);
    res.json({ reply: result.response.text() });
  } catch (error) {
    console.error(error);
    res.json({ reply: "SafiBot đang bận tí, bạn đợi mình vài giây nhé!" });
  }
});

app.listen(3000, () => console.log('Bot đang chạy!'));
