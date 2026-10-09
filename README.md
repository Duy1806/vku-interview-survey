# VKU Interview Survey PWA

<<<<<<< Updated upstream
Ứng dụng Progressive Web App (PWA) dùng để khảo sát tình trạng phỏng vấn và nhu cầu việc làm của sinh viên VKU.
=======
Ứng dụng khảo sát tình hình phỏng vấn và tìm kiếm việc làm, hỗ trợ người dùng ghi nhận thông tin khảo sát, lưu dữ liệu trên thiết bị và đồng bộ kết quả lên Google Sheets để phục vụ việc tổng hợp, thống kê.
>>>>>>> Stashed changes

Dự án được phát triển dưới dạng ứng dụng web và tích hợp **Capacitor** để hỗ trợ đóng gói thành ứng dụng Android.

<<<<<<< Updated upstream
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
=======
## ✨ Tính năng chính
* **Đăng nhập bằng Google**: Tích hợp Firebase Authentication để xác thực người dùng thông qua tài khoản Google.
* **Khảo sát:** Thu thập và ghi nhận thông tin theo biểu mẫu khảo sát.
* **Lưu dữ liệu cục bộ:** Sử dụng IndexedDB để lưu dữ liệu trên thiết bị.
* **Hỗ trợ ngoại tuyến:** Cho phép lưu thông tin khi không có kết nối mạng.
* **Đồng bộ dữ liệu:** Gửi dữ liệu khảo sát lên Google Sheets thông qua Google Apps Script.
* **Thống kê:** Tổng hợp dữ liệu khảo sát để theo dõi kết quả.
* **Ứng dụng Android:** Tích hợp Capacitor để xây dựng phiên bản Android từ ứng dụng web.

## 🛠️ Công nghệ sử dụng

* HTML, CSS, JavaScript
* Vite
* IndexedDB
* Firebase Authentication, Google Sign-In
* Google Apps Script
* Google Sheets
* Capacitor
* Git và GitHub

## 📁 Cấu trúc dự án

```text
vku-interview-survey/
├── public/
│   ├── manifest.webmanifest
│   └── ...
├── src/
│   ├── main.js
│   ├── style.css
│   └── ...
├── android/
├── index.html
├── package.json
├── package-lock.json
├── capacitor.config.*
└── README.md
```

*Cấu trúc trên mang tính tham khảo; tên và vị trí một số tệp có thể khác tùy theo phiên bản hiện tại của dự án.*

## ⚙️ Yêu cầu

* Node.js và npm
* Git
* Android Studio và Android SDK nếu muốn build ứng dụng Android
* Google Apps Script Web App URL để đồng bộ dữ liệu

## 🚀 Cài đặt và chạy ứng dụng

### 1. Clone repository

```bash
git clone https://github.com/Duy1806/vku-interview-survey.git
cd vku-interview-survey
```

### 2. Chuyển sang nhánh Capacitor

```bash
git switch capacitor
```

### 3. Cài đặt dependencies

```bash
npm install
```

### 4. Chạy ứng dụng ở môi trường phát triển

```bash
npm run dev
```

Mở địa chỉ localhost được Vite hiển thị trong terminal để sử dụng ứng dụng.

### 5. Build phiên bản web

```bash
npm run build
```

Các tệp web sau khi build sẽ được tạo trong thư mục `dist/`.

## 📱 Build ứng dụng Android bằng Capacitor

Sau khi cài đặt dependencies và build web, đồng bộ tài nguyên web vào dự án Android:

```bash
npx cap sync android
```

Mở dự án Android bằng Android Studio:

```bash
npx cap open android
```

Trong Android Studio, chọn thiết bị hoặc máy ảo Android rồi chạy ứng dụng. Để tạo APK, sử dụng chức năng Build APK trong Android Studio.

> Nếu dự án chưa có thư mục Android, cần thêm nền tảng Android bằng `npx cap add android` sau khi cấu hình Capacitor phù hợp.

## 🔗 Cấu hình đồng bộ Google Sheets

Ứng dụng sử dụng Google Apps Script làm trung gian để gửi và đọc dữ liệu khảo sát từ Google Sheets.

1. Triển khai Apps Script dưới dạng Web App.
2. Sao chép URL triển khai có đuôi `/exec`.
3. Cập nhật URL trong tệp cấu hình hoặc mã nguồn đang sử dụng API.
4. Kiểm tra quyền truy cập và khả năng đọc, ghi dữ liệu trước khi sử dụng.

Không đưa thông tin bí mật hoặc thông tin xác thực nhạy cảm vào repository công khai.

## 🌿 Các nhánh dự án

| Nhánh       | Mục đích                                                       |
| ----------- | -------------------------------------------------------------- |
| `main`      | Phiên bản ứng dụng chính                                       |
| `pwa`       | Phiên bản Progressive Web App                                  |
| `capacitor` | Phiên bản tích hợp Capacitor, hỗ trợ đóng gói ứng dụng Android |

Mỗi nhánh có thể có cấu hình và cách triển khai riêng phù hợp với mục tiêu phát triển.

## 📌 Định hướng phát triển

* Hoàn thiện giao diện và trải nghiệm người dùng.
* Nâng cao độ tin cậy của quá trình lưu và đồng bộ dữ liệu.
* Hoàn thiện chức năng thống kê.
* Kiểm thử ứng dụng trên trình duyệt và thiết bị Android.
>>>>>>> Stashed changes
