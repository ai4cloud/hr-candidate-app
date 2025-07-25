import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'

const prisma = new PrismaClient()

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
      languages, 
      socialInsurances 
    } = body

    // 开始事务
    const result = await prisma.$transaction(async (tx) => {
      // 1. 更新基本信息
      if (basicInfo) {
        const updateData: any = {}
        
        // 处理基本字段
        if (basicInfo.name) updateData.name = basicInfo.name
        if (basicInfo.gender) updateData.gender = basicInfo.gender
        if (basicInfo.age) updateData.age = parseInt(basicInfo.age)
        if (basicInfo.birthDate) updateData.birthDate = new Date(basicInfo.birthDate)
        if (basicInfo.mobile) updateData.mobile = basicInfo.mobile
        if (basicInfo.email) updateData.email = basicInfo.email
        if (basicInfo.idCard) updateData.idCard = basicInfo.idCard
        if (basicInfo.nationality) updateData.nationality = basicInfo.nationality
        if (basicInfo.ethnicity) updateData.ethnicity = basicInfo.ethnicity
        if (basicInfo.politicalStatus) updateData.politicalStatus = basicInfo.politicalStatus
        if (basicInfo.maritalStatus) updateData.maritalStatus = basicInfo.maritalStatus
        if (basicInfo.currentCity) updateData.currentCity = basicInfo.currentCity
        if (basicInfo.jobType) updateData.jobType = basicInfo.jobType
        if (basicInfo.availableTime) updateData.availableTime = basicInfo.availableTime
        if (basicInfo.currentAddress) updateData.currentAddress = basicInfo.currentAddress
        if (basicInfo.residenceAddress) updateData.residenceAddress = basicInfo.residenceAddress

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
          if (edu.schoolName && edu.startDate && edu.endDate) {
            await tx.hrPersonEducation.create({
              data: {
                personId: BigInt(personId),
                schoolName: edu.schoolName,
                major: edu.major || null,
                degree: edu.degree || null,
                startDate: new Date(edu.startDate),
                endDate: new Date(edu.endDate),
                description: edu.description || null,
                createTime: new Date(),
                updateTime: new Date(),
                deleted: false
              }
            })
          }
        }
      }

      // 4. 更新工作经历（如果有数据）
      if (workExperiences && Array.isArray(workExperiences)) {
        // 先软删除现有的工作经历
        await tx.hrPersonWork.updateMany({
          where: { personId: BigInt(personId) },
          data: { deleted: true, updateTime: new Date() }
        })

        // 插入新的工作经历
        for (const work of workExperiences) {
          if (work.companyName && work.startDate && work.endDate) {
            await tx.hrPersonWork.create({
              data: {
                personId: BigInt(personId),
                companyName: work.companyName,
                position: work.position || null,
                department: work.department || null,
                startDate: new Date(work.startDate),
                endDate: new Date(work.endDate),
                jobDescription: work.jobDescription || null,
                createTime: new Date(),
                updateTime: new Date(),
                deleted: false
              }
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
          if (project.projectName && project.startDate && project.endDate) {
            await tx.hrPersonProject.create({
              data: {
                personId: BigInt(personId),
                projectName: project.projectName,
                companyName: project.companyName || null,
                startDate: new Date(project.startDate),
                endDate: new Date(project.endDate),
                projectDescription: project.projectDescription || null,
                responsibility: project.responsibility || null,
                createTime: new Date(),
                updateTime: new Date(),
                deleted: false
              }
            })
          }
        }
      }

      // 6. 更新技能特长（如果有数据）
      if (skills && Array.isArray(skills)) {
        // 先软删除现有的技能
        await tx.hrPersonSkill.updateMany({
          where: { personId: BigInt(personId) },
          data: { deleted: true, updateTime: new Date() }
        })

        // 插入新的技能
        for (const skill of skills) {
          if (skill.skillName) {
            await tx.hrPersonSkill.create({
              data: {
                personId: BigInt(personId),
                skillName: skill.skillName,
                proficiencyLevel: skill.proficiencyLevel || null,
                sourceType: skill.sourceType || 'manual',
                createTime: new Date(),
                updateTime: new Date(),
                deleted: false
              }
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
                trainingInstitution: training.trainingInstitution || null,
                certificateObtained: training.certificateObtained || false,
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

      // 10. 更新社保记录（如果有数据）
      if (socialInsurances && Array.isArray(socialInsurances)) {
        // 先软删除现有的社保记录
        await tx.hrPersonSocialInsurance.updateMany({
          where: { personId: BigInt(personId) },
          data: { deleted: true, updateTime: new Date() }
        })

        // 插入新的社保记录
        for (const insurance of socialInsurances) {
          if (insurance.startDate && insurance.endDate) {
            await tx.hrPersonSocialInsurance.create({
              data: {
                personId: BigInt(personId),
                startDate: new Date(insurance.startDate),
                endDate: new Date(insurance.endDate),
                city: insurance.city || null,
                company: insurance.company || null,
                createTime: new Date(),
                updateTime: new Date(),
                deleted: false
              }
            })
          }
        }
      }

      return { success: true }
    })

    return NextResponse.json({
      success: true,
      message: '草稿保存成功',
      data: result
    })

  } catch (error) {
    console.error('保存草稿失败:', error)
    return NextResponse.json(
      { success: false, message: '保存草稿失败' },
      { status: 500 }
    )
  }
}
