import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getDefaultTenantId } from '@/lib/config'
import { processBasicInfo, calculateWorkInfoFromExperiences } from '@/lib/person-utils'

// 学历优先级映射（数字越小优先级越高）
const EDUCATION_LEVEL_PRIORITY: Record<string, number> = {
  'doctor': 1,           // 博士研究生
  'master': 2,           // 硕士研究生
  'bachelor': 3,         // 本科
  'associate': 4,        // 大专
  'technical_secondary': 5 // 中专
}

// 学位优先级映射（数字越小优先级越高）
const DEGREE_PRIORITY: Record<string, number> = {
  'phd': 1,      // 博士
  'master': 2,   // 硕士
  'bachelor': 3, // 学士
  'none': 4      // 无学位
}

// 推算最高学历、最高学位和对应的学校名称
async function updateHighestEducation(tx: any, personId: bigint) {
  // 获取该人员的所有教育经历
  const educations = await tx.hrPersonEducation.findMany({
    where: {
      personId: personId,
      deleted: false
    },
    select: {
      schoolName: true,
      educationLevel: true,
      degree: true,
      startDate: true,
      endDate: true
    }
  })

  if (educations.length === 0) {
    // 如果没有教育经历，清空相关字段
    await tx.hrPerson.update({
      where: { id: personId },
      data: {
        educationLevel: null,
        degree: null,
        school: null,
        updateTime: new Date()
      }
    })
    return
  }

  // 找到最高学历
  let highestEducation = educations[0]
  let highestEducationPriority = EDUCATION_LEVEL_PRIORITY[highestEducation.educationLevel] || 999

  for (const edu of educations) {
    const priority = EDUCATION_LEVEL_PRIORITY[edu.educationLevel] || 999
    if (priority < highestEducationPriority) {
      highestEducation = edu
      highestEducationPriority = priority
    }
  }

  // 找到最高学位
  let highestDegree = educations[0]
  let highestDegreePriority = DEGREE_PRIORITY[highestDegree.degree] || 999

  for (const edu of educations) {
    const priority = DEGREE_PRIORITY[edu.degree] || 999
    if (priority < highestDegreePriority) {
      highestDegree = edu
      highestDegreePriority = priority
    }
  }

  // 更新person表中的最高学历、最高学位和对应的学校名称
  // 学校名称取最高学历对应的学校
  await tx.hrPerson.update({
    where: { id: personId },
    data: {
      educationLevel: highestEducation.educationLevel,
      degree: highestDegree.degree,
      school: highestEducation.schoolName,
      updateTime: new Date()
    }
  })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ personId: string }> }
) {
  try {
    const { personId: personIdStr } = await params
    const personId = parseInt(personIdStr)
    
    if (isNaN(personId)) {
      return NextResponse.json(
        { success: false, message: '无效的人员ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      basicInfo,
      jobExpectations,
      educations,
      workExperiences,
      projectExperiences,
      skills,
      certificates,
      trainings,
      languages
    }: {
      basicInfo?: Record<string, unknown>
      jobExpectations?: Array<Record<string, unknown>>
      educations?: Array<Record<string, unknown>>
      workExperiences?: Array<Record<string, unknown>>
      projectExperiences?: Array<Record<string, unknown>>
      skills?: Array<Record<string, unknown>>
      certificates?: Array<Record<string, unknown>>
      trainings?: Array<Record<string, unknown>>
      languages?: Array<Record<string, unknown>>
    } = body

    // 在事务外部进行工作经历校验
    if (workExperiences && Array.isArray(workExperiences)) {
      // 校验：只允许一个离职时间为null或空字符串的记录（至今的工作经历）
      const currentWorkCount = workExperiences.filter(work =>
        work.endDate === null || work.endDate === '' || work.endDate === undefined
      ).length

      if (currentWorkCount > 1) {
        return NextResponse.json(
          {
            success: false,
            message: '只能有一个当前在职的工作经历，请检查结束时间设置'
          },
          { status: 400 }
        )
      }
    }

    // 开始事务，设置超时时间为30秒
    const result = await prisma.$transaction(async (tx) => {
      // 1. 更新基本信息
      if (basicInfo) {
        // 使用工具函数处理基本信息，自动计算相关字段
        const processedBasicInfo = processBasicInfo(basicInfo)

        const updateData: Record<string, unknown> = {}

        // 处理基本字段
        if (processedBasicInfo.name) updateData.name = processedBasicInfo.name
        if (processedBasicInfo.gender) updateData.gender = processedBasicInfo.gender
        if (processedBasicInfo.phone) updateData.phone = processedBasicInfo.phone
        if (processedBasicInfo.wechat) updateData.wechat = processedBasicInfo.wechat
        if (processedBasicInfo.email) updateData.email = processedBasicInfo.email
        if (processedBasicInfo.idCard) updateData.idCard = processedBasicInfo.idCard
        if (processedBasicInfo.nationality) updateData.nationality = processedBasicInfo.nationality
        if (processedBasicInfo.ethnicity) updateData.ethnicity = processedBasicInfo.ethnicity
        if (processedBasicInfo.politicalStatus) updateData.politicalStatus = processedBasicInfo.politicalStatus
        if (processedBasicInfo.maritalStatus) updateData.maritalStatus = processedBasicInfo.maritalStatus
        if (processedBasicInfo.city) updateData.city = processedBasicInfo.city
        if (processedBasicInfo.nativePlace) updateData.nativePlace = processedBasicInfo.nativePlace
        if (processedBasicInfo.jobType) updateData.jobType = processedBasicInfo.jobType
        if (processedBasicInfo.availableDate) updateData.availableDate = processedBasicInfo.availableDate
        if (processedBasicInfo.address) updateData.address = processedBasicInfo.address
        if (processedBasicInfo.registeredAddress) updateData.registeredAddress = processedBasicInfo.registeredAddress
        if (processedBasicInfo.highlights) updateData.highlights = processedBasicInfo.highlights
        if (processedBasicInfo.avatarUrl) updateData.avatarUrl = processedBasicInfo.avatarUrl

        // 身份证照片字段
        if (processedBasicInfo.idCardFrontUrl) updateData.idCardFrontUrl = processedBasicInfo.idCardFrontUrl
        if (processedBasicInfo.idCardBackUrl) updateData.idCardBackUrl = processedBasicInfo.idCardBackUrl

        // 社保截图字段
        if (processedBasicInfo.socialInsuranceImageUrl) updateData.socialInsuranceImageUrl = processedBasicInfo.socialInsuranceImageUrl

        // 自动计算的字段
        if (processedBasicInfo.birthDate) updateData.birthDate = new Date(processedBasicInfo.birthDate)
        if (processedBasicInfo.age !== undefined && processedBasicInfo.age !== null) updateData.age = processedBasicInfo.age

        // 工作相关字段
        if (processedBasicInfo.employmentStatus) updateData.employmentStatus = processedBasicInfo.employmentStatus
        // 注意：workYear 和 workStartDate 现在通过工作经历自动计算，不在基本信息中更新

        // 添加更新时间
        updateData.updateTime = new Date()



        await tx.hrPerson.update({
          where: { id: BigInt(personId) },
          data: updateData
        })
      }

      // 2. 更新求职期望（如果有数据）
      if (jobExpectations && Array.isArray(jobExpectations)) {
        // 先删除现有的求职期望
        await tx.hrPersonJobPref.updateMany({
          where: { personId: BigInt(personId) },
          data: { deleted: true, updateTime: new Date() }
        })

        // 插入新的求职期望
        for (const job of jobExpectations) {
          if (job.expectedPosition || job.expectedIndustry || job.expectedCity) {
            await tx.hrPersonJobPref.create({
              data: {
                personId: BigInt(personId),
                expectedPosition: job.expectedPosition || null,
                expectedIndustry: job.expectedIndustry || null,
                expectedCity: job.expectedCity || null,
                expectedSalary: job.expectedSalary || null,
                tenantId: BigInt(getDefaultTenantId()),
                createTime: new Date(),
                updateTime: new Date(),
                deleted: false
              }
            })
          }
        }
      }

      // 3. 更新教育经历（如果有数据）
      if (educations && Array.isArray(educations)) {
        // 先软删除现有的教育经历
        await tx.hrPersonEducation.updateMany({
          where: { personId: BigInt(personId) },
          data: { deleted: true, updateTime: new Date() }
        })

        // 插入新的教育经历
        for (const edu of educations) {
          // 需要学校名称和开始时间才能保存
          if (edu.schoolName && edu.startDate) {
            // 注意：不要传递id字段，数据库id是自增的
            // 也不要传递personId字段，通过关系连接
            const educationData: Record<string, unknown> = {
              schoolName: edu.schoolName,  // 对应数据库 school_name
              // 数据库必填字段，草稿状态下提供默认值
              major: edu.major || '',
              educationLevel: edu.educationLevel || '',
              degree: edu.degree || '',
              startDate: new Date(edu.startDate), // startDate是必填的
              endDate: edu.endDate ? new Date(edu.endDate) : null, // endDate可以为null表示至今
              isFullTime: edu.isFullTime !== undefined ? edu.isFullTime : true,
              tenantId: BigInt(getDefaultTenantId()),
              createTime: new Date(),
              updateTime: new Date(),
              deleted: false
            }

            // 处理可选的文本字段
            if (edu.schoolExperience) {
              educationData.schoolExperience = edu.schoolExperience
            }

            // 处理证书相关字段
            if (edu.educationCertFile) educationData.educationCertFile = edu.educationCertFile
            if (edu.educationCertNo) educationData.educationCertNo = edu.educationCertNo
            if (edu.educationVerifyCode) educationData.educationVerifyCode = edu.educationVerifyCode
            if (edu.educationVerifyFile) educationData.educationVerifyFile = edu.educationVerifyFile
            if (edu.degreeCertFile) educationData.degreeCertFile = edu.degreeCertFile
            if (edu.degreeCertNo) educationData.degreeCertNo = edu.degreeCertNo
            if (edu.degreeVerifyCode) educationData.degreeVerifyCode = edu.degreeVerifyCode
            if (edu.degreeVerifyFile) educationData.degreeVerifyFile = edu.degreeVerifyFile

            await tx.hrPersonEducation.create({
              data: {
                ...educationData,
                person: {
                  connect: { id: BigInt(personId) }
                }
              }
            })
          }
        }

        // 推算最高学历、最高学位和对应的学校名称
        await updateHighestEducation(tx, BigInt(personId))
      }

      // 4. 更新工作经历（如果有数据）
      if (workExperiences && Array.isArray(workExperiences)) {

        // 先软删除现有的工作经历
        await tx.hrPersonWork.updateMany({
          where: { personId: BigInt(personId) },
          data: { deleted: true, updateTime: new Date() }
        })

        // 插入新的工作经历
        const validWorkExperiences = []
        let currentWork = null // 用于存储当前在职的工作经历

        for (const work of workExperiences) {
          // 只要有开始时间就保存，结束时间可以为空（在职状态）
          if (work.startDate) {
            const workData: Record<string, unknown> = {
              startDate: new Date(work.startDate),
              tenantId: BigInt(getDefaultTenantId()),
              createTime: new Date(),
              updateTime: new Date(),
              deleted: false
            }

            // 处理结束时间：如果有值就设置，否则设置为null（在职状态）
            if (work.endDate) {
              workData.endDate = new Date(work.endDate)
            } else {
              workData.endDate = null
            }

            // 处理可选字段
            if (work.companyName) workData.companyName = work.companyName
            if (work.industry) workData.industry = work.industry
            if (work.position) workData.position = work.position
            if (work.location) workData.location = work.location
            if (work.department) workData.department = work.department
            if (work.responsibilityPerformance) workData.responsibilityPerformance = work.responsibilityPerformance

            await tx.hrPersonWork.create({
              data: {
                ...workData,
                person: {
                  connect: { id: BigInt(personId) }
                }
              }
            })

            // 收集有效的工作经历用于计算
            validWorkExperiences.push({
              startDate: work.startDate,
              endDate: work.endDate
            })

            // 如果是当前在职的工作经历（endDate为null或空字符串），记录下来
            if (work.endDate === null || work.endDate === '' || work.endDate === undefined) {
              currentWork = {
                companyName: work.companyName,
                position: work.position
              }
            }
          }
        }

        // 根据工作经历自动计算参加工作时间和工作年限
        if (validWorkExperiences.length > 0) {
          const { workStartDate, workYear } = calculateWorkInfoFromExperiences(validWorkExperiences)

          const workInfoUpdate: Record<string, unknown> = {
            updateTime: new Date()
          }

          if (workStartDate) {
            workInfoUpdate.workStartDate = new Date(workStartDate)
          }
          if (workYear) {
            workInfoUpdate.workYear = workYear
          }

          // 更新person表的工作信息
          if (Object.keys(workInfoUpdate).length > 1) { // 除了updateTime还有其他字段
            await tx.hrPerson.update({
              where: { id: BigInt(personId) },
              data: workInfoUpdate
            })
          }
        }

        // 推断当前公司和职位：如果基本信息中在职状态为"在职"，且有当前工作经历
        if (currentWork && basicInfo && basicInfo.employmentStatus === 'employed') {
          const currentCompanyUpdate: Record<string, unknown> = {
            updateTime: new Date()
          }

          if (currentWork.companyName) {
            currentCompanyUpdate.companyName = currentWork.companyName
          }
          if (currentWork.position) {
            currentCompanyUpdate.position = currentWork.position
          }

          // 更新当前公司和职位信息
          if (Object.keys(currentCompanyUpdate).length > 1) { // 除了updateTime还有其他字段
            await tx.hrPerson.update({
              where: { id: BigInt(personId) },
              data: currentCompanyUpdate
            })
          }
        }
      }

      // 5. 更新项目经历（如果有数据）
      if (projectExperiences && Array.isArray(projectExperiences)) {
        // 先软删除现有的项目经历
        await tx.hrPersonProject.updateMany({
          where: { personId: BigInt(personId) },
          data: { deleted: true, updateTime: new Date() }
        })

        // 插入新的项目经历
        for (const project of projectExperiences) {
          // 只要有项目名称和开始时间就保存，结束时间可以为空（进行中的项目）
          if (project.projectName && project.startDate) {
            await tx.hrPersonProject.create({
              data: {
                projectName: project.projectName,
                companyName: project.companyName || null,
                startDate: new Date(project.startDate),
                endDate: project.endDate ? new Date(project.endDate) : null,
                technologies: project.technologies || null,
                projectDesc: project.projectDesc || null,
                projectRole: project.projectRole || null,
                projectResponsibility: project.projectResponsibility || null,
                projectAchievement: project.projectAchievement || null,
                tenantId: BigInt(getDefaultTenantId()),
                createTime: new Date(),
                updateTime: new Date(),
                deleted: false,
                person: {
                  connect: { id: BigInt(personId) }
                }
              }
            })
          }
        }
      }

      // 6. 更新技能特长（如果有数据）
      if (skills && Array.isArray(skills)) {
        // 先物理删除现有的技能记录（避免唯一约束冲突）
        await tx.hrPersonSkill.deleteMany({
          where: { personId: BigInt(personId) }
        })

        // 插入新的技能
        for (const skill of skills) {
          if (skill.skillName) {
            const skillData: Record<string, unknown> = {
              personId: BigInt(personId),
              skillName: skill.skillName,
              proficiencyLevel: skill.proficiencyLevel || null,
              sourceType: skill.sourceType || 'manual',
              tenantId: BigInt(getDefaultTenantId()),
              createTime: new Date(),
              updateTime: new Date(),
              deleted: false
            }

            // 处理技能ID（技能库技能有ID，自定义技能为null）
            if (skill.skillId !== undefined && skill.skillId !== null) {
              skillData.skillId = BigInt(skill.skillId)
            } else {
              skillData.skillId = null
            }

            // 处理使用年限
            if (skill.yearsOfExperience !== undefined && skill.yearsOfExperience !== null) {
              skillData.yearsOfExperience = Number(skill.yearsOfExperience)
            } else {
              skillData.yearsOfExperience = null
            }

            await tx.hrPersonSkill.create({
              data: skillData
            })
          }
        }
      }

      // 7. 更新资格证书（如果有数据）
      if (certificates && Array.isArray(certificates)) {
        // 先软删除现有的证书
        await tx.hrPersonCertificate.updateMany({
          where: { personId: BigInt(personId) },
          data: { deleted: true, updateTime: new Date() }
        })

        // 插入新的证书
        for (const cert of certificates) {
          if (cert.certificateName) {
            await tx.hrPersonCertificate.create({
              data: {
                personId: BigInt(personId),
                certificateName: cert.certificateName,
                certificateCode: cert.certificateCode || null,
                issuer: cert.issuer || null,
                issueDate: cert.issueDate ? new Date(cert.issueDate) : null,
                expiryDate: cert.expiryDate ? new Date(cert.expiryDate) : null,
                createTime: new Date(),
                updateTime: new Date(),
                deleted: false
              }
            })
          }
        }
      }

      // 8. 更新培训经历（如果有数据）
      if (trainings && Array.isArray(trainings)) {
        // 先软删除现有的培训记录
        await tx.hrPersonTraining.updateMany({
          where: { personId: BigInt(personId) },
          data: { deleted: true, updateTime: new Date() }
        })

        // 插入新的培训记录
        for (const training of trainings) {
          if (training.trainingName && training.startDate && training.endDate) {
            await tx.hrPersonTraining.create({
              data: {
                personId: BigInt(personId),
                trainingName: training.trainingName,
                startDate: new Date(training.startDate),
                endDate: new Date(training.endDate),
                trainingOrg: training.trainingInstitution || null,
                trainingDesc: training.trainingDescription || null,
                certificateName: training.certificateObtained || null,
                createTime: new Date(),
                updateTime: new Date(),
                deleted: false
              }
            })
          }
        }
      }

      // 9. 更新语言能力（如果有数据）
      if (languages && Array.isArray(languages)) {
        // 先软删除现有的语言记录
        await tx.hrPersonLanguage.updateMany({
          where: { personId: BigInt(personId) },
          data: { deleted: true, updateTime: new Date() }
        })

        // 插入新的语言记录
        for (const lang of languages) {
          if (lang.languageName) {
            await tx.hrPersonLanguage.create({
              data: {
                personId: BigInt(personId),
                languageName: lang.languageName,
                proficiencyLevel: lang.proficiencyLevel || null,
                createTime: new Date(),
                updateTime: new Date(),
                deleted: false
              }
            })
          }
        }
      }

      return { success: true }
    }, {
      timeout: 30000, // 30秒超时
      maxWait: 5000   // 最多等待5秒获取事务锁
    })

    return NextResponse.json({
      success: true,
      message: '草稿保存成功',
      data: result
    })

  } catch (error) {
    console.error('保存草稿失败:', error)
    const errorMessage = error instanceof Error ? error.message : '未知错误'
    return NextResponse.json(
      {
        success: false,
        message: '保存草稿失败',
        error: errorMessage,
        details: error instanceof Error ? error.stack : String(error)
      },
      { status: 500 }
    )
  }
}
