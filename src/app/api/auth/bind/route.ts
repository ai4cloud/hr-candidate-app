import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
    try {
        const { phone, openid } = await request.json()

        if (!phone || !openid) {
            return NextResponse.json(
                { error: '缺少必要参数' },
                { status: 400 }
            )
        }

        // 1. 查找手机号对应的候选人
        const person = await prisma.hrPerson.findFirst({
            where: {
                phone: phone,
                deleted: false
            }
        })

        if (!person) {
            return NextResponse.json(
                {
                    error: '候选人不存在',
                    message: '该手机号尚未被HR录入，请联系HR。'
                },
                { status: 404 }
            )
        }

        // 2. 检查该候选人是否已经绑定了其他微信
        if (person.wechat_openid && person.wechat_openid !== openid) {
            // 策略：允许覆盖绑定？还是提示已绑定？
            // 需求文档未明确，但通常允许重新绑定，或者提示。
            // 这里假设允许重新绑定，或者这是同一个人换了微信号。
            console.log(`候选人 ${person.id} 更新微信绑定: ${person.wechat_openid} -> ${openid}`)
        }

        // 3. 检查该微信号是否已经绑定了其他人
        const existingBind = await prisma.hrPerson.findFirst({
            where: {
                wechat_openid: openid,
                deleted: false,
                NOT: {
                    id: person.id
                }
            }
        })

        if (existingBind) {
            return NextResponse.json(
                {
                    error: '微信已绑定',
                    message: '该微信号已绑定其他候选人，请联系HR解绑。'
                },
                { status: 409 }
            )
        }

        // 4. 执行绑定
        await prisma.hrPerson.update({
            where: { id: person.id },
            data: {
                wechat_openid: openid,
                updateTime: new Date()
            }
        })

        // 5. 返回成功及跳转Token
        return NextResponse.json({
            success: true,
            token: person.recordAccessToken,
            personId: person.id.toString(),
            recordStatus: person.recordStatus
        })

    } catch (error) {
        console.error('绑定失败:', error)
        return NextResponse.json(
            {
                error: '绑定失败',
                message: '系统错误，请稍后重试'
            },
            { status: 500 }
        )
    }
}
