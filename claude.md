# HR 候选人应用 - 项目文档

## 项目概述

**HR 候选人简历表单应用** 是一个基于 Web 的简历/履历填写系统，专为 HR 候选人管理而设计。它允许候选人通过直观的多步骤表单界面填写全面的职业信息，具有自动草稿保存和提交功能。该应用与后端 HR 管理系统集成，支持多租户部署。

## 技术栈

### 前端
- **Next.js 15.4.3** - React App Router，支持 SSR
- **React 19.1.0** - 最新版 React，使用 TypeScript 5
- **Tailwind CSS 4** - 实用优先的 CSS 框架
- **Lucide React** - 图标库

### 后端与数据库
- **Prisma 6.12.0** - 数据库 ORM
- **MySQL** - 通过 Prisma 连接的关系型数据库
- **Node.js** - 服务器运行时

### 安全与工具
- **crypto-js 4.2.0** - AES 加密/解密用于令牌处理
- **Playwright 1.54.2** - E2E 测试框架

### 开发工具
- **ESLint 9** - 代码检查
- **TypeScript 5** - 类型安全

## 项目结构

```
src/
├── app/
│   ├── api/                          # 后端 API 端点
│   │   ├── person/[personId]/        # 候选人数据管理
│   │   │   ├── route.ts              # 获取候选人数据
│   │   │   ├── save-draft/           # 保存草稿端点
│   │   │   ├── submit/               # 提交简历端点
│   │   │   └── skills/               # 技能管理
│   │   ├── auth/                     # 身份认证
│   │   ├── dict/                     # 字典/参考数据
│   │   ├── industry/                 # 行业目录
│   │   ├── skills/catalog/           # 技能目录
│   │   ├── upload/                   # 文件上传处理
│   │   └── test/                     # 测试端点
│   ├── resume-wizard/                # 主简历表单页面
│   │   ├── [token]/                  # 基于令牌的访问页面
│   │   └── [token]/form/             # 多步骤表单页面
│   ├── layout.tsx                    # 根布局与字体配置
│   └── page.tsx                      # 首页/落地页
├── components/
│   ├── forms/                        # 表单组件（约 4000 行代码）
│   │   ├── BasicInfoForm.tsx         # 个人信息表单
│   │   ├── EducationForm.tsx         # 教育经历
│   │   ├── WorkExperienceForm.tsx    # 工作经验
│   │   ├── ProjectExperienceForm.tsx # 项目经验
│   │   ├── SkillsForm.tsx            # 技能与熟练度
│   │   ├── JobExpectationForm.tsx    # 求职期望
│   │   └── PreviewForm.tsx           # 简历预览
│   └── ui/                           # 可复用 UI 组件
│       ├── CitySelector.tsx          # 城市选择下拉框
│       ├── IndustrySelector.tsx      # 行业选择
│       ├── DatePickerWithToday.tsx   # 日期选择器工具
│       └── ConfirmDialog.tsx         # 确认对话框
├── lib/
│   ├── config.ts                     # 配置（多租户、业务规则）
│   ├── crypto.ts                     # AES 加密/解密工具
│   ├── person-utils.ts               # 业务逻辑（身份证解析、年龄计算）
│   ├── prisma.ts                     # Prisma 客户端初始化
│   ├── oauth2-client.ts              # OAuth2 集成
│   └── test-token.ts                 # 测试令牌生成
└── generated/
    └── prisma/                       # 自动生成的 Prisma 客户端

prisma/
└── schema.prisma                     # 数据库模式定义
```

## 核心功能

### 简历向导 - 多步骤表单流程（10 个步骤）

1. **基本信息** - 个人详情（姓名、性别、出生日期、联系方式、身份证）
2. **求职期望** - 期望职位、行业、城市、薪资（最多 3 个偏好）
3. **教育经历** - 多条教育记录，支持全日制/非全日制标记
4. **工作经验** - 公司详情、职位、部门、工作职责
5. **项目经验** - 项目名称、技术栈、角色、成就
6. **技能与熟练度** - 技能及熟练程度和工作年限
7. **证书** - 专业资格证书（占位符）
8. **培训** - 培训历史（占位符）
9. **语言** - 语言能力（占位符）
10. **预览与提交** - 审查所有数据并提交简历

