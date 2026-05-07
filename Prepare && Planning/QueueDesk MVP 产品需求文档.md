# QueueDesk MVP 产品需求文档

## 文档摘要

本 PRD 以你上传的 QueueDesk 研究报告为定位基线，目标仍是 **20–500 人企业中的 IT、HR、财务/AP、运营共享服务团队**，首发场景锁定 **内部请求接入、队列协同、SLA、审批与 AI 辅助**。公开官方资料也验证了这一方向的产品边界：Jira Service Management 把 queues、SLAs、approvals 与 permissions 做成标准服务管理能力；Front 把 shared inbox、rules、ticket status 与 AI 助理做得很强；Hiver 则证明“邮箱内协作 + 审批 + 轻量 IT help desk”已经是被明确需求验证过的形态。fileciteturn0file0 citeturn6view0turn6view1turn6view2turn3search3turn6view5turn6view6turn12view0turn6view8

因此，QueueDesk 的 MVP 不追求 Zendesk 式全渠道与大而全，也不追求 JSM Premium 的资产、变更、事件管理深度；它只把 **邮件/表单/API 接入、队列与分派、SLA、评论/内部备注、审批、AI 辅助、审计日志、基础报表** 做扎实，并以“**首个队列在 1 天内可上线，2 周内可替代一个共享邮箱处理流**”作为产品成功标准。Freshdesk、Zendesk、JSM 的官方文档都把邮件、表单、API 与工单流转视为基础能力，而 Front 和 Hiver 进一步说明协作与规则治理必须是第一天就可用的核心能力。citeturn14view1turn6view9turn14view3turn7search0turn8search13turn19view1turn19view2

| 项目 | 定义 |
|---|---|
| 产品名称 | QueueDesk |
| 产品定位 | AI-first 内部服务台与队列协同平台 |
| 目标组织规模 | 20–500 人企业 |
| 目标团队 | IT、HR、财务/AP、运营共享服务团队 |
| MVP 首发入口 | Email、Web Form、Public API |
| MVP 首发场景 | IT 支持、HR 服务请求、软件权限申请、采购审批、员工变更 |
| 核心差异 | 比 Front 更强的规则与审批治理；比 JSM 更轻、更快上线 |
| AI 原则 | AI 负责分类、摘要、建议；人类保留发送、审批、执行权限 |
| 数据边界 | 多租户 SaaS，组织级隔离，工作区级授权，队列级处理 |

| 项目目标 | 目标值 |
|---|---|
| 首次价值实现时间 | 管理员 60 分钟内建成首个可用队列 |
| 试点覆盖率 | 试点团队 30 天内，80% 以上内部请求通过 QueueDesk 进入统一队列 |
| 治理可追踪性 | 100% 工单状态、分派、审批、导出、AI 采纳事件可审计 |
| 处理可见性 | 所有工单具有明确 Owner、状态、SLA 与下一步动作 |
| AI 价值衡量 | AI 分类建议采纳率 > 60%，AI 摘要查看使用率 > 50% |

## 产品目标与权限模型

QueueDesk 的产品结构采用 **Org → Workspace → Team → Queue → Ticket**。这么建模的原因很直接：JSM 明确将 queue 作为团队工作的主视图，且由管理员配置；Front 与 Zendesk 也都采用分层权限与自定义角色来控制谁能建规则、改流程、看什么内容；NIST 则把 RBAC 视为企业高级访问控制的主流模型。换句话说，QueueDesk 不应该把权限“藏”在 UI 里，而应把权限、范围和动作限制做成显式模型。citeturn17view0turn14view6turn12view3turn12view4turn12view5

| 层级 | 作用 | 说明 |
|---|---|---|
| Org | 计费、安全、合规、全局审计边界 | 一个组织可包含多个工作区；MVP 默认创建一个工作区，但数据模型预留多工作区 |
| Workspace | 业务配置边界 | 包含团队、队列、表单、SLA、标签、审批模板、报表 |
| Team | 人员与职责边界 | 例如 IT Support、HR Services、Finance/AP |
| Queue | 工作执行边界 | 队列承载来源映射、默认 SLA、分派规则与 backlog 视图 |
| Ticket | 工作项最小单位 | 一切请求、审批、评论、附件都围绕 Ticket 组织 |

**身份模型说明：** 本 PRD 聚焦业务域实体。平台层仍然存在 `User / AuthIdentity / Session / Token` 等身份基础对象；**角色绑定在 User 上，Contact 是业务联系人对象，不等于必然可登录的用户。**

| 角色 | 作用域 | 主要权限 | 显式限制 |
|---|---|---|---|
| Org Owner | 组织级 | 计费、数据导出审批、保留策略、安全设置、工作区创建、机器人密钥策略 | 默认不因角色自动获得所有敏感工单内容；仍受字段脱敏与范围控制 |
| Workspace Admin | 工作区级 | 队列、表单、SLA、审批模板、自动分派规则、报表、用户分配、API Token 管理 | 不能跳过审计日志；不能删除已提交的审计记录 |
| Team Lead | 团队级 | 管理所属团队队列、再分派、SLA 升级、查看团队报表、参与审批 | 只能管理授权团队范围；不能改组织级安全/计费 |
| Agent | 队列级 / 工单级 | 处理工单、公开回复、内部备注、变更状态、认领/转派、执行已批准工单 | 不能修改全局配置、SLA 模型、审批模板 |
| Approver | 审批项级 | 查看与自己相关的审批上下文，批准/拒绝/委托，查看审批历史 | 不可批量浏览无关工单，不可直接修改工单主体数据 |
| Viewer | 授权范围内只读 | 查看工单、查看公开与内部记录、查看标准报表 | 不能回复、变更状态、执行审批、访问审计日志 |
| External Requester | 仅本人 | 提交工单、查看本人工单、补充信息、查看审批结果/状态、回复公开对话 | 不能查看内部备注、其他人的工单或跨队列数据 |
| Integration Bot | Token scope | 通过 API 在授权范围内创建/更新工单、写入评论、同步外部系统状态 | 不能登录 UI，不继承任何人工角色，不可绕过审批策略 |

