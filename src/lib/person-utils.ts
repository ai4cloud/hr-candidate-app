/**
 * 人员信息处理工具函数
 * 包含身份证号解析、年龄计算、工作年限计算等功能
 */

/**
 * 从身份证号解析出生日期
 * @param idCard 身份证号
 * @returns 出生日期字符串 (YYYY-MM-DD) 或 null
 */
export function parseBirthDateFromIdCard(idCard: string): string | null {
  if (!idCard || typeof idCard !== 'string') {
    return null
  }

  // 去除空格和特殊字符
  const cleanIdCard = idCard.trim().replace(/[^0-9X]/gi, '')

  // 验证身份证号格式
  if (!/^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dX]$/i.test(cleanIdCard)) {
    return null
  }

  try {
    // 提取出生日期部分 (第7-14位)
    const year = cleanIdCard.substring(6, 10)
    const month = cleanIdCard.substring(10, 12)
    const day = cleanIdCard.substring(12, 14)

    // 验证日期有效性
    const birthDate = new Date(`${year}-${month}-${day}`)
    const currentYear = new Date().getFullYear()

    // 检查年份范围 (1900-当前年份)
    const birthYear = parseInt(year)
    if (birthYear < 1900 || birthYear > currentYear) {
      return null
    }

    // 检查日期是否有效
    if (birthDate.getFullYear() !== birthYear ||
      birthDate.getMonth() !== parseInt(month) - 1 ||
      birthDate.getDate() !== parseInt(day)) {
      return null
    }

    return `${year}-${month}-${day}`
  } catch (error) {
    console.error('解析身份证号出生日期失败:', error)
    return null
  }
}

/**
 * 根据出生日期计算年龄
 * @param birthDate 出生日期 (YYYY-MM-DD 格式字符串或 Date 对象)
 * @returns 年龄 (整数) 或 null
 */
export function calculateAge(birthDate: string | Date): number | null {
  if (!birthDate) {
    return null
  }

  try {
    const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate
    const today = new Date()

    // 检查日期有效性
    if (isNaN(birth.getTime())) {
      return null
    }

    // 检查出生日期不能晚于今天
    if (birth > today) {
      return null
    }

    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()

    // 如果还没到生日，年龄减1
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }

    // 年龄范围检查 (0-150岁)
    if (age < 0 || age > 150) {
      return null
    }

    return age
  } catch (error) {
    console.error('计算年龄失败:', error)
    return null
  }
}

/**
 * 根据参加工作日期计算工作年限
 * @param workStartDate 参加工作日期 (YYYY-MM-DD 格式字符串或 Date 对象)
 * @returns 工作年限描述字符串 或 null
 */
export function calculateWorkYear(workStartDate: string | Date): string | null {
  if (!workStartDate) {
    return null
  }

  try {
    const startDate = typeof workStartDate === 'string' ? new Date(workStartDate) : workStartDate
    const today = new Date()

    // 检查日期有效性
    if (isNaN(startDate.getTime())) {
      return null
    }

    // 检查工作开始日期不能晚于今天
    if (startDate > today) {
      return null
    }

    // 计算年份差
    let years = today.getFullYear() - startDate.getFullYear()
    const monthDiff = today.getMonth() - startDate.getMonth()

    // 如果还没到工作开始的月份和日期，年数减1
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < startDate.getDate())) {
      years--
    }

    // 计算月份差（用于更精确的描述）
    let totalMonths = (today.getFullYear() - startDate.getFullYear()) * 12 + monthDiff
    if (today.getDate() < startDate.getDate()) {
      totalMonths--
    }

    // 格式化工作年限描述
    if (totalMonths < 0) {
      return null
    } else if (totalMonths < 12) {
      return totalMonths === 0 ? '应届毕业生' : `${totalMonths}个月`
    } else if (years < 1) {
      return '1年以下'
    } else if (years >= 10) {
      return '10年以上'
    } else {
      return `${years}年`
    }
  } catch (error) {
    console.error('计算工作年限失败:', error)
    return null
  }
}

/**
 * 处理基本信息数据，自动计算相关字段
 * @param basicInfo 基本信息对象
 * @returns 处理后的基本信息对象
 */
