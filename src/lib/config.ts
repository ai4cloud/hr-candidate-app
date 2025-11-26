/**
 * 项目配置文件
 * 包含多租户支持和其他全局配置
 */

export const config = {
  /**
   * 环境配置
   * NODE_ENV: Next.js 构建模式 (development/production/test)
   * APP_ENV: 实际部署环境 (development/test/stage/production)
   */
  env: {
    // Next.js 构建模式
    nodeEnv: process.env.NODE_ENV || 'development',
    // 实际部署环境
    appEnv: process.env.APP_ENV || process.env.NODE_ENV || 'development',
    // 是否为生产环境
    isProduction: process.env.APP_ENV === 'production',
    // 是否为预发布环境
    isStage: process.env.APP_ENV === 'stage',
    // 是否为测试环境
    isTest: process.env.APP_ENV === 'test',
    // 是否为开发环境
    isDevelopment: process.env.APP_ENV === 'development' || !process.env.APP_ENV
  },
  /**
   * 多租户配置
   */
  tenant: {
    // 默认租户ID，从环境变量读取，用于所有person子表的保存
    defaultTenantId: parseInt(process.env.TENANT_ID || '600', 10)
  },

  /**
   * 数据库配置
   */
  database: {
    // 软删除标记
    deletedFlag: true,
    // 未删除标记
    activeFlag: false
  },

  /**
   * 业务配置
   */
  business: {
    // 求职期望最大数量
    maxJobPreferences: 3,
    // 教育经历最大数量
    maxEducations: 10,
    // 工作经历最大数量
    maxWorkExperiences: 20,
    // 项目经历最大数量
    maxProjects: 20
  }
} as const

/**
 * 获取默认租户ID
 */
export const getDefaultTenantId = (): number => {
  return config.tenant.defaultTenantId
}

/**
 * 获取当前时间戳
 */
export const getCurrentTimestamp = (): Date => {
  return new Date()
}

/**
 * 生成通用的创建数据对象
 */
export const createBaseData = (tenantId?: number) => {
  const now = getCurrentTimestamp()
  return {
    tenantId: BigInt(tenantId || getDefaultTenantId()),
    createTime: now,
    updateTime: now,
    deleted: config.database.activeFlag
  }
}

/**
 * 生成通用的更新数据对象
 */
export const createUpdateData = () => {
  return {
    updateTime: getCurrentTimestamp()
  }
}