| 敏感操作 | 允许角色 |
|---|---|
| 组织计费、安全与导出审批 | Org Owner |
| 工作区配置（队列、表单、SLA、审批模板） | Org Owner、Workspace Admin |
| 团队级再分派、升级与团队报表 | Org Owner、Workspace Admin、Team Lead |
| 工单处理、公开回复、内部备注 | Org Owner、Workspace Admin、Team Lead、Agent |
| 审批决策 | Org Owner、Workspace Admin、Team Lead、Approver |
| 审计日志查看与导出 | Org Owner、Workspace Admin |
| 机器人 Token 创建/轮换/撤销 | Org Owner、Workspace Admin |

**权限判定规则：**

| 规则 | 要求 |
|---|---|
| Least Privilege | 默认拒绝；仅显式授权动作可执行 |
| Scope First | 先判断组织/工作区/团队/队列范围，再判断动作权限 |
| Deny Overrides | 敏感字段、审计日志、导出等显式拒绝优先于一般允许 |
| Server-side Enforcement | 所有权限检查必须在服务端执行，前端只做展示裁剪 |
| Field Masking | HR、薪酬、采购金额、访问级别等字段支持按角色脱敏 |
| Bot Isolation | Integration Bot 只能使用作用域 Token，不可绑定人工账号登录 |

## 核心实体定义

下列十个实体是 MVP 的核心业务骨架。这样建模并不是“为了数据库好看”，而是因为官方产品已经表明：**队列、SLA、审批、评论与审计日志必须是一等对象**。JSM 把 queue 定义为团队工作的过滤视图，并把 SLA 的 start / pause / stop conditions 和 calendar 作为正式配置；Zendesk、Freshdesk 区分 public reply 与 internal note；Front、Hiver 把 comments、@mentions、approvals 做成高频协作机制；Front、Zendesk、Jira 都提供正式 audit log。QueueDesk 如果想同时做到“轻”和“可治理”，这些对象不能只是附件字段。citeturn6view0turn6view1turn6view2turn14view4turn14view5turn11search18turn11search3turn12view0turn12view7

**说明：** `User / AuthIdentity / Session / Calendar / Form / AutomationRule` 属于平台或配置对象，不在此次十个核心业务实体清单中，但实现时必须存在。

**Ticket**

| 字段 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| ticket_id | UUID | Y | 主键 |
| ticket_no | String | Y | 人类可读编号，如 `QD-000123` |
| org_id | UUID | Y | 所属组织 |
| workspace_id | UUID | Y | 所属工作区 |
| queue_id | UUID | Y | 当前主队列 |
| team_id | UUID | Y | 当前责任团队 |
| requester_contact_id | UUID | Y | 请求人 |
| source_channel | Enum | Y | `email` / `form` / `api` |
| source_ref | String | N | 原始来源引用，如 message-id / external_request_id |
| subject | String | Y | 标题 |
| description | Text | Y | 规范化后的请求正文 |
| status | Enum | Y | 生命周期状态 |
| priority | Enum | Y | `p1` / `p2` / `p3` / `p4` |
| category | String | N | 一级分类，如 IT / HR / Procurement |
| assignee_user_id | UUID | N | 当前处理人 |
| sla_policy_id | UUID | N | 绑定的 SLA Policy |
| approval_required | Boolean | Y | 是否必须完成审批后才可执行 |
| resolution_code | Enum | N | 解决结果分类 |
| resolved_at | Timestamp | N | 解决时间 |
| closed_at | Timestamp | N | 关闭时间 |
| created_at / updated_at | Timestamp | Y | 创建与更新时间 |

| 状态值 | 含义 | 可转移到 | 转换条件 |
|---|---|---|---|
| `new` | 新建，尚未开始处理 | `in_progress` / `waiting_on_approval` / `cancelled` | 创建后自动进入；若模板要求先审批，可直接进入审批等待 |
| `in_progress` | 正在处理 | `waiting_on_requester` / `waiting_on_approval` / `on_hold` / `resolved` / `cancelled` | 已被人工或规则接单 |
| `waiting_on_requester` | 等待请求人补充信息 | `in_progress` / `cancelled` | 请求人回复或处理人取消 |
| `waiting_on_approval` | 等待审批结果 | `in_progress` / `cancelled` | 审批通过后继续处理；审批拒绝或请求撤回则取消 |
| `on_hold` | 外部依赖或第三方阻塞 | `in_progress` / `cancelled` | 依赖解除后恢复 |
| `resolved` | 已完成处理，等待自动关闭窗口结束 | `in_progress` / `closed` | 请求人在重开窗口内回复则回到处理中；否则自动或人工关闭 |
| `closed` | 终态关闭 | 无 | 关闭后不再重开；新回复创建 follow-up ticket |
| `cancelled` | 请求撤回或判定无效 | 无 | 终态 |

| 核心业务规则 | 说明 |
|---|---|
| 队列归属 | 任一 Ticket 在任一时刻只能有一个主队列 |
| 重开规则 | 仅 `resolved` 可重开；`closed` 收到新回复时系统创建 follow-up ticket 并关联原 Ticket |
| 审批门禁 | `approval_required=true` 时，`resolved` 前必须所有阻断审批已为 `approved` |
| SLA 联动 | 状态切换会驱动 SLA run 的启动、暂停、恢复或停止 |
| 去重与线程 | Email 入口优先用 `Message-ID` / `In-Reply-To` / `References` 归并；命中已关闭票则创建 follow-up ticket |
| 审计要求 | 创建、分派、状态变化、优先级变化、解决与关闭必须记录审计日志 |

**Queue**

