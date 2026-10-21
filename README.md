# Chung Tiền 💸

Web quản lý chi tiêu chung cho 2-3 người.

## Cấu trúc
- `index.html` – trang chính
- `style.css` – giao diện
- `script.js` – logic, lưu localStorage + đồng bộ Firebase
- `manifest.json`, `sw.js`, `favicon.svg` – cài như app, chạy offline
- `404.html` – trang lỗi

## Chạy
Mở `index.html`, hoặc chạy server (cần cho service worker):
`npx serve .`

## Đồng bộ
Tạo Firebase Realtime Database (chế độ test), bấm "Đồng bộ chung", nhập URL + mã phòng.
