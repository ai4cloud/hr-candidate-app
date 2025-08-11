import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // 查询熟练程度字典数据
    const dictData = await prisma.systemDictData.findMany({
      where: {
        dictType: 'proficiency_level',
        deleted: false
      },
      orderBy: {
        sort: 'asc'
      },
      select: {
        label: true,
        value: true,
        sort: true
      }
    })

    return NextResponse.json({
      success: true,
      data: dictData
    })

  } catch (error) {
    console.error('获取熟练程度字典数据失败:', error)
    return NextResponse.json(
      {
        success: false,
        message: '获取熟练程度字典数据失败',
        error: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}
