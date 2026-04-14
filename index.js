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
        const model = genAI.getGenerativeModel({model:'gemini-1.5-flash'});
        const prompt = `Bạn là chuyên viên tư vấn cao cấp của Safitour (Đà Nẵng). 
Nhiệm vụ: Tư vấn tour dựa trên dữ liệu thật dưới đây và CHỐT ĐƠN.

DỮ LIỆU TOUR TỪ HỆ THỐNG (Google Sheets):
${tourData}

QUY TẮC GIAO TIẾP:
1. Xưng hô: Gọi khách là "Anh/Chị" và xưng "SafiTour" hoặc "Em".
2. Nếu khách hỏi giá: Phải nêu rõ giá và các dịch vụ bao gồm (buffet, xe đưa đón...) có trong dữ liệu.
3. Nếu tour KHÔNG CÓ trong danh sách: Hãy nói "Hiện tại em chưa có sẵn lịch trình tour này trên web, Anh/Chị cho em xin SĐT để bạn điều hành tour gọi lại tư vấn riêng cho mình nhé!"
4. Luôn kết thúc bằng một câu hỏi: "Anh/Chị muốn đặt tour vào ngày nào ạ?" hoặc "Em đặt chỗ trước cho mình nhé?"
5. Tuyệt đối không bịa đặt thông tin không có trong danh sách.

Câu hỏi của khách: ${req.body.message}`;

        const result = await model.generateContent(prompt);
        res.json({ reply: result.response.text() });
    } catch (error) {
        console.error(error);
        res.json({ reply: "SafiBot đang cập nhật dữ liệu tour, bạn vui lòng đợi vài giây rồi hỏi lại nhé!" });
    }
});

app.listen(3000, () => console.log('SafiBot is running with Google Sheets!'));
