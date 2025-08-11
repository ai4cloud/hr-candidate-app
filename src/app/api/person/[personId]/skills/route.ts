import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 获取人员技能列表
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ personId: string }> }
) {
  try {
    const { personId: personIdStr } = await params
    const personId = BigInt(personIdStr)

    const skills = await prisma.hrPersonSkill.findMany({
      where: {
        personId: personId,
        deleted: false
      },
      include: {
        skill: {
          select: {
            id: true,
            code: true,
            name: true,
            category: true
          }
        }
      },
      orderBy: {
        createTime: 'desc'
      }
    })

    const result = skills.map(skill => ({
      id: Number(skill.id),
      skillId: skill.skillId ? Number(skill.skillId) : null,
      skillName: skill.skillName,
      proficiencyLevel: skill.proficiencyLevel,
      yearsOfExperience: skill.yearsOfExperience,
      sourceType: skill.skillId ? 'catalog' : 'custom',
      skill: skill.skill ? {
        id: Number(skill.skill.id),
        code: skill.skill.code,
        name: skill.skill.name,
        category: skill.skill.category
      } : null
    }))

    return NextResponse.json({
      success: true,
      data: result,
      message: '获取技能列表成功'
    })

  } catch (error) {
    console.error('获取技能列表失败:', error)
    return NextResponse.json(
      {
        success: false,
        message: '获取技能列表失败',
        error: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}

// 保存人员技能
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ personId: string }> }
) {
  try {
    const { personId: personIdStr } = await params
    const personId = BigInt(personIdStr)
    const body = await request.json()
    const { skills } = body

    if (!Array.isArray(skills)) {
      return NextResponse.json(
        {
          success: false,
          message: '技能数据格式错误'
        },
        { status: 400 }
      )
    }

    // 开始事务
    await prisma.$transaction(async (tx) => {
      // 删除现有技能记录
      await tx.hrPersonSkill.deleteMany({
        where: {
          personId: personId
        }
      })

      // 添加新的技能记录
      if (skills.length > 0) {
        const skillsToCreate = skills.map((skill: any) => ({
          personId: personId,
          skillId: skill.skillId ? BigInt(skill.skillId) : null,
          skillName: skill.skillName,
          proficiencyLevel: skill.proficiencyLevel,
          yearsOfExperience: skill.yearsOfExperience,
          sourceType: skill.sourceType || (skill.skillId ? 'catalog' : 'custom'),
          tenantId: BigInt(1), // 默认租户ID
          creator: 'system',
          createTime: new Date(),
          updateTime: new Date(),
          deleted: false
        }))

        await tx.hrPersonSkill.createMany({
          data: skillsToCreate
        })
      }
    })

    return NextResponse.json({
      success: true,
      message: '保存技能信息成功'
    })

  } catch (error) {
    console.error('保存技能信息失败:', error)
    return NextResponse.json(
      {
        success: false,
        message: '保存技能信息失败',
        error: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}