| 字段 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| queue_id | UUID | Y | 主键 |
| workspace_id | UUID | Y | 所属工作区 |
| team_id | UUID | Y | 所属团队 |
| name | String | Y | 队列名 |
| slug | String | Y | 稳定标识 |
| description | Text | N | 说明 |
| intake_sources | JSON | Y | 绑定邮件地址、表单、API request type |
| default_priority | Enum | N | 默认优先级 |
| default_sla_policy_id | UUID | N | 默认 SLA |
| routing_mode | Enum | Y | `manual` / `round_robin` / `rule_based` |
| routing_rules | JSON | N | 分派规则集 |
| sort_policy | Enum | Y | `fifo` / `sla_risk_first` / `priority_first` |
| visibility | Enum | Y | `team_only` / `workspace_shared` |
| status | Enum | Y | 生命周期状态 |
| archived_at | Timestamp | N | 归档时间 |

| 状态值 | 含义 | 可转移到 | 转换条件 |
|---|---|---|---|
| `draft` | 草稿，尚未接收流量 | `active` / `archived` | 配置了 owner、intake、基础规则后可激活 |
| `active` | 可接收与处理工单 | `paused` / `archived` | 管理员主动暂停或归档 |
| `paused` | 不再接收新工单，但保留存量操作 | `active` / `archived` | 恢复处理或永久归档 |
| `archived` | 历史只读 | 无 | 终态 |

| 核心业务规则 | 说明 |
|---|---|
| 来源映射 | 一个 intake source 必须有一个默认目标队列 |
| 归档限制 | `archived` 队列不能再接收新工单，也不能新增规则 |
| 暂停策略 | `paused` 队列若仍收到请求，必须按配置转入 fallback queue；否则进入 Intake Errors 队列 |
| 队列所有权 | 队列必须归属一个 Team，权限与报表按 Team/Queue 作用域计算 |
| 视图语义 | Queue 是“工作视图 + 默认治理配置”的一体对象，不只是过滤器 |

**SLA**

> 说明：MVP 中 `SLA` 表示 **Policy + Ticket 上的 materialized metric runs**。Policy 负责定义，Run 负责追踪。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| sla_id | UUID | Y | 主键 |
| workspace_id | UUID | Y | 所属工作区 |
| name | String | Y | Policy 名称 |
| scope | JSON | Y | 适用队列、请求类型、优先级 |
| business_hours_calendar | JSON | Y | 工作时间与节假日配置 |
| first_response_target_minutes | Integer | Y | 首响应目标 |
| resolution_target_minutes | Integer | Y | 解决目标 |
| next_response_target_minutes | Integer | N | 下一次响应目标，MVP 可留空 |
| start_conditions | JSON | Y | 启动条件 |
| pause_conditions | JSON | Y | 暂停条件 |
| stop_conditions | JSON | Y | 停止条件 |
| breach_actions | JSON | N | 预警与升级动作 |
| policy_status | Enum | Y | Policy 生命周期 |
| run_state | Enum | N | 仅在 Ticket 绑定后存在 |
| breached_at | Timestamp | N | 首次违约时间 |
| stopped_at | Timestamp | N | 计时结束时间 |

| 状态值 | 含义 | 可转移到 | 转换条件 |
|---|---|---|---|
| `draft` | Policy 草稿 | `active` / `retired` | 完成 calendar、targets、conditions 后可激活 |
| `active` | Policy 生效 | `retired` | 新老策略切换时退役 |
| `retired` | Policy 不再绑定新票 | 无 | 终态，历史票仍保留原绑定快照 |
| `not_started` | Run 尚未启动 | `running` / `cancelled` | 命中 start condition 时开始 |
| `running` | Run 正在按工作时间计算 | `paused` / `stopped` | 命中暂停条件则暂停；命中停止条件则停止 |
| `paused` | Run 暂停 | `running` / `stopped` | 触发恢复事件或直接结束 |
| `stopped` | Run 终止 | 无 | 终态，结果通过 `breached_at` 判断是否违约 |
| `cancelled` | 票单取消导致 SLA 终止 | 无 | 终态 |

| 核心业务规则 | 说明 |
|---|---|
| 指标最小集 | MVP 强制支持 `first_response` 与 `resolution` 两个指标 |
| 工作时间 | SLA 只按 business hours 累计，不按自然时间累计 |
| 暂停规则 | `waiting_on_requester`、`waiting_on_approval`、`on_hold` 默认可被配置为暂停态 |
| 恢复规则 | 请求人公开回复、审批完成、人工取消 hold 可恢复计时 |
| 版本冻结 | Ticket 绑定 SLA 后，默认冻结到票级快照；Policy 修改不回溯历史票 |
| 风险展示 | Queue 与 Ticket 页面必须展示 `at_risk` 与 `breached` 标识 |

**Comment**

| 字段 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| comment_id | UUID | Y | 主键 |
| ticket_id | UUID | Y | 所属工单 |
| author_type | Enum | Y | `user` / `requester` / `bot` / `system` |
| author_id | UUID | N | 作者 |
| visibility | Enum | Y | `public` / `internal` |
| body | Text | Y | 正文 |
| mentions | JSON | N | 被 @ 用户 |
| source_channel | Enum | Y | `web` / `email` / `api` |
| attachments | JSON | N | 附件引用 |
| ai_generated | Boolean | Y | 是否由 AI 起草 |
| status | Enum | Y | 生命周期状态 |
| published_at | Timestamp | N | 发布时间 |
| edited_at | Timestamp | N | 编辑时间 |
| redaction_reason | String | N | 脱敏/删改理由 |

| 状态值 | 含义 | 可转移到 | 转换条件 |
|---|---|---|---|
| `draft` | 草稿 | `published` / `discarded` | 发送或放弃 |
| `published` | 已发布 | `edited` / `redacted` | 内部备注在编辑窗口内可编辑；敏感信息可红线处理 |
| `edited` | 已编辑的已发布评论 | `redacted` | 仅内部备注允许进入该状态 |
| `redacted` | 内容被脱敏替换 | 无 | 终态 |
| `discarded` | 草稿作废 | 无 | 终态 |

