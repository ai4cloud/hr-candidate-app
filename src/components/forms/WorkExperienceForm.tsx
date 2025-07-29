'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Briefcase } from 'lucide-react'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import DatePickerWithToday from '@/components/ui/DatePickerWithToday'

// 工作经历数据类型 - 基于数据库表结构
interface WorkExperienceData {
  id?: string
  companyName: string
  startDate: string
  endDate: string | null  // 支持null值表示"在职"
  industry: string
  position: string
  location: string
  department: string
  responsibilityPerformance: string
}

interface WorkExperienceFormProps {
  data: WorkExperienceData[]
  onChange: (data: WorkExperienceData[]) => void
}

export default function WorkExperienceForm({ data, onChange }: WorkExperienceFormProps) {
  const [workExperiences, setWorkExperiences] = useState<WorkExperienceData[]>(data || [])
  const [errors, setErrors] = useState<Record<string, Record<string, string>>>({})
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  })

  // 同步外部数据变化
  useEffect(() => {
    // 处理从API返回的数据，将空字符串的endDate转换为null
    const processedData = (data || []).map(work => ({
      ...work,
      endDate: work.endDate === '' ? null : work.endDate
    }))
    setWorkExperiences(processedData)
  }, [data])

  // 监听自动展开事件
  useEffect(() => {
    const handleExpandEvent = (event: CustomEvent) => {
      const { index } = event.detail
      setExpandedIndex(index)
    }

    window.addEventListener('expandWorkExperience', handleExpandEvent as EventListener)

    return () => {
      window.removeEventListener('expandWorkExperience', handleExpandEvent as EventListener)
    }
  }, [])

  // 格式化时间显示 yyyy/mm - yyyy/mm
  const formatDateRange = (startDate: string, endDate: string | null): string => {
    const formatDate = (dateStr: string): string => {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      return `${year}/${month}`
    }

    const start = formatDate(startDate)
    const end = endDate === null ? '至今' : formatDate(endDate)

    if (!start && !end) return ''
    if (!start) return end
    if (!end) return start
    return `${start} - ${end}`
  }

  // 添加新的工作经历
  const addWorkExperience = () => {
    const newWorkExperience: WorkExperienceData = {
      id: `temp_${Date.now()}`,
      companyName: '',
      startDate: '',
      endDate: '',
      industry: '',
      position: '',
      location: '',
      department: '',
      responsibilityPerformance: ''
    }

    const updatedWorkExperiences = [...workExperiences, newWorkExperience]
    setWorkExperiences(updatedWorkExperiences)
    onChange(updatedWorkExperiences)
    setExpandedIndex(workExperiences.length) // 展开新添加的工作经历
  }

  // 删除工作经历
  const removeWorkExperience = (index: number) => {
    const workExperience = workExperiences[index]
    const companyName = workExperience.companyName || '该工作经历'

    // 显示确认对话框
    setConfirmDialog({
      isOpen: true,
      title: '删除工作经历',
      message: `确定要删除"${companyName}"吗？删除后无法恢复。`,
      onConfirm: () => {
        // 执行删除操作
        const updatedWorkExperiences = workExperiences.filter((_, i) => i !== index)
        setWorkExperiences(updatedWorkExperiences)
        onChange(updatedWorkExperiences)

        // 清除对应的错误信息
        const newErrors = { ...errors }
        delete newErrors[index]
        setErrors(newErrors)

        // 如果删除的是当前展开的项，关闭展开状态
        if (expandedIndex === index) {
          setExpandedIndex(null)
        } else if (expandedIndex !== null && expandedIndex > index) {
          setExpandedIndex(expandedIndex - 1)
        }

        // 关闭确认对话框
        setConfirmDialog(prev => ({ ...prev, isOpen: false }))
      }
    })
  }

  // 更新工作经历
  const updateWorkExperience = (index: number, field: keyof WorkExperienceData, value: any) => {
    const updatedWorkExperiences = [...workExperiences]
    updatedWorkExperiences[index] = {
      ...updatedWorkExperiences[index],
      [field]: value
    }

    setWorkExperiences(updatedWorkExperiences)
    onChange(updatedWorkExperiences)

    // 清除对应字段的错误信息
    if (errors[index]?.[field]) {
      const newErrors = { ...errors }
      delete newErrors[index][field]
      setErrors(newErrors)
    }
  }

  // 验证表单
  const validateWorkExperience = (workExperience: WorkExperienceData, index: number) => {
    const workExperienceErrors: Record<string, string> = {}

    if (!workExperience.startDate) {
      workExperienceErrors.startDate = '请选择入职时间'
    }

    // 如果不是"至今"（endDate !== null），则必须填写离职时间
    if (workExperience.endDate !== null && !workExperience.endDate) {
      workExperienceErrors.endDate = '请选择离职时间或选择"至今"'
    }

    // 如果有具体的离职时间，检查时间逻辑
    if (workExperience.startDate && workExperience.endDate && workExperience.startDate > workExperience.endDate) {
      workExperienceErrors.endDate = '离职时间不能早于入职时间'
    }

    return workExperienceErrors
  }

  return (
    <div className="space-y-6">


      {/* 工作经历列表 */}
      {workExperiences.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Briefcase className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>暂无工作经历，点击"添加工作经历"开始填写</p>
        </div>
      ) : (
        <div className="space-y-4">
          {workExperiences.map((workExperience, index) => (
            <div key={workExperience.id || index} className="border border-gray-200 rounded-lg p-4">
              {/* 工作经历标题栏 */}
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                  className="flex items-center gap-2 text-left flex-1"
                >
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {workExperience.companyName || '公司名称'}
                      {formatDateRange(workExperience.startDate, workExperience.endDate) && (
                        <span className="ml-2 text-xs text-gray-500 font-normal">
                          {formatDateRange(workExperience.startDate, workExperience.endDate)}
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {workExperience.position || '职位'} · {workExperience.industry || '行业'}
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => removeWorkExperience(index)}
                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* 折叠内容 */}
              {expandedIndex === index && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                  {/* 公司名称 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      公司名称
                    </label>
                    <input
                      type="text"
                      value={workExperience.companyName || ''}
                      onChange={(e) => updateWorkExperience(index, 'companyName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="请输入公司名称"
                    />
                    {errors[index]?.companyName && (
                      <p className="text-red-500 text-sm mt-1">{errors[index].companyName}</p>
                    )}
                  </div>

                  {/* 职位 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      职位
                    </label>
                    <input
                      type="text"
                      value={workExperience.position || ''}
                      onChange={(e) => updateWorkExperience(index, 'position', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="请输入职位"
                    />
                    {errors[index]?.position && (
                      <p className="text-red-500 text-sm mt-1">{errors[index].position}</p>
                    )}
                  </div>

                  {/* 行业 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      行业
                    </label>
                    <input
                      type="text"
                      value={workExperience.industry || ''}
                      onChange={(e) => updateWorkExperience(index, 'industry', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="请输入行业"
                    />
                  </div>

                  {/* 工作地点 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      工作地点
                    </label>
                    <input
                      type="text"
                      value={workExperience.location || ''}
                      onChange={(e) => updateWorkExperience(index, 'location', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="请输入工作地点"
                    />
                  </div>

                  {/* 入职时间 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      入职时间 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={workExperience.startDate || ''}
                      onChange={(e) => updateWorkExperience(index, 'startDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors[index]?.startDate && (
                      <p className="text-red-500 text-sm mt-1">{errors[index].startDate}</p>
                    )}
                  </div>

                  {/* 离职时间 */}
                  <div>
                    <DatePickerWithToday
                      label="离职时间"
                      required
                      value={workExperience.endDate}
                      onChange={(value) => updateWorkExperience(index, 'endDate', value)}
                      placeholder="请选择离职时间"
                      error={errors[index]?.endDate}
                    />
                  </div>

                  {/* 所属部门 */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      所属部门
                    </label>
                    <input
                      type="text"
                      value={workExperience.department || ''}
                      onChange={(e) => updateWorkExperience(index, 'department', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="请输入所属部门"
                    />
                  </div>

                  {/* 工作职责与业绩 */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      工作职责与业绩
                    </label>
                    <textarea
                      value={workExperience.responsibilityPerformance || ''}
                      onChange={(e) => updateWorkExperience(index, 'responsibilityPerformance', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="请详细描述工作职责、主要成就和业绩表现"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 确认删除对话框 */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText="删除"
        cancelText="取消"
        type="danger"
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  )
}
