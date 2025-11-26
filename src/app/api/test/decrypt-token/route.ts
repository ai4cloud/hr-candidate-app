import { NextRequest, NextResponse } from 'next/server'
import CryptoJS from 'crypto-js'

export async function GET(request: NextRequest) {
  // 只在开发环境下允许访问
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: '仅在开发环境可用' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: '缺少token参数' }, { status: 400 })
  }

  const key = process.env.ACCESS_TOKEN_AES_KEY || '_deep-hr-aes-key'
  const results: Array<{
    method: string;
    result?: string;
    error?: string;
    success: boolean;
    length?: number;
    isJson?: boolean
  }> = []

  // 尝试不同的解密方式
  const methods = [
    {
      name: '标准AES解密',
      decrypt: () => {
        const bytes = CryptoJS.AES.decrypt(token, key)
        return bytes.toString(CryptoJS.enc.Utf8)
      }
    },
    {
      name: 'Base64解码后AES解密',
      decrypt: () => {
        const decoded = atob(token)
        const bytes = CryptoJS.AES.decrypt(decoded, key)
        return bytes.toString(CryptoJS.enc.Utf8)
      }
    },
    {
      name: '直接Base64解码',
      decrypt: () => {
        return atob(token)
      }
    },
    {
      name: 'Hex解码后AES解密',
      decrypt: () => {
        const hexParsed = CryptoJS.enc.Hex.parse(token)
        const bytes = CryptoJS.AES.decrypt(hexParsed.toString(), key)
        return bytes.toString(CryptoJS.enc.Utf8)
      }
    }
  ]

  for (const method of methods) {
    try {
      const result = method.decrypt()
      results.push({
        method: method.name,
        success: true,
        result: result,
        length: result.length,
        isJson: (() => {
          try {
            JSON.parse(result)
            return true
          } catch {
            return false
          }
        })()
      })
    } catch (error) {
      results.push({
        method: method.name,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }

  return NextResponse.json({
    token,
    tokenLength: token.length,
    key: key.substring(0, 10) + '...',
    results
  })
}
