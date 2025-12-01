import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const appId = process.env.WECHAT_APP_ID

    if (!appId) {
        return NextResponse.json(
            { error: 'WeChat App ID not configured' },
            { status: 500 }
        )
    }

    // 获取当前域名的回调地址
    const host = request.headers.get('host') || 'localhost:3000'
    const protocol = host.includes('localhost') ? 'http' : 'https'
    const redirectUri = encodeURIComponent(`${protocol}://${host}/api/auth/wechat/callback`)

    // 状态参数，用于防止CSRF攻击，也可以传递额外信息
    const state = 'wechat_login'

    // 构建微信授权URL
    // scope=snsapi_userinfo: 获取用户基本信息（需用户手动确认）
    // scope=snsapi_base: 静默授权，只获取openid
    // 根据需求，我们需要openid，且可能需要头像昵称，建议使用 snsapi_userinfo
    const scope = 'snsapi_userinfo'

    const wechatAuthUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}#wechat_redirect`

    return NextResponse.redirect(wechatAuthUrl)
}
