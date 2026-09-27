// Đổi IP này thành đúng địa chỉ LAN của máy tính đang chạy server -- lấy bằng lệnh
// `ipconfig` (Windows, tìm dòng "IPv4 Address" của mạng WiFi đang dùng) hoặc `ifconfig`/`ip a`
// (Mac/Linux). Điện thoại và máy tính PHẢI cùng 1 mạng WiFi thì mới gọi được.
export const API_BASE_URL = "http://192.168.0.104:4000"; // TODO: đổi thành IP máy bạn
