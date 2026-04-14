const express = require('express');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());

const MAKE_WEBHOOK_URL = "https://hook.eu1.make.com/7uq6zzjves5ale3u4xmgdtbuvmit5vc1";

app.post('/chat', async (req, res) => {
    try {
        console.log("📩 User message:", req.body.message);

        const response = await fetch(MAKE_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: req.body.message })
        });

        if (!response.ok) {
            throw new Error(`Make trả về status: ${response.status}`);
        }

        const data = await response.json();
        console.log("🤖 Make response:", data);

        if (data && data.reply) {
            res.json({ reply: data.reply });
        } else {
            res.json({
                reply: "Make không trả về nội dung. Kiểm tra lại Webhook Response nhé!"
            });
        }

    } catch (error) {
        console.error("❌ ERROR:", error.message);

        res.json({
            reply: "Hệ thống đang bận, bạn thử lại sau vài giây nhé!"
        });
    }
});

app.get('/', (req, res) => {
    res.send("SafiBot đang chạy 🚀");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`SafiBot Online tại cổng ${PORT}`));