| 核心业务规则 | 说明 |
|---|---|
| 可见性边界 | `public` 对 External Requester 可见；`internal` 仅内部角色可见 |
| 不可硬删 | 已发布评论不可物理删除；只能 redaction，并留下审计痕迹 |
| 编辑规则 | Public 评论发布后不可原地编辑；需要修正时追加新评论 |
| @mention | 仅通知有访问权限的内部用户；不会越权暴露工单 |
| AI 透明性 | AI 起草评论必须携带 `ai_generated=true`，并要求人工确认后方可发送 |

**Attachment**

| 字段 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| attachment_id | UUID | Y | 主键 |
| org_id | UUID | Y | 所属组织 |
| workspace_id | UUID | Y | 所属工作区 |
| parent_type | Enum | Y | `ticket` / `comment` / `approval` |
| parent_id | UUID | Y | 所属对象 |
| uploader_id | UUID | N | 上传人 |
| original_filename | String | Y | 原文件名 |
| mime_type | String | Y | MIME 类型 |
| size_bytes | Integer | Y | 文件大小 |
| storage_key | String | Y | 存储路径 |
| checksum_sha256 | String | Y | 完整性校验 |
| scan_status | Enum | Y | 安全扫描结果 |
| status | Enum | Y | 生命周期状态 |
| uploaded_at | Timestamp | Y | 上传时间 |
| deleted_at | Timestamp | N | 删除时间 |

| 状态值 | 含义 | 可转移到 | 转换条件 |
|---|---|---|---|
| `uploading` | 正在上传 | `scanning` / `deleted` | 上传完成进入扫描；失败或取消则删除 |
| `scanning` | 正在病毒/类型校验 | `available` / `quarantined` | 扫描通过或阻断 |
| `available` | 可访问 | `deleted` / `expired` | 主动删除或到期清理 |
| `quarantined` | 已隔离 | `deleted` | 检出风险后不可被普通用户访问 |
| `deleted` | 已删除 | 无 | 终态 |
| `expired` | 因保留策略到期清理 | 无 | 终态 |

| 核心业务规则 | 说明 |
|---|---|
| 继承可见性 | Attachment 继承父对象的权限与租户边界 |
| 安全扫描 | 所有附件在 `available` 前必须通过扫描与 MIME 校验 |
| 大小限制 | MVP 默认单文件上限 25MB；超限直接拒绝接入 |
| 下载控制 | 所有下载链接必须是短时签名链接，且二次鉴权 |
| 审计要求 | 上传、下载、隔离、删除必须进入 AuditLog |

**Approval**

| 字段 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| approval_id | UUID | Y | 主键 |
| ticket_id | UUID | Y | 所属工单 |
| template_type | Enum | Y | `access_request` / `procurement` / `employee_change` |
| requested_by_contact_id | UUID | Y | 发起人 |
| requested_for_contact_id | UUID | N | 代他人申请时的目标人 |
| justification | Text | Y | 申请理由 |
| step_index | Integer | Y | 当前步骤 |
| steps | JSON | Y | 审批步骤定义 |
| decision_mode | Enum | Y | `all_of` / `any_of` |
| due_at | Timestamp | N | 审批截止时间 |
| status | Enum | Y | 生命周期状态 |
| final_decision_at | Timestamp | N | 终决时间 |
| final_decision_by | UUID | N | 终决人 |
| rejection_reason | Text | N | 拒绝理由 |
| payload | JSON | Y | 场景特定字段载荷 |

| 状态值 | 含义 | 可转移到 | 转换条件 |
|---|---|---|---|
| `draft` | 草稿 | `pending` / `cancelled` | 提交后进入待审批 |
| `pending` | 审批中 | `approved` / `rejected` / `cancelled` / `expired` | 全部步骤通过、任一阻断拒绝、请求撤回或超时 |
| `approved` | 审批通过 | 无 | 终态 |
| `rejected` | 审批拒绝 | 无 | 终态 |
| `cancelled` | 发起方或管理员取消 | 无 | 终态 |
| `expired` | 超时失效 | 无 | 终态 |

| 核心业务规则 | 说明 |
|---|---|
| 流程模板 | MVP 仅内置三类模板：权限申请、采购、员工变更 |
| 步骤模型 | 每个步骤支持 `all_of` 或 `any_of` 决策政策 |
| 阻断效果 | 需要审批的工单在最终 `approved` 前不可进入实际执行完成态 |
| 版本策略 | 最终状态后不可修改；如需重提，创建新的 Approval 版本并关联旧版本 |
| 透明性 | 审批系统消息会镜像为 Ticket 的内部系统备注，便于追踪 |

**Contact**

| 字段 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| contact_id | UUID | Y | 主键 |
| org_id | UUID | Y | 所属组织 |
| external_ref | String | N | 外部系统标识，如 employee_id / vendor_id |
| full_name | String | Y | 姓名 |
| primary_email | String | Y | 主邮箱 |
| contact_type | Enum | Y | `employee` / `contractor` / `vendor` / `system` |
| department | String | N | 部门 |
| location | String | N | 地点 |
| manager_contact_id | UUID | N | 上级联系人 |
| locale | String | N | 语言 |
| timezone | String | N | 时区 |
| auth_linked | Boolean | Y | 是否关联登录身份 |
| status | Enum | Y | 生命周期状态 |
| created_via | Enum | Y | `email_auto_create` / `form` / `idp_sync` / `api` |

| 状态值 | 含义 | 可转移到 | 转换条件 |
|---|---|---|---|
| `pending_verification` | 联系方式待确认 | `active` / `deactivated` | 验证通过后激活 |
| `active` | 可被路由、通知、授权 | `suspended` / `deactivated` / `anonymized` | 管理员操作或合规处理 |
| `suspended` | 暂停交互 | `active` / `deactivated` | 恢复或停用 |
| `deactivated` | 不再产生新动作 | `anonymized` | 离职/合同终止后可匿名化 |
| `anonymized` | PII 已脱敏保留关联 | 无 | 终态 |