### 核心功能

- **基于令牌的访问** - 使用 AES 加密令牌实现安全的候选人邀请
- **自动草稿保存** - 每 2 分钟 + 字段变化时防抖保存（1 秒延迟）
- **多步骤导航** - 带进度跟踪和验证的侧边栏
- **表单验证** - 未完成必填字段时阻止进度推进
- **文件上传** - 头像、身份证照片、简历上传及预览
- **数据持久化** - 最终提交前的保存草稿功能
- **会话管理** - 基于 sessionStorage 的候选人 ID 跟踪
- **响应式 UI** - 使用 Tailwind CSS 的响应式设计，支持移动端

### 业务逻辑

- **软删除** - 所有记录标记为已删除而非永久删除
- **多租户支持** - 支持多组织部署的租户 ID
- **自动字段计算** - 从教育经历推断最高学历/学位
- **业务规则** - 防止多个"当前在职"工作记录

## 数据库模式

### 核心表

- **HrPerson** - 主候选人档案（100+ 字段）
- **HrPersonJobPref** - 求职期望（每个候选人最多 3 个）
- **HrPersonEducation** - 教育经历（不限数量）
- **HrPersonWork** - 工作经验（不限数量）
- **HrPersonProject** - 项目经验（不限数量）
- **HrPersonSkill** - 技能及熟练度
- **HrPersonCertificate** - 专业证书
- **HrPersonTraining** - 培训记录
- **HrPersonLanguage** - 语言能力

### 参考/目录表

- **HrSkillCatalog** - 预定义技能数据库
- **HrCertificateCatalog** - 证书类型
- **HrKeyUniversity** - 重点大学
- **HrIndustryCatalog** - 行业分类（层级结构）
- **SystemDictType** 与 **SystemDictData** - 通用系统字典

## API 端点

### 候选人管理
- `GET /api/person/[personId]` - 获取候选人数据
- `POST /api/person/[personId]/save-draft` - 保存表单草稿
- `POST /api/person/[personId]/submit` - 提交简历（最终）
- `POST /api/person/[personId]/skills` - 技能管理

### 参考数据
- `GET /api/dict/*` - 字典数据（国家、学历等）
- `GET /api/industry` - 行业目录
- `GET /api/skills/catalog` - 技能目录

### 工具类
- `POST /api/upload` - 文件上传端点
- `GET /api/test/*` - 测试端点（仅开发环境）

## 关键组件与入口点

### 前端入口点

**主表单页面**: `/src/app/resume-wizard/[token]/form/page.tsx`
- 管理所有表单状态和步骤导航
- 处理防抖的自动保存逻辑
- 控制表单提交工作流
- 动态渲染特定步骤的表单

**令牌验证页面**: `/src/app/resume-wizard/[token]/page.tsx`
- 验证加密令牌
- 创建/获取候选人记录
- 设置 sessionStorage 进行身份验证
- 重定向到表单页面

### 关键库文件

**prisma.ts** - 用于数据库访问的单例 Prisma 客户端

**crypto.ts** - 使用 AES ECB/CBC 模式的令牌加密/解密

**person-utils.ts** - 业务逻辑函数：
- `parseBirthDateFromIdCard()` - 从中国身份证提取出生日期
- `calculateAge()` - 带验证的年龄计算
- `calculateWorkExperience()` - 工作年限计算
- `processBasicInfo()` - 规范化候选人数据

**config.ts** - 应用配置：
- 多租户设置
- 业务规则（最大求职期望数量等）
- 环境特定设置

## 身份认证与安全

### 基于令牌的访问
- AES 加密（与 Java 后端兼容）
- 令牌包含：候选人 ID、手机号、过期时间戳
- 支持 ECB 和 CBC 加密模式以兼容后端
- 基于 sessionStorage 的会话状态管理

