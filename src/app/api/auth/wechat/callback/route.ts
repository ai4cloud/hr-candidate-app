import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')

    console.log('[WeChat Callback] Received request:', {
        code: code ? `${code.substring(0, 10)}...` : null,
        url: request.url
    })

    if (!code) {
        console.error('[WeChat Callback] Missing code parameter')
        return NextResponse.json(
            { error: 'Missing code parameter' },
            { status: 400 }
        )
    }

    const appId = process.env.WECHAT_APP_ID
    const appSecret = process.env.WECHAT_APP_SECRET

    if (!appId || !appSecret) {
        console.error('[WeChat Callback] WeChat configuration missing')
        return NextResponse.json(
            { error: 'WeChat configuration missing' },
            { status: 500 }
        )
    }

    try {
        // 1. 使用 code 换取 access_token 和 openid
        const tokenUrl = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appId}&secret=${appSecret}&code=${code}&grant_type=authorization_code`

        console.log('[WeChat Callback] Fetching access token from WeChat API')
        const tokenResponse = await fetch(tokenUrl)
        const tokenData = await tokenResponse.json()

        if (tokenData.errcode) {
            console.error('[WeChat Callback] WeChat Token Error:', tokenData)
            return NextResponse.json(
                { error: 'Failed to get access token', details: tokenData },
                { status: 400 }
            )
        }

        const openid = tokenData.openid
        console.log('[WeChat Callback] Got OpenID:', openid ? `${openid.substring(0, 10)}...` : null)
        // const accessToken = tokenData.access_token

        // 2. 根据 openid 查找候选人
        console.log('[WeChat Callback] Looking up person by OpenID')
        const person = await prisma.hrPerson.findFirst({
            where: {
                wechat_openid: openid,
                deleted: false
            }
        })

        // 3. 处理查找结果
        if (person) {
            console.log('[WeChat Callback] Person found, ID:', person.id.toString())
            // 3.1 已绑定：直接登录
            // 这里的逻辑需要与 /api/auth/validate 保持一致，或者生成一个临时token
            // 简单起见，我们重定向到 resume-wizard/[token]/form
            // 但我们需要一个 token。如果 person.recordAccessToken 存在且有效，可以使用它
            // 或者我们需要生成一个新的 token (但这需要引入 crypto 库)

            const token = person.recordAccessToken

            // 如果没有 token，这可能是一个异常情况，或者我们需要生成一个
            // 这里假设 recordAccessToken 总是存在的，因为它是录入时生成的
            if (!token) {
                console.error('[WeChat Callback] Person found but no access token')
                return NextResponse.json(
                    { error: 'System error: User found but no access token' },
                    { status: 500 }
                )
            }

            // 重定向到填写页面
            const redirectUrl = `/resume-wizard/${token}/form`
            console.log('[WeChat Callback] Redirecting to:', redirectUrl)
            return NextResponse.redirect(new URL(redirectUrl, request.url))

        } else {
            console.log('[WeChat Callback] Person not found, redirecting to bind page')
            // 3.2 未绑定：跳转到绑定页面
            // 携带 openid 参数
            const bindUrl = `/resume-wizard/bind?openid=${openid}`
            console.log('[WeChat Callback] Redirecting to:', bindUrl)
            return NextResponse.redirect(new URL(bindUrl, request.url))
        }

    } catch (error) {
        console.error('[WeChat Callback] Error:', error)
        if (error instanceof Error) {
            console.error('[WeChat Callback] Error stack:', error.stack)
        }
        return NextResponse.json(
            { error: 'Internal Server Error', message: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        )
    }
}