| 核心业务规则 | 说明 |
|---|---|
| 唯一性 | 组织内 `primary_email` 规范化后唯一 |
| 历史留存 | `deactivated` Contact 仍能保留历史工单与审批关联 |
| 身份关联 | Contact 可不具备登录能力；登录能力来自 User/AuthIdentity |
| 同步策略 | IdP 同步优先更新联系方式与组织属性，但不覆盖业务历史 |

**Team**

| 字段 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| team_id | UUID | Y | 主键 |
| workspace_id | UUID | Y | 所属工作区 |
| name | String | Y | 团队名 |
| team_type | Enum | Y | `it_support` / `hr_services` / `finance_ap` / `ops` |
| lead_user_id | UUID | Y | 团队负责人 |
| member_user_ids | JSON | Y | 成员列表 |
| approver_pool_ids | JSON | N | 可用审批池 |
| default_queue_ids | JSON | N | 默认队列 |
| business_hours_calendar | JSON | N | 默认工作时间 |
| field_visibility_policy | JSON | N | 字段可见性策略 |
| status | Enum | Y | 生命周期状态 |
| archived_at | Timestamp | N | 归档时间 |

| 状态值 | 含义 | 可转移到 | 转换条件 |
|---|---|---|---|
| `draft` | 草稿 | `active` / `archived` | 完成 lead 与成员后可激活 |
| `active` | 正常服务 | `paused` / `archived` | 主动暂停或归档 |
| `paused` | 暂停接新职责 | `active` / `archived` | 恢复或归档 |
| `archived` | 历史只读 | 无 | 终态 |

| 核心业务规则 | 说明 |
|---|---|
| 负责人要求 | Active Team 必须有且仅有一个 `lead_user_id` |
| 队列归属 | 队列必须归属于一个 Team；Team 可拥有多个 Queue |
| 字段隔离 | HR/Finance Team 可以配置更严格的字段遮罩策略 |
| 权限继承 | Team Lead 与 Agent 的范围默认从 Team 派生到 Queue |

**Tag**

| 字段 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| tag_id | UUID | Y | 主键 |
| workspace_id | UUID | Y | 所属工作区 |
| name | String | Y | 标签名 |
| category | Enum | Y | `topic` / `risk` / `source` / `resolution` |
| color | String | N | 展示颜色 |
| apply_scope | Enum | Y | `ticket` / `contact` / `approval` |
| source | Enum | Y | `manual` / `rule` / `ai` |
| governance_owner_id | UUID | N | 治理责任人 |
| status | Enum | Y | 生命周期状态 |
| usage_count | Integer | Y | 使用次数 |

| 状态值 | 含义 | 可转移到 | 转换条件 |
|---|---|---|---|
| `draft` | 草稿 | `active` / `archived` | 发布后激活 |
| `active` | 可应用 | `archived` | 标签到期或治理收敛时归档 |
| `archived` | 历史保留，不可再新用 | `active` | 可恢复 |

| 核心业务规则 | 说明 |
|---|---|
| 唯一性 | 同一工作区内 `name + category` 唯一 |
| AI 约束 | MVP 中 AI 只能从 `active` 标签池内建议或应用，不自动创建新激活标签 |
| 历史保留 | 归档标签保留在历史记录上，但不得继续分配给新实体 |

**AuditLog**

Zendesk、Front 与 Jira 的官方文档都把 audit log 定义为“谁在什么时间改了什么”的治理基础；OWASP 则明确建议把应用级日志和安全/审计轨迹当作一等能力，并在必要时与普通业务日志分开管理。QueueDesk 的 AuditLog 设计因此必须偏 **append-only、可过滤、可导出、可关联**。citeturn9search0turn12view7turn12view8turn17view2

| 字段 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| log_id | UUID | Y | 主键 |
| org_id | UUID | Y | 所属组织 |
| workspace_id | UUID | N | 所属工作区 |
| actor_type | Enum | Y | `user` / `bot` / `system` |
| actor_id | UUID | N | 发起者 |
| source | Enum | Y | `web` / `api` / `worker` / `idp` |
| ip_address | String | N | 来源 IP |
| user_agent | String | N | UA |
| entity_type | String | Y | 被操作实体类型 |
| entity_id | UUID | N | 被操作实体 ID |
| action | String | Y | 动作，如 `ticket.status_changed` |
| before_json | JSON | N | 变更前快照 |
| after_json | JSON | N | 变更后快照 |
| metadata_json | JSON | N | 额外元信息 |
| correlation_id | String | N | 链路追踪 ID |
| happened_at | Timestamp | Y | 发生时间 |
| status | Enum | Y | 存储生命周期状态 |
| retention_until | Timestamp | N | 保留截止时间 |

| 状态值 | 含义 | 可转移到 | 转换条件 |
|---|---|---|---|
| `pending_ingest` | 待写入 | `committed` | 可靠写入后转已提交 |
| `committed` | 已提交且不可篡改 | `legal_hold` / `purged` | 命中法务保留或保留期结束 |
| `legal_hold` | 法务保留中 | `purged` | 保留解除且满足删除条件 |
| `purged` | 已清理 | 无 | 终态 |

| 核心业务规则 | 说明 |
|---|---|
| 追加写入 | `committed` 后不可原地修改内容；仅允许通过 redaction overlay 标记敏感值 |
| 关键事件覆盖 | 登录、权限变更、队列配置、SLA 变更、审批动作、导出、AI 建议采纳/拒绝必须记录 |
| 查询能力 | 必须支持按 actor、action、entity、date range、correlation_id 过滤 |
| 分离存储 | 审计日志与应用普通日志逻辑分离，避免相互覆盖与清理策略冲突 |
| 脱敏要求 | 密钥、令牌、密码、完整敏感载荷不得直接写入日志 |

