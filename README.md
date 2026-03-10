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

## 数据库：仅使用 Supabase

**运行态后端只连接 Supabase（PostgreSQL）**，不连接本地 SQLite。  
本地 `app.db` 仅作临时或迁移用（例如用脚本把旧数据导入 Supabase 后即可弃用）。

必须在 `app/backend/supabase.env` 中配置 `DATABASE_URL`（Supabase 的 PostgreSQL 连接串），否则后端启动会报错。

### 在 Supabase 控制台获取（推荐用 Session mode，避免 Connection refused）

1. 登录 [Supabase](https://supabase.com) → 进入你的项目。
2. 若项目显示 **Paused**，先点 **Restore** 恢复。
3. 左侧 **Project Settings** → **Database**。
4. 在 **Connection string** 区域：
   - 选 **URI**；
   - **务必选 “Session mode”**（不要选 Direct connection），否则很多网络下会报 `Connection refused`。
5. 复制整条 URI，格式类似：
   ```text
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
   ```
6. 将 `[YOUR-PASSWORD]` 替换为你的**数据库密码**（与页面上一致；含 `@`、`#`、`/` 等需做 [URL 编码](https://en.wikipedia.org/wiki/Percent-encoding)）。

### 你需要提供/填写的内容

| 项 | 说明 |
|----|------|
| **Database password** | 项目 Database 密码（替换连接串里的 `[YOUR-PASSWORD]`） |
| **Project ref** | 项目 ID，在连接串或项目 URL 里（如 `db.xxxxx.supabase.co` 中的 `xxxxx`） |
| **Region**（若用 Pooler） | 如 `us-east-1`，在 Pooler 连接串里 |

### 配置到本地

在 **`app/backend/supabase.env`** 中配置（每行一个键值对）：

```bash
DATABASE_URL=postgresql://postgres.你的项目ref:你的数据库密码@aws-0-区域.pooler.supabase.com:5432/postgres
```

**若需公网部署、商家上传产品图**，请再增加两行（图片会存到 Supabase Storage，不占本机磁盘）：

```bash
SUPABASE_URL=https://你的项目ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=你的_service_role_密钥
```

- `SUPABASE_URL`：在 Supabase 控制台 **Project Settings → API → Project URL**。
- `SUPABASE_SERVICE_ROLE_KEY`：同一页 **Project API keys → service_role**（仅后端使用，不要暴露到前端）。  
配置后，商家上传的图片会保存到 Supabase Storage 的 `campaign-assets` 桶（首次上传时自动创建），公网可直接访问图片链接。

后端从 `supabase.env` 读取 `DATABASE_URL`（必填）以及可选的 `SUPABASE_URL`、`SUPABASE_SERVICE_ROLE_KEY`。**必须使用 Session mode 的 URI**（主机是 `aws-0-xxx.pooler.supabase.com`），不要用 Direct（`db.xxx.supabase.co`），否则容易 Connection refused。  
首次连接成功后，启动 uvicorn 时会自动建表。

**若仍报 `Connection refused`**：  
1) 确认项目已恢复（非 Paused）；  
2) 确认用的是 **Session mode** 连接串（主机含 `pooler.supabase.com`）；  
3) 密码与 Supabase 页面一致，特殊字符已 URL 编码；  
4) 若曾多次输错密码，可在 Database 设置里 Unban IP 或等约 30 分钟。

**Supabase 表显示 “Unrestricted”**：表示未开启 Row Level Security (RLS)。当前仅你的 FastAPI 后端用数据库密码连接，由 API 自己做鉴权即可；若以后要从前端直连 Supabase，再在 Supabase 控制台为表配置 RLS 策略。

### 把本地 SQLite 数据迁移到 Supabase

若你之前用过本地 `app.db`，可以用脚本把数据复制到 Supabase：

1. 在 `app/backend` 下配置好 Supabase 的 `DATABASE_URL`（如使用 `supabase.env`）。
2. 在 `app/backend` 下执行：

   ```bash
   python scripts/migrate_sqlite_to_supabase.py
   ```

脚本会先在 Supabase 上建表（若不存在），再把 `app.db` 里各表的数据插入 Supabase；已存在的表/主键会跳过（`ON CONFLICT (id) DO NOTHING`）。

---

## 运行 Frontend

1. 进入前端目录：

   ```bash
   cd app/frontend
   ```

2. 安装依赖：

   ```bash
   pnpm install
   ```

3. 启动开发服务器：

   ```bash
   pnpm run dev
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
