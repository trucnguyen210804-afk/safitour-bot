const express = require('express');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());

const MAKE_WEBHOOK_URL = "https://hook.eu1.make.com/7uq6zzjves5ale3u4xmgdtbuvmit5vc1";

// 🔥 Lưu history theo user
const userHistories = {};

// Giới hạn history
const MAX_HISTORY_LENGTH = 12;

app.post('/chat', async (req, res) => {
    try {
        const userMessage = req.body.message;
        let userId = req.body.user_id;

        // ❗ tạo user_id nếu chưa có
        if (!userId) {
            userId = `web_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        }

        // ❗ validate
        if (!userMessage || userMessage.trim() === "") {
            return res.json({ reply: "Bạn chưa nhập nội dung." });
        }

        console.log("User:", userId, "| Message:", userMessage);

        // 🔥 tạo history nếu chưa có
        if (!userHistories[userId]) {
            userHistories[userId] = [];
        }

        // 🔥 push user message
        userHistories[userId].push({
            role: "user",
            content: userMessage
        });

        // 🔥 giới hạn độ dài history
        if (userHistories[userId].length > MAX_HISTORY_LENGTH) {
            userHistories[userId] = userHistories[userId].slice(-MAX_HISTORY_LENGTH);
        }

        // 🔥 convert history thành text cho Gemini dễ hiểu
        const historyText = userHistories[userId]
            .map(item => {
                if (item.role === "user") return `User: ${item.content}`;
                return `Assistant: ${item.content}`;
            })
            .join("\n");

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);

        const response = await fetch(MAKE_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: userMessage,
                user_id: userId,
                history: userHistories[userId],   // dùng nếu bạn xử lý JSON trong Make
                history_text: historyText        // 🔥 dùng cho prompt (QUAN TRỌNG)
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`Make status: ${response.status}`);
        }

        const responseText = await response.text();

        console.log("Bot raw:", responseText);

        let botReply = "Hệ thống chưa có câu trả lời.";

        if (responseText && responseText.trim() !== "") {
            botReply = responseText.trim();
        }

        // 🔥 lưu phản hồi bot
        userHistories[userId].push({
            role: "assistant",
            content: botReply
        });

        res.json({
            reply: botReply,
            user_id: userId
        });

    } catch (error) {
        if (error.name === 'AbortError') {
            console.error("Timeout khi gọi Make");
        } else {
            console.error("Lỗi:", error.message);
        }

        res.json({
            reply: "Hệ thống đang bận, bạn vui lòng thử lại sau."
        });
    }
});

app.get('/', (req, res) => {
    res.send("SafiBot Online");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