## MVP 功能清单

本节采用 **Must Have / Should Have / Won’t Have** 分层。分层逻辑参考的是成熟产品的“用户最低预期”而不是“功能越多越好”：Freshdesk、Zendesk、JSM 已经把 intake、表单、队列、SLA 和 API 做成基本盘；Front 与 Hiver 验证了评论、共享协作、规则和审批对于队列型工作台同样不可缺席。QueueDesk 的 MVP 只保留真正构成“内部服务台闭环”的模块。citeturn14view1turn6view9turn14view3turn7search0turn6view0turn6view1turn6view2turn6view5turn12view0

| 模块 | 功能项 | 优先级 | 说明 |
|---|---|---|---|
| 工单接入 | Email intake，支持线程归并与自动回执 | Must Have | 绑定邮箱 → 自动建单/续帖 |
| 工单接入 | Web Form intake，支持按请求类型收集字段 | Must Have | 表单与字段映射到 Ticket/Approval |
| 工单接入 | Public API intake | Must Have | `POST /tickets`、`POST /comments`、状态更新 |
| 工单接入 | 请求人通过签名链接查看本人工单 | Must Have | 不依赖完整门户 |
| 工单接入 | Slack / Teams / Chat / Voice / 社媒接入 | Won’t Have | 放到后续版本 |
| 字段与请求类型 | typed custom fields、request type、默认值、校验 | Must Have | 支撑 HR / Finance / Access 三类流程 |
| 队列管理 | 队列创建、激活、暂停、归档 | Must Have | 队列是一等对象 |
| 队列管理 | 规则分派、轮询分派、手动认领 | Must Have | 最低可用治理能力 |
| 队列管理 | 负载均衡、技能路由、容量上限 | Should Have | 可在 MVP 后段或 v1 落地 |
| 队列管理 | 全局视觉化规则编辑器 | Won’t Have | MVP 不做复杂工作流编排 |
| SLA | 工作时间、节假日、首响/解决目标 | Must Have | 核心治理能力 |
| SLA | 暂停/恢复、预警、违约标记 | Must Have | 覆盖 requester / approval / on hold 场景 |
| SLA | 按请求类型/优先级分层目标 | Must Have | 至少支持 queue + priority + request type 范围 |
| SLA | 多级下一次响应目标 | Should Have | 首版可只做首响 + 解决 |
| 评论协作 | 公开回复、内部备注、@mention、附件 | Must Have | 区分 public 与 internal |
| 评论协作 | Watchers / followers | Should Have | 提升跨部门协作效率 |
| 评论协作 | 审批评论独立线程 UI | Won’t Have | 首版镜像为工单内部系统备注 |
| AI 辅助 | 自动分类建议 | Must Have | 类别、队列、标签、优先级建议 |
| AI 辅助 | 对话摘要 / 工单摘要 | Must Have | 首屏快速理解上下文 |
| AI 辅助 | 建议回复草稿 | Must Have | human-in-the-loop，默认不自动发送 |
| AI 辅助 | 自动执行批准、自动改权限、自动发采购承诺 | Won’t Have | 高风险动作禁止全自动 |
| 权限模型 | 8 角色模型 | Must Have | 按本 PRD 的角色定义落地 |
| 权限模型 | 字段级可见性与组织/工作区/团队作用域 | Must Have | 尤其适用于 HR / Finance |
| 权限模型 | SAML / SCIM | Should Have | 首版可先支持邮件登录或 Google/Microsoft SSO |
| 审批流 | 权限申请模板 | Must Have | Manager → System Owner → IT |
| 审批流 | 采购模板 | Must Have | Manager → Finance，可按金额阈值扩展 |
| 审批流 | 员工变更模板 | Must Have | Manager → HR → IT |
| 审批流 | 动态 BPMN 设计器 | Won’t Have | 用模板 + 条件分支即可 |
| 审计日志 | 关键动作写审计、筛选、导出 CSV/JSON | Must Have | 组织/工作区管理员可访问 |
| 审计日志 | 异常检测与 SIEM 深度整合 | Should Have | 非 MVP 核心 |
| 基础报表 | 工单量、SLA 达标、解决时长、backlog aging、审批周期、团队负载 | Must Have | 预置看板 + CSV 导出 |
| 基础报表 | 自定义报表 builder | Should Have | 首版不做复杂拖拽构建器 |
| 知识/自助 | 回复模板与常见答案片段 | Should Have | 为 AI 建议回复提供基础 grounding |
| 知识/自助 | 完整知识库与门户内容管理 | Won’t Have | MVP 不做内容平台 |

## 用户故事与验收标准

下面的用户故事刻意保持“窄而可测”。它们对应的是公开官方产品里被反复验证的交互范式：**email/form/API → ticket、admin-built queues、reply vs private note、AI suggestion first、approval by email/inbox**。QueueDesk 的实现应优先满足这些交互，再考虑体验打磨。citeturn14view1turn6view9turn6view0turn14view5turn6view6turn6view2

