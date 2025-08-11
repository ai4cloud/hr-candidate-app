import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 技能分类映射
const SKILL_CATEGORIES = {
  programming_language: '编程语言',
  frontend: '前端技术',
  backend: '后端技术',
  mobile: '移动开发',
  database: '数据库',
  middleware: '中间件/消息队列',
  os: '操作系统',
  cloud_ops: '云计算与运维',
  testing: '测试工具',
  design: '设计工具',
  pm: '项目管理'
}

export async function GET(request: NextRequest) {
  try {
    // 获取所有技能目录
    const skills = await prisma.hrSkillCatalog.findMany({
      where: {
        deleted: false
      },
      select: {
        id: true,
        code: true,
        name: true,
        category: true
      },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    })

    // 按分类分组
    const groupedSkills = skills.reduce((acc, skill) => {
      const categoryKey = skill.category || 'other'
      const categoryLabel = SKILL_CATEGORIES[categoryKey as keyof typeof SKILL_CATEGORIES] || '其他'
      
      if (!acc[categoryKey]) {
        acc[categoryKey] = {
          key: categoryKey,
          label: categoryLabel,
          skills: []
        }
      }
      
      acc[categoryKey].skills.push({
        id: Number(skill.id),
        code: skill.code || '',
        name: skill.name,
        category: skill.category || ''
      })
      
      return acc
    }, {} as Record<string, any>)

    // 转换为数组并排序
    const result = Object.values(groupedSkills).sort((a: any, b: any) => {
      const order = [
        'programming_language',
        'frontend', 
        'backend',
        'mobile',
        'database',
        'middleware',
        'os',
        'cloud_ops',
        'testing',
        'design',
        'pm',
        'other'
      ]
      return order.indexOf(a.key) - order.indexOf(b.key)
    })

    return NextResponse.json({
      success: true,
      data: result,
      message: '获取技能目录成功'
    })

  } catch (error) {
    console.error('获取技能目录失败:', error)
    return NextResponse.json(
      {
        success: false,
        message: '获取技能目录失败',
        error: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}
