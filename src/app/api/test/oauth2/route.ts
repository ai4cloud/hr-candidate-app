import { NextRequest, NextResponse } from 'next/server'
import { oauth2Client } from '@/lib/oauth2-client'

export async function GET(request: NextRequest) {
  // 只在开发环境下允许访问
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: '仅在开发环境可用' }, { status: 403 })
  }

  try {
    console.log('开始测试OAuth2连接...')
    
    // 获取配置信息
    const config = oauth2Client.getConfig()
    console.log('OAuth2配置:', config)

    // 测试连接
    const startTime = Date.now()
    const connectionResult = await oauth2Client.testConnection()
    const endTime = Date.now()

    if (connectionResult.success) {
      // 获取访问令牌（用于显示）
      const token = await oauth2Client.getAccessToken()

      return NextResponse.json({
        success: true,
        message: 'OAuth2连接测试成功',
        config: {
          clientId: config.clientId,
          tokenUrl: config.tokenUrl,
          fileUploadUrl: config.fileUploadUrl,
          baseUrl: config.baseUrl,
          tenantId: config.tenantId
        },
        result: {
          connected: true,
          responseTime: `${endTime - startTime}ms`,
          tokenPreview: token.substring(0, 20) + '...',
          tokenLength: token.length,
          expiresAt: config.tokenExpiresAt
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'OAuth2连接测试失败',
        config: {
          clientId: config.clientId,
          tokenUrl: config.tokenUrl,
          fileUploadUrl: config.fileUploadUrl,
          baseUrl: config.baseUrl,
          tenantId: config.tenantId
        },
        result: {
          connected: false,
          responseTime: `${endTime - startTime}ms`,
          error: connectionResult.error
        }
      }, { status: 500 })
    }

  } catch (error) {
    console.error('OAuth2测试失败:', error)
    
    return NextResponse.json({
      success: false,
      message: 'OAuth2测试失败',
      error: error instanceof Error ? error.message : String(error),
      config: oauth2Client.getConfig()
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // 只在开发环境下允许访问
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: '仅在开发环境可用' }, { status: 403 })
  }

  try {
    const { action } = await request.json()

    if (action === 'clear-cache') {
      oauth2Client.clearTokenCache()
      return NextResponse.json({
        success: true,
        message: '令牌缓存已清除'
      })
    }

    if (action === 'get-token') {
      const token = await oauth2Client.getAccessToken()
      return NextResponse.json({
        success: true,
        token: token.substring(0, 50) + '...',
        tokenLength: token.length,
        config: oauth2Client.getConfig()
      })
    }

    return NextResponse.json({
      error: '不支持的操作'
    }, { status: 400 })

  } catch (error) {
    console.error('OAuth2操作失败:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
