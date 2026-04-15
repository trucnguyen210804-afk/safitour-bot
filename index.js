const express = require('express');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());

const MAKE_WEBHOOK_URL = "https://hook.eu1.make.com/7uq6zzjves5ale3u4xmgdtbuvmit5vc1";

app.post('/chat', async (req, res) => {
    try {
        const userMessage = req.body.message;
        // Tu tao user_id de dong bo voi he thong cua ban ban
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

        const textData = await response.text();
        console.log("Raw response:", textData);

        let data;
        try {
            data = JSON.parse(textData);
        } catch (e) {
            throw new Error("Data tu Make khong phai JSON hop le");
        }

        if (data && data.reply) {
            res.json({ reply: data.reply });
        } else {
            res.json({
                reply: "He thong chua co cau tra loi. Vui long thu lai sau."
            });
        }

    } catch (error) {
        if (error.name === 'AbortError') {
            console.error("Loi: Timeout");
        } else {
            console.error("Loi:", error.message);
        }

        res.json({
            reply: "He thong dang ban, ban vui long cho giay lat va nhan lai nhe."
        });
    }
});

app.get('/', (req, res) => {
    res.send("SafiBot Online");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
