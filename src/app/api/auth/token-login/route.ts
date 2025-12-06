import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateToken } from '@/lib/crypto'

export async function POST(request: NextRequest) {
    try {
        const { token } = await request.json()

        if (!token) {
            return NextResponse.json(
                { error: '缺少Token参数' },
                { status: 400 }
            )
        }

        console.log('[Token Login] Validating token:', token.substring(0, 20) + '...')

        // 1. 验证Token格式和有效期
        try {
            validateToken(token)
        } catch (error) {
            console.error('[Token Login] Token validation failed:', error)
            return NextResponse.json(
                {
                    error: 'Token无效或已过期',
                    message: error instanceof Error ? error.message : '无效的链接'
                },
                { status: 401 }
            )
        }

        // 2. 根据Token查找用户
        // 注意：这里我们仅凭Token信任用户，不验证手机号。
        // 这适用于微信自动登录等“已授权”场景。
        const person = await prisma.hrPerson.findFirst({
            where: {
                recordAccessToken: token,
                deleted: false
            }
        })

        if (!person) {
            console.error('[Token Login] Person not found for token')
            return NextResponse.json(
                { error: '用户不存在' },
                { status: 404 }
            )
        }

        console.log('[Token Login] Success for person:', person.id.toString())

        return NextResponse.json({
            success: true,
            personId: person.id.toString(),
            recordStatus: person.recordStatus,
            // 返回一些基本信息供前端显示
            name: person.name,
            phone: person.phone,
            avatarUrl: person.avatarUrl
        })

    } catch (error) {
        console.error('[Token Login] Error:', error)
        return NextResponse.json(
            { error: '登录失败', message: '系统错误' },
            { status: 500 }
        )
    }
}
