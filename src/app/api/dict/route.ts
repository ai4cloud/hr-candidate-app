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

// 硬编码的字典数据（已移除employment_status，改为从数据库获取）
const HARDCODED_DICT_DATA = {
  // employment_status 现在从数据库获取，与初始化数据保持一致
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

    // 初始化结果对象
    const groupedData: Record<string, Array<{ label: string; value: string; sort: number }>> = {}

    // 先添加硬编码数据
    for (const type of types) {
      if (HARDCODED_DICT_DATA[type as keyof typeof HARDCODED_DICT_DATA]) {
        groupedData[type] = HARDCODED_DICT_DATA[type as keyof typeof HARDCODED_DICT_DATA]
      }
    }

    // 查询数据库中的字典数据（排除已有硬编码数据的类型）
    const dbTypes = types.filter(type => !HARDCODED_DICT_DATA[type as keyof typeof HARDCODED_DICT_DATA])

    if (dbTypes.length > 0) {
      const dictData = await prisma.systemDictData.findMany({
        where: {
          dictType: {
            in: dbTypes
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

      // 按字典类型分组数据库数据
      dictData.forEach(item => {
        if (!groupedData[item.dictType]) {
          groupedData[item.dictType] = []
        }
        groupedData[item.dictType].push({
          label: item.label,
          value: item.value,
          sort: item.sort
        })
      })
    }

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
