# QueueDesk MVP 后续实施计划

**日期**: 2026-05-08
**状态**: 待评审

---

## 当前完成度

### ✅ 已完成（~55%）
- Auth（登录/注册/邀请）+ Middleware 路由守卫
- Agent 工单列表/详情/状态流转/评论
- Requester Portal（列表+详情+新建）
- Admin Console（users/teams/queues/sla/settings）
- Email Intake Webhook + Resend 邮件集成
- Agent Dashboard（Recharts）
- ticket_no 可读工单号

### ❌ 未完成 Must Have（PRD 定义）
1. **AI 辅助**（分类建议、摘要、回复草稿）— 🚨 P0
2. **审批执行**（Approver 操作流程）— 🚨 P0
3. **SLA 前端展示**（at_risk / breached 标识）— 🟡 P1
4. **请求人签名链接**（不登录查看工单）— 🟡 P1
5. **审计日志页面**（列表/筛选/导出）— 🟡 P1
6. **工单转派前端操作** — 🟡 P1

---

## 实施计划（分三阶段）

### Phase 1：P0 功能补全（1-2天）
**目标：满足 PRD Must Have 最低门槛**

#### 1.1 审批执行
- [ ] `src/app/(agent)/agent/approvals/page.tsx` — Approver 待审批列表
- [ ] 审批操作 API：`POST /api/approvals/[id]/approve`、`/reject`
- [ ] TicketDetail 页展示关联审批状态
- [ ] 邮件通知：审批结果通知请求人

#### 1.2 AI 辅助（需 `OPENAI_API_KEY`）
- [ ] `src/lib/ai/classifier.ts` — 工单分类/队列/优先级建议
- [ ] `src/lib/ai/summarizer.ts` — 工单上下文摘要
- [ ] `src/lib/ai/drafter.ts` — 回复草稿生成
- [ ] TicketDetail 页 AI 卡片 UI（采纳/拒绝按钮）
- [ ] 审计：AI 建议记录到 AuditLog

---

### Phase 2：P1 功能补全（2-3天）
**目标：提升产品完整度**

#### 2.1 SLA 前端展示
- [ ] TicketDetail 页显示剩余时间 + risk/breach 状态标识
- [ ] TicketsTable 列表行 SLA 状态列
- [ ] Agent Dashboard 增加 SLA 达标率图表

#### 2.2 请求人签名链接（Public Ticket View）
- [ ] `src/app/(public)/ticket/[token]/page.tsx` — 不需登录查看
- [ ] 邮件通知内嵌入签名链接

#### 2.3 审计日志页面
- [ ] `src/app/(admin)/admin/audit/page.tsx` — 列表+筛选+导出 CSV
- [ ] `src/app/api/audit/route.ts` — 查询 API（按 actor/action/date 过滤）

#### 2.4 工单转派操作
- [ ] TicketDetail 页"转派"按钮 + 用户搜索下拉
- [ ] API：`PATCH /api/tickets/[id]/reassign`

---

### Phase 3：部署与打磨（1天）
**目标：可演示版本**

#### 3.1 Vercel 部署
- [ ] 连接 GitHub repo
- [ ] 配置 env vars（Supabase + Resend + OpenAI）
- [ ] 验证 build + 线上 smoke test

#### 3.2 收尾
- [ ] 队列暂停/归档按钮（Admin UI）
- [ ] Requester 表单前端校验强化
- [ ] 全局错误处理统一

---

## 实施优先级推荐

**推荐顺序**：Phase 1 → Phase 3 → Phase 2

理由：
1. 先完成 P0（审批+AI），满足 PRD Must Have
2. 立刻部署，可演示给早期用户收集反馈
3. 根据反馈决定 P1 功能的实际优先级

---

## 关键技术决策点

| 决策 | 当前状态 | 待确认 |
|------|----------|--------|
| OpenAI 模型选择 | gpt-4o-mini（成本优先） | 需用户确认 |
| 审批流程引擎 | 简单状态机（DB 驱动） | 暂不引入外部 BPMN |
| 审计日志存储 | Supabase table `audit_log` | 需确认保留期限 |
| 请求人签名链接安全 | HMAC token（有效期7天） | 需确认过期策略 |

---

## 成功标准（PRD 定义）

MVP 上线门槛：
- [ ] 八条主链路全部可用（Email/Form/API/Queue/SLA/Comments/Approvals/AuditLog）
- [ ] 八角色服务端鉴权通过
- [ ] 至少支撑 3 个真实队列

---

*本文档存放于 `planning/MVP后续实施计划.md`，与 `Prepare && Planning/QueueDesk MVP 产品需求文档.md` 配套使用。*
