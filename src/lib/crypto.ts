import CryptoJS from 'crypto-js'

/**
 * AES解密函数 - 兼容Java端实现
 * @param encryptedData 加密的Base64字符串
 * @param key 解密密钥
 * @returns 解密后的字符串
 */
export function decryptAES(encryptedData: string, key: string): string {
  try {
    // 方法1: 标准crypto-js解密（适用于crypto-js生成的token）
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, key)
      const decrypted = bytes.toString(CryptoJS.enc.Utf8)
      if (decrypted) {
        return decrypted
      }
    } catch (e) {
      // 继续尝试其他方法
    }

    // 方法2: 兼容Java AES/ECB/PKCS5Padding模式
    try {
      // 将密钥转换为UTF-8字节数组，然后转为WordArray
      const keyBytes = CryptoJS.enc.Utf8.parse(key)

      // 解密，使用ECB模式和PKCS7填充（等同于Java的PKCS5Padding）
      const decrypted = CryptoJS.AES.decrypt(encryptedData, keyBytes, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
      })

      const result = decrypted.toString(CryptoJS.enc.Utf8)
      if (result) {
        return result
      }
    } catch (e) {
      // 继续尝试其他方法
    }

    // 方法3: 尝试CBC模式（默认模式）
    try {
      const keyBytes = CryptoJS.enc.Utf8.parse(key)
      const decrypted = CryptoJS.AES.decrypt(encryptedData, keyBytes, {
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      })

      const result = decrypted.toString(CryptoJS.enc.Utf8)
      if (result) {
        return result
      }
    } catch (e) {
      // 所有方法都失败
    }

    throw new Error('所有解密方法都失败')

  } catch (error) {
    console.error('AES解密失败:', error)
    throw new Error('Token解密失败')
  }
}

/**
 * 验证Token并解析内容（支持新旧格式）
 * @param token 加密的token
 * @returns 解析后的token内容
 */
export function validateToken(token: string): { id?: number; mobile: string; expires: number } {
  const key = process.env.ACCESS_TOKEN_AES_KEY
  if (!key) {
    throw new Error('AES密钥未配置')
  }

  console.log('开始验证token:', {
    tokenLength: token.length,
    key: key.substring(0, 10) + '...',
    tokenStart: token.substring(0, 20)
  })

  try {
    // 将URL安全的Base64转换回标准Base64
    let standardToken = token
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    // 补充缺失的填充字符
    while (standardToken.length % 4) {
      standardToken += '='
    }

    const decryptedData = decryptAES(standardToken, key)
    console.log('解密成功，数据长度:', decryptedData.length)
    const tokenData = JSON.parse(decryptedData)

    // 检查必要字段（mobile和expires是必须的）
    if (!tokenData.mobile || !tokenData.expires) {
      throw new Error('Token格式无效，缺少必要字段')
    }

    // 检查是否过期
    const now = Math.floor(Date.now() / 1000)
    if (now > tokenData.expires) {
      throw new Error('Token已过期')
    }

    // 支持新旧格式
    if (tokenData.id) {
      // 新格式：包含id字段
      console.log('检测到新格式token，包含候选人ID:', tokenData.id)
      return {
        id: tokenData.id,
        mobile: tokenData.mobile,
        expires: tokenData.expires
      }
    } else {
      // 旧格式：只有mobile和expires
      console.log('检测到旧格式token，仅包含手机号')
      return {
        mobile: tokenData.mobile,
        expires: tokenData.expires
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Token验证失败')
  }
}
