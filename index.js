const express = require('express');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());

const MAKE_WEBHOOK_URL = "https://hook.eu1.make.com/7uq6zzjves5ale3u4xmgdtbuvmit5vc1";

app.post('/chat', async (req, res) => {
    try {
        const userMessage = req.body.message;
        const userId = req.body.user_id || `web_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

        console.log("User message:", userMessage);
        console.log("User ID:", userId);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); 

        const response = await fetch(MAKE_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                message: userMessage,
                user_id: userId,
                history: ""
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`Make status: ${response.status}`);
        }

        // CHỖ THAY ĐỔI CHÍNH: Nhận dữ liệu dạng văn bản (text) thay vì JSON
        const responseText = await response.text();
        console.log("Raw response from Make:", responseText);

        if (responseText && responseText.trim().length > 0) {
            // Trả về cho giao diện web đúng định dạng nó cần
            res.json({ reply: responseText.trim() });
        } else {
            res.json({
                reply: "Hệ thống chưa có câu trả lời, vui lòng thử lại sau."
            });
        }

    } catch (error) {
        if (error.name === 'AbortError') {
            console.error("Loi: Timeout");
        } else {
            console.error("Loi:", error.message);
        }

        res.json({
            reply: "Hệ thống đang bận, bạn vui lòng chờ giây lát và nhắn lại nhé."
        });
    }
});

app.get('/', (req, res) => {
    res.send("SafiBot Online");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
