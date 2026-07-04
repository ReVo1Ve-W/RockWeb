# Rock Web

一个摇滚爱好者的个人网站：展示喜爱的乐队、代表专辑，并支持在线试听（合法嵌入第三方播放器）。

## 项目结构

```
RockWeb/
├── frontend/   Vue 3 + Vite 前端
└── backend/    Express + MongoDB (Mongoose) 后端
```

## 本地开发

### 后端

```bash
cd backend
npm install
cp .env.example .env   # 填入你自己的 MongoDB Atlas 连接字符串
npm run dev
```

### 前端

```bash
cd frontend
npm install
cp .env.example .env.local   # 本地开发默认指向 http://localhost:4000/api
npm run dev
```

## 技术栈

- 前端：Vue 3、Vite、Vue Router、Axios
- 后端：Node.js、Express、Mongoose
- 数据库：MongoDB Atlas（免费云集群）
- 部署：前端 → Vercel；后端 → Render
