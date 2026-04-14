const express = require('express');
const app = express();
app.use(express.json());
app.use(require('cors')());

// Link Webhook Make của bạn
const MAKE_WEBHOOK_URL = "https://hook.eu1.make.com/7uq6zzjves5ale3u4xmgdtbuvmit5vc1";

app.post('/chat', async (req, res) => {
    try {
        const response = await fetch(MAKE_WEBHOOK_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ 
                message: req.body.message,
                sender: "Customer" 
            })
        });
        
        const data = await response.json();
        
        // Lấy câu trả lời từ Make, nếu Make trả về trống thì dùng câu thông báo lỗi
        const botReply = data.reply || "SafiBot chưa nhận được phản hồi từ máy chủ, Anh/Chị thử lại nhé!";
        
        // CHỈ DÙNG 1 DÒNG res.json DUY NHẤT Ở ĐÂY
        res.json({ reply: botReply });

    } catch (error) {
        console.error("Lỗi kết nối:", error);
        res.json({ reply: "SafiBot đang bận xử lý dữ liệu, Anh/Chị đợi em vài giây nhé!" });
    }
});

app.listen(3000, () => console.log('SafiBot Transporter is Online'));
