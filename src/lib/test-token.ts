import CryptoJS from 'crypto-js'

/**
 * 生成测试用的token（与管理端格式保持一致）
 * @param personId 候选人ID
 * @param mobile 手机号
 * @param hoursValid 有效期（小时）
 * @returns 加密的token
 */
export function generateTestToken(personId: number, mobile: string, hoursValid: number = 24): string {
  const key = process.env.ACCESS_TOKEN_AES_KEY || 'yudao-hr-aes-key'

  // 创建token数据（与管理端格式保持一致）
  const tokenData = {
    id: personId,
    mobile: mobile,
    expires: Math.floor(Date.now() / 1000) + (hoursValid * 3600) // 当前时间 + 有效期
  }

  // 转换为JSON字符串
  const jsonString = JSON.stringify(tokenData)

  // AES加密
  const encrypted = CryptoJS.AES.encrypt(jsonString, key).toString()

  // 转换为URL安全的Base64编码
  const urlSafeToken = encrypted
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')

  return urlSafeToken
}

/**
 * 测试token解密
 */
export function testTokenDecryption() {
  const testPersonId = 1
  const testMobile = '13800138000'
  const token = generateTestToken(testPersonId, testMobile)

  console.log('生成的测试token:', token)
  console.log('测试候选人ID:', testPersonId)
  console.log('测试手机号:', testMobile)

  // 测试解密
  try {
    const key = process.env.ACCESS_TOKEN_AES_KEY || 'yudao-hr-aes-key'
    const bytes = CryptoJS.AES.decrypt(token, key)
    const decrypted = bytes.toString(CryptoJS.enc.Utf8)
    const parsed = JSON.parse(decrypted)

    console.log('解密成功:', parsed)
    return { token, personId: testPersonId, mobile: testMobile, success: true }
  } catch (error) {
    console.error('解密失败:', error)
    return { token, personId: testPersonId, mobile: testMobile, success: false, error }
  }
}
