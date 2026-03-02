## 7. Kế hoạch triển khai (Implementation Plan)


### Giai đoạn 1: MVP luyện thi 4 kỹ năng (Nghe, Nói, Đọc, Viết) & Học theo level N5~N1
1. Phân tích yêu cầu chi tiết cho từng kỹ năng và từng cấp độ (N5~N1):
	- Xác định format câu hỏi, đáp án, giao diện cho từng kỹ năng, từng cấp độ.
2. Thiết kế database lưu trữ bộ đề, câu hỏi, đáp án, kết quả user, phân loại theo cấp độ N5~N1.
3. Xây dựng module quản lý đề thi và nội dung học:
	- Thêm/sửa/xóa đề, bài học, nhập tay hoặc import từ file JSON.
	- Cho phép admin nhập nội dung học, bài luyện tập, bộ đề theo từng cấp độ N5~N1.
	- Hỗ trợ import nhanh nội dung từ file PDF (admin chọn vùng nội dung, copy/paste hoặc upload PDF, trích xuất nội dung cần thiết).
4. Xây dựng module làm bài thi & học theo level:
	- User chọn cấp độ (N5~N1) để học/luyện thi.
	- Hiển thị danh sách bài học, bài luyện tập, đề thi theo từng cấp độ.
	- Render giao diện luyện thi 4 kỹ năng (không cần đọc PDF tự động).
	- Hỗ trợ các loại câu hỏi: trắc nghiệm, điền từ, ghi âm (nói), upload file (viết), nghe audio.
5. Module chấm điểm tự động:
	- Chấm điểm trắc nghiệm, điền từ, tự động so sánh đáp án.
	- Ghi nhận kết quả, hiển thị phân tích điểm mạnh/yếu.
6. Module quản lý user, đăng nhập, lưu lịch sử làm bài, tiến trình học theo từng cấp độ.
7. Đóng gói web app (Next.js/React) và desktop app (ElectronJS).

### Giai đoạn 2: Mở rộng & nâng cao
1. Bổ sung chức năng đọc file PDF, mapping tự động đề thi sang layout tương tác.
2. Tích hợp AI chấm điểm nói/viết, phân tích lỗi sai nâng cao.
3. Cải tiến UI/UX, thêm chức năng gợi ý học tập cá nhân hóa.
4. Đồng bộ dữ liệu cloud/offline, tối ưu cho đa nền tảng.

### Ghi chú:
- Ưu tiên hoàn thành hệ thống luyện thi 4 kỹ năng với dữ liệu nhập tay hoặc import JSON.
- Chức năng đọc PDF và mapping tự động sẽ phát triển sau khi hệ thống cơ bản đã ổn định.