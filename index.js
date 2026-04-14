const express = require('express');
const app = express();
app.use(express.json());
app.use(require('cors')());

const MAKE_WEBHOOK_URL = "https://hook.eu1.make.com/7uq6zzjves5ale3u4xmgdtbuvmit5vc1";

app.post('/chat', async (req, res) => {
    try {
        const response = await fetch(MAKE_WEBHOOK_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ message: req.body.message })
        });
        
        const data = await response.json();
        
        // Lấy dữ liệu, nếu không có thì báo lỗi rõ ràng để ta biết đường sửa
        if (data && data.reply) {
            res.json({ reply: data.reply });
        } else {
            res.json({ reply: "Make không trả về nội dung. Bạn kiểm tra lại module Response nhé!" });
        }

    } catch (error) {
        console.error(error);
        res.json({ reply: "Lỗi kết nối Render-Make. Thử lại sau vài giây nhé!" });
    }
});

app.listen(3000, () => console.log('SafiBot Online'));
