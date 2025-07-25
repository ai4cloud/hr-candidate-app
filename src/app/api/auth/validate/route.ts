import { NextRequest, NextResponse } from 'next/server'
import { validateToken } from '@/lib/crypto'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { token, phone } = await request.json()

    if (!token || !phone) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    console.log('收到验证请求:', {
      tokenLength: token.length,
      phone,
      tokenPreview: token.substring(0, 20) + '...'
    })

    // 验证token
    const tokenData = validateToken(token)

    // 验证手机号是否匹配
    if (tokenData.mobile !== phone) {
      return NextResponse.json(
        {
          error: '手机号验证失败',
          message: '您输入的手机号与邀请链接不匹配，请确认手机号是否正确。'
        },
        { status: 400 }
      )
    }

    let person

    if (tokenData.id) {
      // 新格式：使用token中的person ID查找候选人记录
      console.log('使用新格式token查找候选人，ID:', tokenData.id)
      person = await prisma.hrPerson.findFirst({
        where: {
          id: BigInt(tokenData.id),
          phone: phone,
          deleted: false
        }
      })
    } else {
      // 旧格式：使用手机号和token查找候选人记录
      console.log('使用旧格式token查找候选人，手机号:', phone)
      person = await prisma.hrPerson.findFirst({
        where: {
          phone: phone,
          recordAccessToken: token,
          deleted: false
        }
      })
    }

    if (!person) {
      return NextResponse.json(
        {
          error: '候选人记录不存在',
          message: '未找到对应的候选人记录，请联系HR确认。'
        },
        { status: 404 }
      )
    }

    // 对于新格式token，验证token是否匹配（可选的额外安全检查）
    if (tokenData.id && person.recordAccessToken && person.recordAccessToken !== token) {
      console.warn('Token不匹配，但继续处理（可能是新的token格式）')
    }

    return NextResponse.json({
      success: true,
      personId: person.id.toString(), // 将BigInt转换为字符串
      recordStatus: person.recordStatus
    })

  } catch (error) {
    console.error('Token验证失败:', error)
    
    if (error instanceof Error) {
      if (error.message === 'Token已过期') {
        return NextResponse.json(
          { 
            error: 'Token已过期',
            message: '很抱歉，您的填写链接已过期。请联系HR重新生成填写邀请链接。'
          },
          { status: 401 }
        )
      }
    }

    return NextResponse.json(
      { 
        error: '验证失败',
        message: '网络连接异常，请检查网络连接后重试。'
      },
      { status: 500 }
    )
  }
}