export function processBasicInfo(basicInfo: Record<string, any>): Record<string, any> {
  const processed = { ...basicInfo }

  // 1. 从身份证号解析出生日期
  if (basicInfo.idCard && !basicInfo.birthDate) {
    const birthDate = parseBirthDateFromIdCard(basicInfo.idCard)
    if (birthDate) {
      processed.birthDate = birthDate
    }
  }

  // 2. 根据出生日期计算年龄
  const birthDateToUse = processed.birthDate || basicInfo.birthDate
  if (birthDateToUse) {
    const age = calculateAge(birthDateToUse)
    if (age !== null) {
      processed.age = age
    }
  }

  // 注意：工作年限和参加工作时间现在通过工作经历自动计算，不在基本信息中处理

  return processed
}

/**
 * 验证身份证号格式
 * @param idCard 身份证号
 * @returns 是否有效
 */
export function validateIdCard(idCard: string): boolean {
  if (!idCard || typeof idCard !== 'string') {
    return false
  }

  const cleanIdCard = idCard.trim().replace(/[^0-9X]/gi, '')

  // 基本格式验证
  if (!/^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dX]$/i.test(cleanIdCard)) {
    return false
  }

  // 验证出生日期是否有效
  const birthDate = parseBirthDateFromIdCard(cleanIdCard)
  return birthDate !== null
}

/**
 * 根据工作经历计算参加工作时间和工作年限
 * @param workExperiences 工作经历数组
 * @returns 包含参加工作时间和工作年限的对象
 */
export function calculateWorkInfoFromExperiences(workExperiences: Array<{
  startDate: string | Date | null
  endDate: string | Date | null
}>): { workStartDate: string | null; workYear: string | null } {
  if (!workExperiences || workExperiences.length === 0) {
    return { workStartDate: null, workYear: null }
  }

  try {
    // 过滤有效的工作经历（至少有开始时间）
    const validExperiences = workExperiences.filter(exp => exp.startDate)

    if (validExperiences.length === 0) {
      return { workStartDate: null, workYear: null }
    }

    // 找到最早的工作开始时间作为参加工作时间
    const startDates = validExperiences.map(exp => {
      const date = typeof exp.startDate === 'string' ? new Date(exp.startDate) : exp.startDate
      return date
    }).filter((date): date is Date => date !== null && !isNaN(date.getTime()))

    if (startDates.length === 0) {
      return { workStartDate: null, workYear: null }
    }

    // 找到最早的开始时间
    const earliestStartDate = new Date(Math.min(...startDates.map(d => d.getTime())))
    const workStartDate = formatDate(earliestStartDate)

    // 计算总工作年限
    let totalMonths = 0
    const today = new Date()

    for (const exp of validExperiences) {
      const startDate = typeof exp.startDate === 'string' ? new Date(exp.startDate) : exp.startDate

      if (!startDate || isNaN(startDate.getTime())) {
        continue
      }

      // 如果结束日期为null，表示在职状态，使用当前日期
      let endDate: Date
      if (exp.endDate === null || exp.endDate === undefined) {
        endDate = today
      } else {
        endDate = typeof exp.endDate === 'string' ? new Date(exp.endDate) : exp.endDate
        if (isNaN(endDate.getTime())) {
          continue
        }
      }

      // 计算这段工作经历的月数
      const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 +
        (endDate.getMonth() - startDate.getMonth())

      // 如果结束日期的日期小于开始日期的日期，减去一个月
      if (endDate.getDate() < startDate.getDate()) {
        totalMonths += Math.max(0, months - 1)
      } else {
        totalMonths += Math.max(0, months)
      }
    }

    // 格式化工作年限
    const workYear = formatWorkYearFromMonths(totalMonths)

    return {
      workStartDate,
      workYear
    }
  } catch (error) {
    console.error('计算工作信息失败:', error)
    return { workStartDate: null, workYear: null }
  }
}

/**
 * 根据总月数格式化工作年限描述
 * @param totalMonths 总月数
 * @returns 工作年限描述字符串
 */
function formatWorkYearFromMonths(totalMonths: number): string {
  if (totalMonths <= 0) {
    return '应届毕业生'
  } else if (totalMonths < 12) {
    return `${totalMonths}个月`
  } else {
    const years = Math.floor(totalMonths / 12)
    if (years >= 10) {
      return '10年以上'
    } else {
      return `${years}年`
    }
  }
}

/**
 * 格式化日期为 YYYY-MM-DD 格式
 * @param date 日期对象或字符串
 * @returns 格式化后的日期字符串 或 null
 */
export function formatDate(date: string | Date): string | null {
  if (!date) {
    return null
  }

  try {
    const d = typeof date === 'string' ? new Date(date) : date
    if (isNaN(d.getTime())) {
      return null
    }

    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
  } catch (error) {
    console.error('格式化日期失败:', error)
    return null
  }
}
