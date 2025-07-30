import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { personId: string } }
) {
  try {
    const personId = params.personId

    // 更新person的recordStatus为submitted
    const updatedPerson = await prisma.hrPerson.update({
      where: {
        id: parseInt(personId)
      },
      data: {
        recordStatus: 'submitted',
        updateTime: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: '简历提交成功',
      data: {
        recordStatus: updatedPerson.recordStatus
      }
    })

  } catch (error) {
    console.error('提交简历失败:', error)
    return NextResponse.json(
      {
        success: false,
        message: '提交简历失败',
        error: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}
