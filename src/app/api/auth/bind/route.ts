import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
    try {
        const { phone, openid } = await request.json()

        console.log('[Bind API] Received request:', {
            phone,
            openid: openid ? `${openid.substring(0, 10)}...` : null
        })

        if (!phone || !openid) {
            console.error('[Bind API] Missing parameters')
            return NextResponse.json(
                { error: '缺少必要参数' },
                { status: 400 }
            )
        }

        // 1. 查找手机号对应的候选人
        console.log('[Bind API] Looking up person by phone:', phone)
        const person = await prisma.hrPerson.findFirst({
            where: {
                phone: phone,
                deleted: false
            }
        })

        if (!person) {
            console.error('[Bind API] Person not found for phone:', phone)
            return NextResponse.json(
                {
                    error: '候选人不存在',
                    message: '该手机号尚未被HR录入,请联系HR。'
                },
                { status: 404 }
            )
        }

        console.log('[Bind API] Person found:', {
            id: person.id.toString(),
            currentOpenId: person.wechat_openid ? `${person.wechat_openid.substring(0, 10)}...` : null
        })

        // 2. 检查该候选人是否已经绑定了其他微信
        if (person.wechat_openid && person.wechat_openid !== openid) {
            console.log(`[Bind API] Updating WeChat binding for person ${person.id}: ${person.wechat_openid} -> ${openid}`)
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
            console.error('[Bind API] OpenID already bound to another person:', existingBind.id.toString())
            return NextResponse.json(
                {
                    error: '微信已绑定',
                    message: '该微信号已绑定其他候选人，请联系HR解绑。'
                },
                { status: 409 }
            )
        }

        // 4. 执行绑定
        console.log('[Bind API] Updating person with OpenID:', {
            personId: person.id.toString(),
            openid: `${openid.substring(0, 10)}...`
        })

        const updatedPerson = await prisma.hrPerson.update({
            where: { id: person.id },
            data: {
                wechat_openid: openid,
                updateTime: new Date()
            }
        })

        console.log('[Bind API] Bind successful:', {
            personId: updatedPerson.id.toString(),
            wechatOpenId: updatedPerson.wechat_openid ? `${updatedPerson.wechat_openid.substring(0, 10)}...` : null
        })

        // 5. 返回成功及跳转Token
        return NextResponse.json({
            success: true,
            token: person.recordAccessToken,
            personId: person.id.toString(),
            recordStatus: person.recordStatus
        })

    } catch (error) {
        console.error('[Bind API] Error:', error)
        if (error instanceof Error) {
            console.error('[Bind API] Error stack:', error.stack)
        }
        return NextResponse.json(
            {
                error: '绑定失败',
                message: '系统错误，请稍后重试'
            },
            { status: 500 }
        )
    }
}
