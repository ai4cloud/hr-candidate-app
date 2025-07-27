/**
 * OAuth2 客户端工具类
 * 用于与管理端进行 OAuth2 认证和文件上传
 */

interface OAuth2TokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  scope?: string
}

interface FileUploadResponse {
  code: number
  data: {
    url: string
    filename: string
    size: number
  }
  msg: string
}

class OAuth2Client {
  private clientId: string
  private clientSecret: string
  private username: string
  private password: string
  private tokenUrl: string
  private fileUploadUrl: string
  private baseUrl: string
  private tenantId: string

  // 缓存的访问令牌
  private cachedToken: string | null = null
  private tokenExpiresAt: number = 0

  constructor() {
    this.clientId = process.env.OAUTH2_CLIENT_ID || ''
    this.clientSecret = process.env.OAUTH2_CLIENT_SECRET || ''
    this.username = process.env.OAUTH2_USERNAME || ''
    this.password = process.env.OAUTH2_PASSWORD || ''
    this.tokenUrl = process.env.OAUTH2_TOKEN_URL || ''
    this.fileUploadUrl = process.env.OAUTH2_FILE_UPLOAD_URL || ''
    this.baseUrl = process.env.ADMIN_SERVICE_BASE_URL || ''
    this.tenantId = process.env.TENANT_ID || '600'

    if (!this.clientId || !this.clientSecret || !this.username || !this.password || !this.tokenUrl) {
      throw new Error('OAuth2 配置不完整，请检查环境变量')
    }
  }

  /**
   * 获取访问令牌（支持缓存）
   */
  async getAccessToken(): Promise<string> {
    // 检查缓存的令牌是否还有效（提前5分钟过期）
    const now = Date.now()
    if (this.cachedToken && now < (this.tokenExpiresAt - 5 * 60 * 1000)) {
      return this.cachedToken
    }

    try {
      console.log('获取OAuth2访问令牌...')
      
      const response = await fetch(this.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`,
          'tenant-id': this.tenantId
        },
        body: new URLSearchParams({
          grant_type: 'password',
          username: this.username,
          password: this.password,
          scope: 'file.upload'
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('OAuth2令牌获取失败:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          url: this.tokenUrl,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'tenant-id': this.tenantId
          }
        })
        throw new Error(`OAuth2认证失败: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const tokenData: any = await response.json()

      console.log('OAuth2响应数据:', tokenData)

      // 检查不同的响应格式
      let accessToken: string | null = null

      if (tokenData.access_token) {
        // 标准OAuth2格式
        accessToken = tokenData.access_token
      } else if (tokenData.data && tokenData.data.access_token) {
        // 可能的嵌套格式
        accessToken = tokenData.data.access_token
      } else if (tokenData.code === 0 && tokenData.data) {
        // ruoyi-vue-pro可能的响应格式
        accessToken = tokenData.data.accessToken || tokenData.data.access_token
      }

      if (!accessToken) {
        throw new Error(`OAuth2响应中缺少access_token，响应格式: ${JSON.stringify(tokenData)}`)
      }

      // 缓存令牌
      this.cachedToken = accessToken
      this.tokenExpiresAt = now + ((tokenData.expires_in || 7200) * 1000) // 默认2小时

      console.log('OAuth2访问令牌获取成功:', {
        tokenType: tokenData.token_type || 'Bearer',
        expiresIn: tokenData.expires_in || 7200,
        scope: tokenData.scope,
        tokenLength: accessToken.length
      })

      return accessToken

    } catch (error) {
      console.error('获取OAuth2访问令牌失败:', error)
      throw error
    }
  }

  /**
   * 上传文件到管理端
   */
  async uploadFile(file: File, directory?: string): Promise<string> {
    try {
      const accessToken = await this.getAccessToken()

      const formData = new FormData()
      formData.append('file', file)
      if (directory) {
        formData.append('directory', directory)
      }

      console.log('上传文件到管理端:', {
        filename: file.name,
        size: file.size,
        type: file.type,
        directory: directory || 'default'
      })

      const response = await fetch(this.fileUploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'tenant-id': this.tenantId
        },
        body: formData
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('文件上传失败:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        })
        throw new Error(`文件上传失败: ${response.status} ${response.statusText}`)
      }

      const result: any = await response.json()

      console.log('文件上传响应:', result)

      if (result.code !== 0) {
        throw new Error(`文件上传失败: ${result.msg || '未知错误'}`)
      }

      // 管理端返回的是 CommonResult<String>，data 直接是文件URL字符串
      const fileUrl = result.data
      if (!fileUrl) {
        throw new Error('文件上传响应中缺少文件URL')
      }

      console.log('文件上传成功:', { fileUrl })
      return fileUrl

    } catch (error) {
      console.error('文件上传失败:', error)
      throw error
    }
  }

  /**
   * 测试OAuth2连接
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const token = await this.getAccessToken()
      return { success: !!token }
    } catch (error) {
      console.error('OAuth2连接测试失败:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }

  /**
   * 清除缓存的令牌
   */
  clearTokenCache(): void {
    this.cachedToken = null
    this.tokenExpiresAt = 0
  }

  /**
   * 获取配置信息（用于调试）
   */
  getConfig() {
    return {
      clientId: this.clientId,
      username: this.username,
      tokenUrl: this.tokenUrl,
      fileUploadUrl: this.fileUploadUrl,
      baseUrl: this.baseUrl,
      tenantId: this.tenantId,
      hasToken: !!this.cachedToken,
      tokenExpiresAt: new Date(this.tokenExpiresAt).toISOString()
    }
  }
}

// 导出单例实例
export const oauth2Client = new OAuth2Client()

// 导出类型
export type { OAuth2TokenResponse, FileUploadResponse }
