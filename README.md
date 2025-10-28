# HR 候选人简历表单应用

基于 Next.js 15 构建的现代化 HR 候选人简历填写系统，支持多步骤表单、自动保存、文件上传等功能。

## 项目简介

HR 候选人简历表单应用是一个专为 HR 候选人管理设计的 Web 应用。候选人可以通过加密令牌访问系统，填写全面的职业信息，包括基本信息、教育经历、工作经验、项目经验、技能特长等。系统具有自动草稿保存功能，确保数据不会丢失，并支持多租户部署。

## 核心功能

- **10 步简历向导流程**
  - 基本信息：个人详情、联系方式、身份证信息
  - 求职期望：最多 3 个职位偏好
  - 教育经历：学历、学位、在校情况
  - 工作经验：公司、职位、职责业绩
  - 项目经验：项目详情、技术栈、成就
  - 技能特长：技能熟练度和使用年限
  - 资格证书、培训经历、语言能力（规划中）
  - 预览与提交

- **智能特性**
  - 🔐 基于 AES 加密令牌的安全访问
  - 💾 自动草稿保存（字段变化 1 秒后 + 每 2 分钟）
  - ✅ 表单验证与进度跟踪
  - 📸 文件上传与预览（头像、身份证、证书等）
  - 📱 响应式设计，支持移动端
  - 🏢 多租户架构支持

## 技术栈

### 前端
- **Next.js 15.4.3** - React App Router + SSR
- **React 19.1.0** - 最新版 React with TypeScript
- **Tailwind CSS 4** - 实用优先的 CSS 框架
- **Lucide React** - 现代化图标库

### 后端与数据库
- **Prisma 6.12.0** - 类型安全的 ORM
- **MySQL** - 关系型数据库
- **Node.js** - 服务器运行时

### 安全与工具
- **crypto-js 4.2.0** - AES 加密/解密
- **Playwright 1.54.2** - E2E 测试框架

## 环境要求

- Node.js 18.x 或更高版本
- MySQL 5.7+ 或 MySQL 8.0+
- npm 或 yarn 或 pnpm

## 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd hr-candidate-app
```

### 2. 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 3. 配置环境变量

创建 `.env` 文件：

```env
# 数据库配置
DATABASE_URL="mysql://username:password@localhost:3306/hr_database"

# 应用配置
NEXT_PUBLIC_TENANT_ID=600
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000

# 加密配置（与后端保持一致）
AES_SECRET_KEY=your-secret-key-here
AES_IV=your-iv-here
```

### 4. 初始化数据库

```bash
# 生成 Prisma 客户端
npm run prisma:generate

# 运行数据库迁移（如果有迁移文件）
npx prisma migrate dev

# 或者直接导入 SQL 文件
mysql -u username -p database_name < path/to/schema.sql
```

### 5. 启动开发服务器

```bash
npm run dev
```

打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 可用脚本

```bash
# 开发模式（使用 Turbopack）
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 代码检查
npm run lint

# 生成 Prisma 客户端
npm run prisma:generate

# 数据库迁移
npm run prisma:migrate
```

## 项目结构

```
hr-candidate-app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API 路由
│   │   │   ├── person/         # 候选人数据管理
│   │   │   ├── dict/           # 字典数据
│   │   │   ├── upload/         # 文件上传
│   │   │   └── ...
│   │   └── resume-wizard/      # 简历表单页面
│   ├── components/             # React 组件
│   │   ├── forms/              # 表单组件
│   │   └── ui/                 # UI 组件
│   ├── lib/                    # 工具库
│   │   ├── prisma.ts           # Prisma 客户端
│   │   ├── crypto.ts           # 加密工具
│   │   ├── config.ts           # 配置
│   │   └── person-utils.ts     # 业务逻辑
│   └── generated/              # 生成的代码
│       └── prisma/             # Prisma 客户端
├── prisma/
│   └── schema.prisma           # 数据库模式
├── public/                     # 静态资源
└── ...
```

## 使用指南

### 生成访问令牌

候选人需要通过加密令牌访问系统。可以使用 `lib/test-token.ts` 生成测试令牌：

```typescript
import { generateTestToken } from '@/lib/test-token'

