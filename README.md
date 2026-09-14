# VKU Interview Survey PWA

Ứng dụng Progressive Web App (PWA) dùng để khảo sát tình trạng phỏng vấn và nhu cầu việc làm của sinh viên VKU.

## 📌 Giới thiệu

VKU Interview Survey được xây dựng nhằm thu thập thông tin khảo sát từ sinh viên về:

- Tình trạng đã từng phỏng vấn việc làm hay chưa
- Số lần phỏng vấn
- Công ty và vị trí ứng tuyển
- Địa điểm và hình thức phỏng vấn
- Kết quả phỏng vấn
- Tình trạng tìm kiếm việc làm
- Mong muốn việc làm của sinh viên
- Vị trí GPS khi thực hiện khảo sát
- Hình ảnh minh chứng (nếu có)

Dữ liệu khảo sát được lưu cục bộ trên thiết bị và đồng bộ lên Google Sheets thông qua Google Apps Script.

## ✨ Chức năng

### Trang chủ
- Hiển thị tổng số sinh viên đã khảo sát
- Thống kê số sinh viên đã từng phỏng vấn
- Thống kê số sinh viên chưa từng phỏng vấn
- Thống kê số sinh viên đang tìm việc
- Nút thực hiện khảo sát

### Khảo sát
- Nhập thông tin sinh viên
- Chọn tình trạng phỏng vấn
- Nhập thông tin phỏng vấn
- Nhập nhu cầu việc làm
- Lấy vị trí GPS
- Chụp hoặc chọn hình ảnh

### Đồng bộ dữ liệu
- Lưu dữ liệu khảo sát vào IndexedDB
- Hỗ trợ lưu khảo sát khi offline
- Tự động đồng bộ khi có kết nối Internet
- Đồng bộ dữ liệu lên Google Sheets

### PWA
- Có thể cài đặt trên thiết bị
- Hỗ trợ hoạt động offline
- Có Service Worker
- Có Web App Manifest

## 🛠️ Công nghệ sử dụng

- HTML
- CSS
- JavaScript
- Vite
- PWA
- IndexedDB
- Google Apps Script
- Google Sheets
- Git / GitHub

## 📂 Cấu trúc thư mục

```text
vku-survey/
├── public/
│   ├── manifest.webmanifest
│   ├── sw.js
│   └── vite.svg
│
├── src/
│   ├── main.js
│   ├── style.css
│   └── counter.js
│
├── index.html
├── package.json
├── package-lock.json
├── .gitignore
└── README.md