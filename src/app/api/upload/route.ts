import { NextRequest, NextResponse } from 'next/server'
import { oauth2Client } from '@/lib/oauth2-client'

export async function POST(request: NextRequest) {
  try {
    console.log('收到文件上传请求')
    
    // 获取表单数据
    const formData = await request.formData()
    const file = formData.get('file') as File
    const directory = formData.get('directory') as string || 'uploads'

    if (!file) {
      return NextResponse.json({
        success: false,
        error: '请选择要上传的文件'
      }, { status: 400 })
    }

    // 验证文件大小 (最大10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({
        success: false,
        error: '文件大小不能超过10MB'
      }, { status: 400 })
    }

    // 验证文件类型
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        success: false,
        error: '不支持的文件类型'
      }, { status: 400 })
    }

    console.log('上传文件信息:', {
      name: file.name,
      size: file.size,
      type: file.type,
      directory: directory
    })

    // 测试OAuth2连接
    const connectionResult = await oauth2Client.testConnection()
    if (!connectionResult.success) {
      console.error('OAuth2连接失败:', connectionResult.error)
      return NextResponse.json({
        success: false,
        error: '文件服务连接失败，请稍后重试'
      }, { status: 500 })
    }

    // 上传文件到管理端
    const startTime = Date.now()
    const fileUrl = await oauth2Client.uploadFile(file, directory)
    const endTime = Date.now()

    console.log('文件上传成功:', {
      fileUrl,
      uploadTime: `${endTime - startTime}ms`
    })

    return NextResponse.json({
      success: true,
      message: '文件上传成功',
      data: {
        fileUrl,
        originalName: file.name,
        size: file.size,
        type: file.type,
        directory: directory,
        uploadTime: `${endTime - startTime}ms`
      }
    })

  } catch (error) {
    console.error('文件上传失败:', error)
    
    // 根据错误类型返回不同的错误信息
    let errorMessage = '文件上传失败，请稍后重试'
    
    if (error instanceof Error) {
      if (error.message.includes('OAuth2')) {
        errorMessage = '文件服务认证失败'
      } else if (error.message.includes('网络')) {
        errorMessage = '网络连接异常，请检查网络后重试'
      } else if (error.message.includes('文件')) {
        errorMessage = error.message
      }
    }
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

// 支持OPTIONS请求（CORS预检）
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