| 功能域 | 用户故事 | 验收标准 |
|---|---|---|
| 邮件接入 | 作为员工，我希望把邮件发到 `it@company.com` 后自动生成工单，并收到回执。 | 当邮件进入已绑定邮箱时，系统在 P95 60 秒内创建或续帖；系统用 `Message-ID / In-Reply-To / References` 做线程归并；若命中 `closed` 工单则创建 follow-up ticket；系统自动回执票号、当前状态和签名访问链接。 |
| 表单接入 | 作为 HR 或 Finance 请求人，我希望按表单明确填写所需字段，避免后续来回补资料。 | 表单支持 request type；必填字段前后端双重校验；表单可绑定默认队列、默认 SLA 与审批模板；附件在扫描通过前不得进入可下载态。 |
| API 接入 | 作为集成系统，我希望通过 API 代表外部系统创建工单与同步状态。 | `POST /tickets` 支持 `Idempotency-Key`；调用方必须使用 scoped bot token；响应返回 `ticket_id`、`ticket_no` 与当前 `status`；越权队列写入返回 `403`。 |
| 队列创建 | 作为 Workspace Admin，我希望创建 `IT Support`、`HR Requests`、`AP Approvals` 等独立队列。 | 队列创建时必须指定 owner team、至少一个 intake source 或手工入口、默认排序策略；`draft` 队列不能接收新请求；激活后立即出现在相应角色的工作台。 |
| 分派与认领 | 作为 Team Lead，我希望系统能按规则或轮询自动分派，同时保留人工覆盖。 | 新票创建后按 `queue -> rules -> assignee` 顺序执行；轮询会跳过 `away`、`inactive` 或超容量成员；人工手动改派优先于自动分派；每一次改派写入 AuditLog。 |
| SLA 定义 | 作为 Workspace Admin，我希望按队列、请求类型和优先级定义 SLA。 | 系统支持 business hours + holidays；每条 SLA 至少支持 `first_response` 与 `resolution`；可配置 start/pause/stop conditions；策略激活前必须完成校验。 |
| SLA 运行 | 作为 Agent，我希望能看到当前工单是否即将违约或已违约。 | Ticket detail 与 Queue list 显示剩余时间、risk state、breach state；进入 `waiting_on_requester` / `waiting_on_approval` / `on_hold` 时按策略暂停；恢复事件发生时从剩余时间继续计算。 |
| 公开回复 | 作为 Agent，我希望给请求人发送可追踪的正式回复。 | `public` 评论会通过对应渠道发送；请求人仅可见 `public` 评论；发送后的 public 评论不可原地编辑；若发送失败，工单进入发送失败状态提示并写审计事件。 |
| 内部备注 | 作为 Agent，我希望在不打扰请求人的前提下与同事协作。 | `internal` 评论对 External Requester 完全不可见；@mention 仅通知有权限查看该工单的内部成员；内部备注允许在编辑窗口内修改，超时后只能追加更正备注。 |
| AI 分类 | 作为 Triage Agent，我希望 AI 先给出类别、队列、标签与优先级建议。 | AI 只从已发布 taxonomy 中建议，不生成自由类别；返回建议值、置信度与理由；低于阈值时仅显示“需人工判断”；采纳/拒绝结果被记录用于离线评估。 |
| AI 摘要 | 作为接手工单的 Agent，我希望在 5 秒内理解上下文。 | Ticket detail 首屏展示 AI 摘要卡片；摘要基于当前票公开内容、内部可见内容与结构化字段生成；无权限字段不得进入摘要上下文；摘要生成失败不影响工单正常处理。 |
| AI 建议回复 | 作为 Agent，我希望 AI 提供可编辑的草稿，而不是替我直接发送。 | AI 生成的回复默认进入 draft 区；必须由人工点击发送；草稿需标记来源模型与时间；每次生成都写入审计事件，但日志中不得泄露原始敏感提示词上下文。 |
| 权限控制 | 作为 Workspace Admin，我希望不同角色看到不同能力和数据范围。 | 所有页面、API、导出动作都做服务端鉴权；Viewer 无法回复或变更工单；Approver 只能看与审批相关的必要上下文；External Requester 只能访问本人票；Integration Bot 无法登录 UI。 |
| Token 管理 | 作为 Workspace Admin，我希望给 HRIS 或 IAM 一个最小权限机器人账号。 | Token 必须绑定 workspace/queue/action scopes；支持撤销与轮换；撤销后立即失效；所有 token 创建、查看、轮换、撤销动作都进入 AuditLog。 |
| 权限申请审批 | 作为员工，我希望申请软件权限时流程清楚，系统能自动流转给正确审批人。 | Request type 为 `access_request` 时，Ticket 可直接进入 `waiting_on_approval`；payload 至少包含系统名称、权限级别、时长、理由；模板默认步骤为 Manager → System Owner → IT；任一步骤拒绝则 Approval 终止为 `rejected`，Ticket 不可继续履约。 |
| 采购审批 | 作为财务团队成员，我希望对采购请求能看到金额、供应商、预算信息并进行审批。 | `procurement` 必须包含金额、币种、供应商、成本中心/预算编码；金额阈值可触发附加审批人；审批通过后 Ticket 自动回到执行队列；审批拒绝会自动通知请求人并要求重新提交新版本。 |
| 员工变更审批 | 作为 HR 团队成员，我希望员工岗位、部门或入离转调请求可跨部门审批。 | `employee_change` 必须包含目标员工、变更类型、生效日期；默认步骤为 Manager → HR；若涉及权限变更则自动追加 IT 步骤；生效日期在审批通过前只读不可执行。 |
| 审计日志 | 作为 Org Owner，我希望在有人改规则、导出数据或采纳 AI 建议时可追溯。 | AuditLog 至少记录 actor、time、entity、action、before/after、correlation_id；支持按日期、 actor、action、entity 过滤；支持 CSV/JSON 导出；普通 Viewer 与 Approver 不可访问。 |
| 基础报表 | 作为 Team Lead，我希望看到队列表现而不是只看单票。 | 预置报表至少包含 ticket volume、open backlog、aging、first response attainment、resolution attainment、approval cycle time、assignee load；支持按队列/团队/时间过滤；导出 CSV；数据新鲜度不超过 15 分钟。 |

## 非功能需求与范围边界

QueueDesk 处理的是员工请求、访问权限、采购与 HR 变更，天然涉及个人数据、权限变更和审计要求。因此，非功能需求必须把 **安全控制、访问控制、日志、数据最小化与多租户隔离** 放在第一优先级。OWASP ASVS 提供 web 应用安全验证基线；OWASP Logging 要求把应用安全事件与审计轨迹作为一等能力；NIST 将 RBAC 视为企业主流访问控制模型；AWS 与 OWASP 都强调多租户隔离不能只依赖登录与权限，而要在 tenant context 上硬性约束资源访问；GDPR 官方摘要则强调个人数据控制权、记录留存与风险导向义务。citeturn17view1turn17view2turn17view0turn14view8turn14view9turn18search1turn16search4

