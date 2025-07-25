import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    if (!type) {
      return NextResponse.json(
        { error: '缺少type参数' },
        { status: 400 }
      )
    }

    // 查询字典数据
    const dictData = await prisma.systemDictData.findMany({
      where: {
        dictType: type,
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
    console.error('获取字典数据失败:', error)
    return NextResponse.json(
      { error: '获取字典数据失败' },
      { status: 500 }
    )
  }
}

// 获取多个字典类型的数据
export async function POST(request: NextRequest) {
  try {
    const { types } = await request.json()

    if (!types || !Array.isArray(types)) {
      return NextResponse.json(
        { error: '缺少types参数或格式错误' },
        { status: 400 }
      )
    }

    // 查询多个字典类型的数据
    const dictData = await prisma.systemDictData.findMany({
      where: {
        dictType: {
          in: types
        },
        deleted: false
      },
      orderBy: [
        { dictType: 'asc' },
        { sort: 'asc' }
      ],
      select: {
        label: true,
        value: true,
        dictType: true,
        sort: true
      }
    })

    // 按字典类型分组
    const groupedData = dictData.reduce((acc, item) => {
      if (!acc[item.dictType]) {
        acc[item.dictType] = []
      }
      acc[item.dictType].push({
        label: item.label,
        value: item.value,
        sort: item.sort
      })
      return acc
    }, {} as Record<string, Array<{ label: string; value: string; sort: number }>>)

    return NextResponse.json({
      success: true,
      data: groupedData
    })

  } catch (error) {
    console.error('获取字典数据失败:', error)
    return NextResponse.json(
      { error: '获取字典数据失败' },
      { status: 500 }
    )
  }
}
