# Interview Survey

Ứng dụng khảo sát tình trạng phỏng vấn và nhu cầu việc làm, hỗ trợ thu thập, lưu trữ, đồng bộ và tổng hợp dữ liệu khảo sát.

## 📌 Giới thiệu

Interview Survey được xây dựng nhằm đơn giản hóa quá trình thu thập thông tin về tình trạng phỏng vấn, tìm kiếm việc làm và định hướng nghề nghiệp. Ứng dụng hỗ trợ lưu dữ liệu trên thiết bị, đồng bộ với Google Sheets và cung cấp các chỉ số thống kê tổng hợp.

Repository được tổ chức thành hai nhánh, tương ứng với hai phiên bản ứng dụng.

## 🌿 Các nhánh dự án

### 1. `main` — Phiên bản ứng dụng chính

Phiên bản web hiện tại, tích hợp Capacitor để hỗ trợ phát triển ứng dụng di động.

* Thu thập và quản lý thông tin khảo sát.
* Lưu trữ dữ liệu cục bộ.
* Đồng bộ dữ liệu với Google Sheets thông qua Google Apps Script.
* Hỗ trợ thống kê dữ liệu khảo sát.
* Hỗ trợ tích hợp và đóng gói ứng dụng di động bằng Capacitor.

### 2. `pwa` — Phiên bản Progressive Web App

Phiên bản PWA tập trung vào trải nghiệm sử dụng trực tiếp trên trình duyệt.

* Có thể cài đặt trên các thiết bị tương thích.
* Hỗ trợ lưu dữ liệu cục bộ bằng IndexedDB.
* Hỗ trợ lưu khảo sát khi ngoại tuyến và đồng bộ khi có Internet.
* Sử dụng Service Worker và Web App Manifest để hỗ trợ các tính năng PWA.

## ✨ Chức năng chính

* Thu thập thông tin cá nhân và tình trạng phỏng vấn.
* Ghi nhận công ty, vị trí ứng tuyển, hình thức và kết quả phỏng vấn.
* Khảo sát nhu cầu tìm kiếm việc làm.
* Hỗ trợ lấy vị trí GPS và đính kèm hình ảnh minh chứng.
* Lưu trữ và đồng bộ dữ liệu khảo sát.
* Tổng hợp dữ liệu phục vụ thống kê và phân tích.

## 🛠️ Công nghệ sử dụng

* HTML, CSS, JavaScript
* Vite
* IndexedDB
* Google Apps Script
* Google Sheets
* Progressive Web App (PWA)
* Capacitor
* Git và GitHub

## 🚀 Cài đặt và chạy dự án

### Yêu cầu

* Node.js và npm
* Git

### Các bước thực hiện

1. Clone repository:

   ```bash
   git clone https://github.com/Duy1806/vku-interview-survey.git
   ```

2. Di chuyển vào thư mục dự án:

   ```bash
   cd vku-interview-survey
   ```

3. Chọn nhánh muốn sử dụng:

   Phiên bản chính:

   ```bash
   git switch main
   ```

   Phiên bản PWA:

   ```bash
   git switch pwa
   ```

4. Cài đặt các thư viện:

   ```bash
   npm install
   ```

5. Chạy ứng dụng:

   ```bash
   npm run dev
   ```

6. Build ứng dụng:

   ```bash
   npm run build
   ```

## ⚙️ Cấu hình

Ứng dụng sử dụng Google Apps Script để kết nối với Google Sheets. Khi triển khai trên môi trường riêng, cần cấu hình URL Web App phù hợp với dự án Apps Script đang sử dụng.

Không đưa API key, token hoặc thông tin xác thực nhạy cảm vào repository công khai.

## ☁️ Triển khai

Ứng dụng web có thể được build bằng Vite và triển khai trên nền tảng hosting tương thích. Phiên bản `main` hỗ trợ định hướng phát triển ứng dụng di động thông qua Capacitor; phiên bản `pwa` hướng đến trải nghiệm cài đặt và sử dụng trực tiếp trên trình duyệt.


