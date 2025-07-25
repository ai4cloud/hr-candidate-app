import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ personId: string }> }
) {
  try {
    const { personId: personIdStr } = await params
    const personId = parseInt(personIdStr)
    
    if (isNaN(personId)) {
      return NextResponse.json(
        { error: '无效的候选人ID' },
        { status: 400 }
      )
    }

    // 查询候选人基本信息
    const person = await prisma.hrPerson.findFirst({
      where: {
        id: BigInt(personId),
        deleted: false
      }
    })

    if (!person) {
      return NextResponse.json(
        { error: '候选人不存在' },
        { status: 404 }
      )
    }

    // 查询求职期望
    const jobExpectations = await prisma.hrPersonJobPref.findMany({
      where: {
        personId: BigInt(personId),
        deleted: false
      },
      orderBy: {
        id: 'asc'
      }
    })

    // 查询教育经历
    const educations = await prisma.hrPersonEducation.findMany({
      where: {
        personId: BigInt(personId),
        deleted: false
      },
      orderBy: {
        startDate: 'desc'
      }
    })

    // 查询工作经历
    const workExperiences = await prisma.hrPersonWork.findMany({
      where: {
        personId: BigInt(personId),
        deleted: false
      },
      orderBy: {
        startDate: 'desc'
      }
    })

    // 查询项目经历
    const projectExperiences = await prisma.hrPersonProject.findMany({
      where: {
        personId: BigInt(personId),
        deleted: false
      },
      orderBy: {
        startDate: 'desc'
      }
    })

    // 查询技能特长
    const skills = await prisma.hrPersonSkill.findMany({
      where: {
        personId: BigInt(personId),
        deleted: false
      },
      orderBy: {
        id: 'asc'
      }
    })

    // 查询资格证书
    const certificates = await prisma.hrPersonCertificate.findMany({
      where: {
        personId: BigInt(personId),
        deleted: false
      },
      orderBy: {
        issueDate: 'desc'
      }
    })

    // 查询培训经历
    const trainings = await prisma.hrPersonTraining.findMany({
      where: {
        personId: BigInt(personId),
        deleted: false
      },
      orderBy: {
        startDate: 'desc'
      }
    })

    // 查询语言能力
    const languages = await prisma.hrPersonLanguage.findMany({
      where: {
        personId: BigInt(personId),
        deleted: false
      },
      orderBy: {
        id: 'asc'
      }
    })

    // 查询社保记录
    const socialSecurities = await prisma.hrPersonSocialInsurance.findMany({
      where: {
        personId: BigInt(personId),
        deleted: false
      },
      orderBy: {
        startDate: 'desc'
      }
    })

    // 转换BigInt为字符串以便JSON序列化
    const formatData = (data: any) => {
      if (Array.isArray(data)) {
        return data.map(item => formatSingleItem(item))
      }
      return formatSingleItem(data)
    }

    const formatSingleItem = (item: any) => {
      if (!item) return item

      const formatted: any = {}

      for (const [key, value] of Object.entries(item)) {
        if (typeof value === 'bigint') {
          formatted[key] = value.toString()
        } else if (value instanceof Date) {
          // 处理日期字段
          if (key === 'birthDate' || key === 'startDate' || key === 'endDate' ||
              key === 'issueDate' || key === 'expiryDate') {
            formatted[key] = value.toISOString().split('T')[0]
          } else {
            formatted[key] = value.toISOString()
          }
        } else {
          formatted[key] = value
        }
      }

      return formatted
    }

    return NextResponse.json({
      success: true,
      data: {
        person: formatData(person),
        jobExpectations: formatData(jobExpectations),
        educations: formatData(educations),
        workExperiences: formatData(workExperiences),
        projectExperiences: formatData(projectExperiences),
        skills: formatData(skills),
        certificates: formatData(certificates),
        trainings: formatData(trainings),
        languages: formatData(languages),
        socialSecurities: formatData(socialSecurities)
      }
    })

  } catch (error) {
    console.error('获取候选人信息失败:', error)
    return NextResponse.json(
      { error: '获取候选人信息失败' },
      { status: 500 }
    )
  }
}
