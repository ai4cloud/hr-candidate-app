import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // 获取所有启用的行业数据
    const industries = await prisma.hrIndustryCatalog.findMany({
      where: {
        deleted: false,
        enabled: true
      },
      select: {
        id: true,
        code: true,
        name: true,
        parentId: true,
        level: true,
        enabled: true,
        displayOrder: true
      },
      orderBy: [
        { level: 'asc' },
        { displayOrder: 'asc' }
      ]
    })

    // 转换数据格式
    const formattedIndustries = industries.map(industry => ({
      id: Number(industry.id),
      code: industry.code || '',
      name: industry.name || '',
      parentId: industry.parentId ? Number(industry.parentId) : null,
      level: industry.level || 1,
      enabled: industry.enabled || false,
      displayOrder: industry.displayOrder || 0
    }))

    return NextResponse.json({
      success: true,
      data: formattedIndustries,
      message: '获取行业数据成功'
    })

  } catch (error) {
    console.error('获取行业数据失败:', error)
    return NextResponse.json(
      {
        success: false,
        message: '获取行业数据失败',
        error: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}