### 安全考虑
- 客户端无直接数据库访问
- 每次 API 请求都进行令牌验证
- 软删除保护数据完整性
- 文件上传验证

## 开发指南

### 安装配置

```bash
# 安装依赖
npm install

# 生成 Prisma 客户端
npm run prisma:generate

# 运行数据库迁移
npm run prisma:migrate

# 启动开发服务器
npm run dev
```

### 环境变量

创建 `.env` 文件：

```env
# 数据库
DATABASE_URL="mysql://user:password@localhost:3306/hr_db"

# 应用配置
NEXT_PUBLIC_TENANT_ID=600
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000

# 加密
AES_SECRET_KEY=your-secret-key-here
AES_IV=your-iv-here
```

### 主要脚本

- `npm run dev` - 使用 Turbopack 启动开发服务器
- `npm run build` - 构建生产版本
- `npm run start` - 启动生产服务器
- `npm run lint` - 运行 ESLint
- `npm run prisma:generate` - 生成 Prisma 客户端
- `npm run prisma:migrate` - 运行数据库迁移

## 重要技术细节

### 表单管理
- 使用 React Hooks（useState、useEffect）进行状态管理
- 防抖自动保存（1 秒延迟）避免过多 API 调用
- 2 分钟间隔的自动保存备份
- 字段级验证与错误消息提示
- 未完成必填字段时阻止表单推进

### 多租户架构
- 租户 ID 来自环境变量（默认：600）
- 所有个人相关记录都包含租户上下文
- 支持单次部署中的多个组织

### 构建配置
- 构建期间忽略 ESLint 和 TypeScript 错误（开发模式）
- 启用 Turbopack 以实现快速开发服务器
- Prisma 客户端生成到 `/src/generated/prisma`

### 测试
- 包含 Playwright 用于 E2E 测试
- 测试端点可在 `/api/test/*` 访问
- 根目录中的测试 HTML 文件用于手动测试
- `lib/test-token.ts` 中的令牌生成工具

## 代码规范

### 文件命名
- 组件：PascalCase（如 `BasicInfoForm.tsx`）
- 工具类：kebab-case（如 `person-utils.ts`）
- API 路由：小写，动态段使用方括号

### TypeScript 使用
- 整个应用程序中使用强类型
- Prisma 生成的数据库模型类型
- 表单数据的自定义类型定义

### 组件结构
- 使用 Hooks 的函数式组件
- Props 使用 TypeScript 接口进行类型定义
- 关注点分离（UI 与业务逻辑）

## 常见任务

### 添加新的表单步骤
1. 在 `src/components/forms/` 中创建表单组件
2. 在 `form/page.tsx` 的步骤数组中添加步骤
3. 如需要新数据模型则更新 API 端点
4. 添加验证逻辑

### 添加新的 API 端点
1. 在 `src/app/api/` 中创建路由处理器
2. 使用 `lib/prisma.ts` 中的 Prisma 客户端
3. 验证令牌和租户 ID
4. 适当处理错误

### 更新数据库模式
1. 修改 `prisma/schema.prisma`
2. 运行 `npm run prisma:generate`
3. 创建并运行迁移：`npx prisma migrate dev`
4. 根据需要更新 TypeScript 类型

## 故障排除

### 常见问题

**令牌验证失败**
- 检查 .env 中的 AES_SECRET_KEY 和 AES_IV
- 验证令牌加密模式与后端匹配（ECB vs CBC）

**数据库连接错误**
- 验证 .env 中的 DATABASE_URL
- 检查 MySQL 服务器是否正在运行
- 确保数据库存在且已应用迁移

**自动保存不工作**
- 检查 sessionStorage 中的 personId
- 验证 API 端点是否可访问
- 检查浏览器控制台中的错误

## 资源链接

- [Next.js 文档](https://nextjs.org/docs)
- [Prisma 文档](https://www.prisma.io/docs)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [React 文档](https://react.dev)
