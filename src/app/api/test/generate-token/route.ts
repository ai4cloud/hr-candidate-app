import { NextRequest, NextResponse } from 'next/server'
import { generateTestToken } from '@/lib/test-token'

export async function GET(request: NextRequest) {
  // 只在开发环境下允许访问
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: '仅在开发环境可用' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const personId = parseInt(searchParams.get('personId') || '1')
  const mobile = searchParams.get('mobile') || '13800138000'
  const hours = parseInt(searchParams.get('hours') || '24')

  try {
    const token = generateTestToken(personId, mobile, hours)

    return NextResponse.json({
      success: true,
      token,
      personId,
      mobile,
      expiresIn: `${hours}小时`,
      loginUrl: `${request.nextUrl.origin}/resume-wizard/${encodeURIComponent(token)}`
    })
  } catch (error) {
    console.error('生成token失败:', error)
    return NextResponse.json(
      { error: '生成token失败' },
      { status: 500 }
    )
  }
}