| 类别 | MVP 非功能要求 |
|---|---|
| 性能 | Ticket list / detail / assignment action 的 P95 响应时间 ≤ 2 秒；Form/API 建单 P95 ≤ 3 秒；Email intake 从邮件抵达至建单 P95 ≤ 60 秒；90 天窗口内预置报表打开时间 P95 ≤ 10 秒；大导出走异步后台任务。 |
| 可用性 | 目标月度可用性 99.5%；计划维护需提前公告；备份每日执行，恢复演练至少每季度一次；RPO ≤ 15 分钟，RTO ≤ 4 小时。 |
| 安全 | 以 OWASP ASVS Level 2 为开发基线；全站 TLS 1.2+；数据库、对象存储与备份默认加密；所有附件先扫描后可用；高风险管理操作要求二次确认；所有权限判断服务端执行。 |
| 访问控制 | 采用 `RBAC + scope + field masking + action guard`；任何数据查询都必须带 `tenant context`；HR/Finance 敏感字段支持字段级脱敏；审批只暴露必要上下文。 |
| 审计与日志 | 审计日志 append-only；普通应用日志与 AuditLog 分离；日志中不得写入密码、原始密钥、完整 token 与未脱敏敏感载荷；所有导出、权限变更、审批决策、AI 建议采纳必须可追踪。 |
| 隐私与合规 | 仅收集完成流程所必需的字段；支持手工触发的数据导出与删除处理流程；支持保留策略；Contact 匿名化后仍保持历史引用完整；AI 上下文进入模型前必须做敏感字段裁剪。 |
| 多租户隔离 | 所有主业务表、索引、缓存键、对象存储路径、搜索索引、AI 向量空间必须显式带 `org_id` / `workspace_id`；跨租户查询在服务端默认拦截；异步任务、Webhook 与导出必须继承租户上下文；实现 noisy-neighbor 保护与速率限制。 |
| AI 治理 | AI 默认只做建议、不做自动外发、不做自动批准、不做自动权限变更；必须支持按工作区关闭 AI；必须记录模型版本、提示模板版本、建议采纳结果；AI 失败时系统自动回退到纯人工流程。 |
| 可维护性 | API 使用版本化路径 `/api/v1`；核心状态变化使用领域事件；所有枚举在单独 schema 中管理；配置变更均可审计；要求测试覆盖工单、SLA、审批、权限四条主链路。 |

上传研究也建议把 **私有化、数据驻留与更复杂的企业治理** 放到后续版本，而不是在 MVP 一开始就同时做完；这与官方竞品的产品层级也一致——Front 已经走到全渠道消息与语音，JSM Premium 已包含资产、变更、事件和虚拟代理，Zendesk 也覆盖员工服务、质量、WFM 与更完整的 AI 套件。QueueDesk 为了保证“轻、快、可上线”，必须明确不做范围。fileciteturn0file0 citeturn19view0turn19view1turn19view2turn12view0

| 明确不做 | 原因 | 何时重评 |
|---|---|---|
| 全渠道客服能力（Chat、Voice、WhatsApp、社媒） | 会把产品推向 Zendesk / Front 的完整客服平台竞争 | 当 Email/Form/API 渠道稳定、试点客户明确提出扩展时 |
| CMDB / Asset Management | 属于更重的 ITSM 领域，显著增加模型和 UI 复杂度 | 当 IT 场景占比高且需要设备/软件资产联动时 |
| Incident / Problem / Change 完整流程 | 偏 JSM / ServiceNow 深水区，不适合 MVP | 当进入更大企业或 IT 运维场景后 |
| 可视化流程设计器 / BPMN | 过早平台化会拖慢交付 | 当三类审批模板已被多客户验证后 |
| 完整知识库平台 | MVP 先用回复模板与答案片段支撑 AI | 当需要自助门户时 |
| 自定义报表构建器 | 首版只做预置报表更可控 | 当指标口径稳定后 |
| SAML / SCIM / 高级身份治理 | 首版优先跑通核心服务台闭环 | 当客户进入正式安全采购阶段 |
| 多区域数据驻留 / 私有化部署 | 交付与运维成本高，不适合 MVP | 进入 v2 / Enterprise 版本 |
| 完全自治 AI Agent | 高风险动作不可交给 AI 自动执行 | 当审批、权限与执行边界有成熟 policy engine 后 |
| 移动 App | 会分散有限研发资源 | 当桌面端流程跑通并有明确一线移动需求后 |

| MVP 上线门槛 | 判定标准 |
|---|---|
| 功能完整性 | Email、Form、API、Queue、SLA、Comments、Approvals、AuditLog、Reports 八条主链路全部可用 |
| 权限安全性 | 八角色服务端鉴权通过；随机抽查 20 个越权场景全部拒绝 |
| 数据可靠性 | 备份、恢复、导出、审计全链路通过演练 |
| AI 可控性 | 所有 AI 功能都可关闭；无一处外部回复、审批、执行为默认自动动作 |
| 试点可用性 | 至少可支撑 3 个真实队列：IT 支持、HR 请求、权限申请/采购之一 |
| 可观测性 | 主流程具备 trace_id、错误告警、SLA 延迟告警与导出任务监控 |

本 PRD 的结论可以压缩成一句话：**QueueDesk MVP 不是“再做一个轻客服系统”，而是“把内部请求收口、排队、治理、审批和可追踪 AI 助理放进同一个轻量工作台”**。只要研发团队严格守住“规则优先、AI 建议优先、审批阻断、审计先行、范围克制”五条原则，MVP 就有机会在 20–500 人团队里形成清晰的替代价值。fileciteturn0file0 citeturn6view0turn6view1turn6view2turn6view6turn17view2turn14view8