# MEMORY.md — 长期记忆

## QueueDesk 项目

### 项目定位
- AI-first 企业内部服务台 SaaS（MVP 阶段）
- 技术栈：Next.js（前端）+ TypeScript 模块化后端 + Supabase（PostgreSQL + Auth + Realtime）+ BullMQ + OpenAI
- 三端：Agent Console / Requester Portal / Admin Console
- 目标：20-500 人企业的 IT/HR/财务/运营团队

### 云服务账号（勿暴露 Key）
- **Supabase**: `gdgiahevkysrdbqojwha`，Region: Singapore，免费 tier
  - Project URL: `https://gdgiahevkysrdbqojwha.supabase.co`
  - anon key: `sb_publishable_V9p0iZNsic1qWUtdCQJzbA_a-wxYf8S`
  - DB Password: 已由用户保管，勿记录明文
  - `supabase link --project-ref gdgiahevkysrdbqojwha` 已完成
- **OpenAI API**: 用户有自己的 Key
- **邮件服务**: 待定（倾向 Resend）
- **Vercel**: 待连仓库
- **GitHub 仓库**: 已建（空仓库占坑）

### 文档产出（存放于 `Prepare && Planning/`）
1. QueueDesk 开发与增长研究报告 ✅
2. QueueDesk MVP 产品需求文档 ✅
3. QueueDesk PostgreSQL 数据模型研究报告 ✅
4. QueueDesk 企业内部服务台 AI 模块的可落地架构与实现方案 ✅
5. QueueDesk REST API 设计规范报告 ✅
6. QueueDesk 前端 UIUX 设计规范 ✅
7. QueueDesk Email Intake 模块完整技术设计 ✅
8. QueueDesk 架构决策记录草案 ✅

### 已交付功能（2026-05-07）
- Auth（登录/注册/邀请）✅
- Agent 工单列表 + 工单详情 + 状态流转 + 评论 ✅
- Requester 新建工单表单 ✅
- Email Intake Webhook（`/api/email/intake`）✅
- Agent Dashboard（Recharts + 实时用户信息）✅
- **Requester Portal 完整交付** ✅
  - `/app/tickets` 我的工单列表（真实 Supabase 查询 + 筛选 + 搜索 + 排序）
  - `/app/tickets/[id]` 工单详情（对话流 + 回复表单 + 元数据侧栏）
  - `/app/profile` 个人设置（编辑昵称 + 登出）
  - AppShell 动态用户信息 + 退出登录

### 待完成
- Resend 邮件接入（需配置域名 + webhook URL）
- Admin Console 全套 CRUD
- Vercel 部署

### Git 工作流
- 每完成一个功能模块 commit（英文 conventional commits）
- Git remote 由用户手动 push（不在 repo 内存储凭证）
1. QueueDesk 开发与增长研究报告
2. QueueDesk MVP 产品需求文档
3. QueueDesk PostgreSQL 数据模型研究报告
4. QueueDesk 企业内部服务台 AI 模块的可落地架构与实现方案
5. 待出：REST API 设计规范 / Email Intake 技术设计 / ADR / 前端 UI 规范 / 测试策略

### 用户偏好
- 喜欢简洁、可执行的结构化表达和表格化输出
- 遇到困惑先确认理解再行动
- 委托 AI 时偏好"一站式服务"，直接执行而非只给步骤
- 工作时间外的凌晨/早上也可能发消息
