# ChatAbb Repository

ChatAbb là một ứng dụng chat web gồm **backend** và **frontend**:

- **be** - FastAPI backend để tương tác với cơ sở dữ liệu và OpenAI API  
- **fe** - Giao diện web cho ứng dụng chat
- **database** - Sử dụng Supabase để lưu trữ data, nếu có lỗi database không tồn tại, hãy sử dụng cloudflare (1.1.1.1)

## Tính năng

- Đăng nhập (Login)  
- Đăng ký (Register)  
- Chat trực tiếp (Chat)  

## Cài đặt và chạy ứng dụng

### 1. Clone repository

```bash
git clone <URL_REPO>
cd chatabb
```

---

### 2. Backend (be)

1. Vào thư mục backend:

```bash
cd be
```

2. Tạo môi trường ảo Python và kích hoạt (python 3.11 để tương thích nhất):

- **Windows:**

```bash
py -3.11 -m venv venv
venv\Scripts\activate
```

- **macOS/Linux:**

```bash
python3 -m venv venv
source venv/bin/activate
```

3. Cài đặt các dependencies:

```bash
pip install -r requirements.txt
```

4. Thêm file `.env` vào thư mục `be` (file được cung cấp riêng). Nội dung `.env` thường gồm các biến:

```
DATABASE_URL=...
OPENAI_API_KEY=...
```

5. Chạy backend:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Backend sẽ chạy tại: `http://localhost:8000`

---

### 3. Frontend (fe)

1. Vào thư mục frontend:

```bash
cd ../fe
```

2. Cài đặt các package:

```bash
npm install
```

3. Thêm file `.env` với biến môi trường:

```
VITE_API_URL=http://<YOUR_IP>:8000/
```

> `<YOUR_IP>` lấy từ lệnh `ipconfig` (Windows) hoặc `ifconfig` (macOS/Linux)

4. Chạy frontend:

```bash
npm run dev
```

Frontend sẽ hiển thị địa chỉ truy cập trên terminal, thường là `http://localhost:5173/`

---

### 4. Sử dụng ứng dụng

- Truy cập frontend trên trình duyệt.  
- Đăng ký hoặc đăng nhập.  
- Bắt đầu chat, backend sẽ xử lý các yêu cầu API và tương tác với OpenAI API.

---

### Lưu ý

- Backend phải được chạy trước khi mở frontend.  
- Kiểm tra `.env` để đảm bảo các URL và key API chính xác.  

- Nếu muốn truy cập từ thiết bị khác trong mạng LAN, dùng IP của máy thay cho `localhost` trong `VITE_API_URL`.