const token = generateTestToken({
  personId: '123',
  mobile: '13800138000',
  expiresIn: 7 * 24 * 60 * 60 * 1000 // 7 天
})

// 访问 URL: http://localhost:3000/resume-wizard/${token}
```

### API 端点

#### 候选人管理
- `GET /api/person/[personId]` - 获取候选人数据
- `POST /api/person/[personId]/save-draft` - 保存草稿
- `POST /api/person/[personId]/submit` - 提交简历

#### 参考数据
- `GET /api/dict/*` - 字典数据
- `GET /api/industry` - 行业目录
- `GET /api/skills/catalog` - 技能目录

#### 文件上传
- `POST /api/upload` - 上传文件

## 开发指南

### 添加新的表单步骤

1. 在 `src/components/forms/` 创建新表单组件
2. 在 `src/app/resume-wizard/[token]/form/page.tsx` 添加步骤配置
3. 更新 API 端点（如需要）
4. 添加数据验证逻辑

### 更新数据库模式

1. 修改 `prisma/schema.prisma`
2. 运行 `npm run prisma:generate` 生成客户端
3. 创建迁移：`npx prisma migrate dev --name your_migration_name`
4. 更新 TypeScript 类型定义

### 代码规范

- **文件命名**
  - 组件：PascalCase（如 `BasicInfoForm.tsx`）
  - 工具类：kebab-case（如 `person-utils.ts`）
  - API 路由：小写 + 方括号（如 `[personId]/route.ts`）

- **TypeScript**
  - 使用强类型，避免 `any`
  - 优先使用 Prisma 生成的类型
  - 为组件 Props 定义接口

## 配置说明

### 多租户配置

通过环境变量 `NEXT_PUBLIC_TENANT_ID` 设置租户 ID，默认为 600。

### 加密配置

确保 `AES_SECRET_KEY` 和 `AES_IV` 与后端 Java 服务保持一致，支持 ECB 和 CBC 加密模式。

### 表单配置

在 `src/lib/config.ts` 中配置业务规则：
- 最大求职期望数量
- 表单验证规则
- 文件上传限制

## 故障排除

### 令牌验证失败

- 检查 `.env` 中的 `AES_SECRET_KEY` 和 `AES_IV`
- 确认加密模式与后端一致（ECB vs CBC）
- 检查令牌是否过期

### 数据库连接错误

- 验证 `DATABASE_URL` 格式正确
- 确保 MySQL 服务正在运行
- 检查数据库是否存在且已应用迁移

### 自动保存不工作

- 检查浏览器 sessionStorage 中的 `personId`
- 验证 API 端点可访问
- 查看浏览器控制台错误信息

### 文件上传失败

- 检查上传文件大小限制
- 确认文件类型被允许
- 验证服务器磁盘空间充足

## 性能优化

- ✅ 使用 Turbopack 加速开发构建
- ✅ 图片自动优化（Next.js Image）
- ✅ 字体优化（next/font）
- ✅ API 路由缓存
- ✅ 防抖的自动保存

## 测试

```bash
# 运行 E2E 测试（需要配置 Playwright）
npx playwright test

# 运行单个测试
npx playwright test tests/resume-form.spec.ts
```

## 部署

### Vercel 部署

1. 推送代码到 GitHub/GitLab
2. 在 Vercel 导入项目
3. 配置环境变量
4. 自动部署

### Docker 部署

```bash
# 构建镜像
docker build -t hr-candidate-app .

# 运行容器
docker run -p 3000:3000 --env-file .env hr-candidate-app
```

## 相关资源

- [Next.js 文档](https://nextjs.org/docs)
- [Prisma 文档](https://www.prisma.io/docs)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [React 文档](https://react.dev)

## 许可证

[MIT License](LICENSE)

## 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 Issue
- 发送邮件至 [daizhenzhong@gmail.com]

---

**注意**：本项目为企业内部使用，包含敏感数据处理功能，请确保正确配置安全措施。
