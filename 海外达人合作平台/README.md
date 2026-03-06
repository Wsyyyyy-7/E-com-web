# CreatorBridge — 海外达人合作平台

面向中国跨境电商的海外达人合作执行平台，连接商家与海外创作者。

---

## 环境要求

- **Backend**：Python 3.9+
- **Frontend**：Node.js 18+，pnpm 8+

---

## 运行 Backend

从 Git 克隆后首次运行，按以下步骤即可。

1. **进入后端目录**：

   ```bash
   cd app/backend
   ```

2. **创建虚拟环境并激活**（推荐）：

   ```bash
   python -m venv .venv
   source .venv/bin/activate   # Windows: .venv\Scripts\activate
   ```

3. **安装依赖**：

   ```bash
   pip install -r requirements.txt
   ```

4. **配置环境变量**（登录/注册需要 JWT，必做一步）：

   ```bash
   cp .env.example .env
   ```

   编辑 `.env`，把 `JWT_SECRET_KEY` 改成你自己的密钥（例如一串随机字符），例如：

   ```bash
   JWT_SECRET_KEY=my-super-secret-key-please-change-me
   ```

   `JWT_EXPIRE_MINUTES`、`JWT_ALGORITHM` 可不改，用默认即可。

5. **启动服务**：

   ```bash
   uvicorn main:app --reload
   ```

   - 服务地址：**http://localhost:8000**
   - API 文档：http://localhost:8000/docs

---

## 运行 Frontend

1. 进入前端目录：

   ```bash
   cd app/frontend
   ```

2. 安装依赖：

   ```bash
   npm install
   ```

3. 启动开发服务器：

   ```bash
   npm run dev
   ```

   - 默认地址：**http://localhost:3000**（可通过环境变量 `VITE_PORT` 修改）
   - 开发时请求 `/api` 会代理到 Backend 的 `http://localhost:8000`

---

## 同时使用前后端

1. 先启动 **Backend**（在 `app/backend` 下执行 `uvicorn main:app --reload`）。
2. 再启动 **Frontend**（在 `app/frontend` 下执行 `pnpm run dev`）。
3. 在浏览器打开 Frontend 地址（如 http://localhost:3000）即可使用；登录/注册等接口会通过代理访问 Backend。

---

## 项目结构

```
海外达人合作平台/
├── app/
│   ├── backend/          # FastAPI 后端
│   │   ├── main.py       # 入口
│   │   ├── requirements.txt
│   │   └── ...
│   └── frontend/         # React + Vite 前端
│       ├── src/
│       ├── package.json
│       └── vite.config.ts  # /api 代理到 localhost:8000
└── README.md
```
