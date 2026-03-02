# SRS: Hệ Thống Luyện Thi & Học Tiếng Nhật

## 1. Mục tiêu dự án
- Xây dựng web app và desktop app (ElectronJS) hỗ trợ học và luyện thi tiếng Nhật.
- Hỗ trợ đọc file PDF đề thi, render ra giao diện làm bài trực tuyến.
- Cho phép user chọn đáp án, điền vào chỗ trống, lưu kết quả.
- Hệ thống tự động chấm điểm (AI hoặc công thức), hiển thị kết quả, phân tích đáp án.

## 2. Tính năng chính
1. **Quản lý đề thi**
   - Upload, lưu trữ, phân loại đề thi (PDF, metadata).
   - Đọc và chuyển đổi đề PDF thành layout bài thi tương tác.
2. **Làm bài thi**
   - Render đề thi, cho phép chọn đáp án, điền chỗ trống.
   - Hỗ trợ nhiều loại câu hỏi: trắc nghiệm, điền từ, kéo thả, v.v.
   - Tính thời gian làm bài, lưu tạm kết quả.
3. **Chấm điểm & Phản hồi**
   - Tự động chấm điểm theo đáp án chuẩn hoặc AI.
   - Hiển thị kết quả, phân tích điểm mạnh/yếu.
4. **Quản lý người dùng**
   - Đăng ký, đăng nhập, lưu lịch sử làm bài.
   - Thống kê tiến độ học tập.
5. **Đồng bộ đa nền tảng**
   - Web app (Next.js/React), desktop (ElectronJS).
   - Lưu trữ cloud/local, đồng bộ dữ liệu.

## 3. Công nghệ đề xuất
- Frontend: React/Next.js, Tailwind CSS
- Desktop: ElectronJS
- Backend: Node.js/Express hoặc Next.js API
- Database: PostgreSQL hoặc SQLite
- PDF parsing: pdf.js, pdf-parse
- AI chấm điểm: OpenAI API hoặc custom logic

## 4. Khả thi?
- **Khả thi cao**: Công nghệ đã sẵn có, nhiều thư viện hỗ trợ PDF, Electron, AI scoring.
- Thách thức: Xử lý layout PDF phức tạp, mapping câu hỏi/đáp án tự động, UX/UI tối ưu cho luyện thi.
- Đề xuất: Bắt đầu MVP với upload PDF, render trắc nghiệm, chấm điểm cơ bản, sau đó mở rộng.

## 5. Lộ trình phát triển
1. Phân tích & chuẩn hóa format đề PDF
2. Xây dựng module đọc & render đề
3. Module làm bài, lưu kết quả
4. Module chấm điểm
5. Quản lý user, lịch sử
6. Đóng gói desktop app
7. Mở rộng AI scoring, phân tích nâng cao

---
**File này là SRS tổng quan, sẽ bổ sung chi tiết từng module trong các file tiếp theo.**
