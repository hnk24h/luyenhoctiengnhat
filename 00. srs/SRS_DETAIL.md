# SRS Chi Tiết: Hệ Thống Luyện Thi & Học Tiếng Nhật

## 1. Module Quản Lý Đề Thi
### 1.1. Upload & Lưu trữ đề thi
- Cho phép admin upload file PDF đề thi, nhập metadata (tên đề, cấp độ, mô tả, tags).
- Lưu trữ file PDF và metadata vào database/cloud storage.

### 1.2. Phân loại & Tìm kiếm đề thi
- Phân loại theo cấp độ (N5-N1), chủ đề, loại bài.
- Tìm kiếm đề theo tên, tag, cấp độ.

### 1.3. Chuyển đổi PDF thành layout bài thi
- Sử dụng thư viện pdf.js hoặc pdf-parse để đọc nội dung PDF.
- Xác định các vùng câu hỏi, đáp án, hình ảnh, bảng biểu.
- Mapping tự động hoặc bán tự động các câu hỏi/đáp án từ PDF sang cấu trúc dữ liệu JSON.

## 2. Module Làm Bài Thi
### 2.1. Render đề thi tương tác
- Hiển thị đề thi từ dữ liệu JSON (hoặc trực tiếp từ PDF nếu cần).
- Hỗ trợ các loại câu hỏi: trắc nghiệm, điền từ, kéo thả, matching, v.v.
- Cho phép user chọn đáp án, điền vào chỗ trống, thao tác trực tiếp trên giao diện.

### 2.2. Quản lý tiến trình làm bài
- Tính giờ làm bài, hiển thị đồng hồ đếm ngược.
- Lưu tạm kết quả khi user thoát hoặc reload.
- Cho phép nộp bài khi hoàn thành hoặc hết giờ.

### 2.3. Lưu & đồng bộ kết quả
- Lưu kết quả làm bài vào database (user, đề, đáp án, thời gian, điểm số).
- Đồng bộ dữ liệu giữa web và desktop app.

## 3. Module Chấm Điểm & Phản Hồi
### 3.1. Chấm điểm tự động
- So sánh đáp án user với đáp án chuẩn (từ file JSON hoặc nhập tay).
- Hỗ trợ chấm điểm nhiều dạng câu hỏi (trắc nghiệm, điền từ, matching).
- Tích hợp AI để chấm các câu tự luận (nếu có).

### 3.2. Hiển thị kết quả & phân tích
- Hiển thị điểm số, đáp án đúng/sai, giải thích đáp án.
- Phân tích điểm mạnh/yếu theo từng kỹ năng, chủ đề.
- Đề xuất lộ trình ôn tập dựa trên kết quả.

## 4. Module Quản Lý Người Dùng
### 4.1. Đăng ký, đăng nhập
- Hỗ trợ đăng ký, đăng nhập bằng email, Google, Facebook.
- Xác thực, bảo mật thông tin user.

### 4.2. Quản lý hồ sơ & lịch sử
- Lưu lịch sử làm bài, điểm số, tiến độ học tập.
- Cho phép user xem lại bài đã làm, phân tích tiến bộ.

### 4.3. Phân quyền
- Phân quyền admin (quản lý đề, user), user thường (làm bài, xem kết quả).

## 5. Module Đồng Bộ & Đa Nền Tảng
### 5.1. Web app
- Xây dựng bằng Next.js/React, responsive cho mobile/desktop.

### 5.2. Desktop app
- Đóng gói bằng ElectronJS, đồng bộ dữ liệu với web/cloud.

### 5.3. Lưu trữ & đồng bộ dữ liệu
- Sử dụng cloud database (PostgreSQL, Firebase, v.v.) hoặc local (SQLite) cho desktop offline.
- Cơ chế đồng bộ khi có mạng.

## 6. Module AI Chấm Điểm & Gợi Ý
### 6.1. Chấm điểm AI
- Tích hợp AI (OpenAI API hoặc custom model) để chấm các câu tự luận, phân tích lỗi sai.

### 6.2. Gợi ý học tập
- Đề xuất bài luyện tập phù hợp dựa trên kết quả, điểm yếu của user.

---
**File này sẽ tiếp tục được cập nhật chi tiết từng module khi phát triển.**
