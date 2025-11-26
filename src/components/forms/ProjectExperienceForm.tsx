'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Code, Calendar, FileText } from 'lucide-react'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import DatePickerWithToday from '@/components/ui/DatePickerWithToday'

// 项目经历数据类型 - 基于数据库表结构
export interface ProjectExperienceData {
  id?: string
  projectName: string
  companyName: string
  startDate: string
  endDate: string | null  // null 表示"至今"
  technologies: string
  projectDesc: string
  projectRole: string
  projectResponsibility: string
  projectAchievement: string
}

interface ProjectExperienceFormProps {
  data: ProjectExperienceData[]
  onChange: (data: ProjectExperienceData[]) => void
}

export default function ProjectExperienceForm({ data, onChange }: ProjectExperienceFormProps) {
  // 规范化项目经历数据，确保所有字段都有默认值
  const normalizeProjectExperience = (project: Partial<ProjectExperienceData>): ProjectExperienceData => ({
    id: project.id || '',
    projectName: project.projectName || '',
    companyName: project.companyName || '',
    startDate: project.startDate || '',
    endDate: project.endDate === undefined ? '' : project.endDate,  // null 表示"至今"，空字符串表示"未选择"
    technologies: project.technologies || '',
    projectDesc: project.projectDesc || '',
    projectRole: project.projectRole || '',
    projectResponsibility: project.projectResponsibility || '',
    projectAchievement: project.projectAchievement || ''
  })

  const [projectExperiences, setProjectExperiences] = useState<ProjectExperienceData[]>(
    (data || []).map(normalizeProjectExperience)
  )
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
    onConfirm: () => { }
  })

  // 同步外部数据变化
  useEffect(() => {
    setProjectExperiences((data || []).map(normalizeProjectExperience))
  }, [data])

  // 监听自动展开事件
  useEffect(() => {
    const handleExpandEvent = (event: CustomEvent) => {
      const { index } = event.detail
      setExpandedIndex(index)
    }

    window.addEventListener('expandProjectExperience', handleExpandEvent as EventListener)

    return () => {
      window.removeEventListener('expandProjectExperience', handleExpandEvent as EventListener)
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

  // 添加新的项目经历
  const addProjectExperience = () => {
    const newProjectExperience: ProjectExperienceData = {
      id: `temp_${Date.now()}`,
      projectName: '',
      companyName: '',
      startDate: '',
      endDate: '',
      technologies: '',
      projectDesc: '',
      projectRole: '',
      projectResponsibility: '',
      projectAchievement: ''
    }

    const updatedProjectExperiences = [...projectExperiences, newProjectExperience]
    setProjectExperiences(updatedProjectExperiences)
    onChange(updatedProjectExperiences)
    setExpandedIndex(projectExperiences.length) // 展开新添加的项目经历
  }

  // 删除项目经历
  const removeProjectExperience = (index: number) => {
    const project = projectExperiences[index]
    const projectName = project.projectName || '该项目经历'

    // 显示确认对话框
    setConfirmDialog({
      isOpen: true,
      title: '删除项目经历',
      message: `确定要删除"${projectName}"吗？删除后无法恢复。`,
      onConfirm: () => {
        // 执行删除操作
        const updatedProjectExperiences = projectExperiences.filter((_, i) => i !== index)
        setProjectExperiences(updatedProjectExperiences)
        onChange(updatedProjectExperiences)

        // 如果删除的是当前展开的项目，关闭展开状态
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

  // 更新项目经历
  const updateProjectExperience = (index: number, field: keyof ProjectExperienceData, value: any) => {
    const updatedProjectExperiences = [...projectExperiences]
    updatedProjectExperiences[index] = {
      ...updatedProjectExperiences[index],
      [field]: value
    }

    setProjectExperiences(updatedProjectExperiences)
    onChange(updatedProjectExperiences)

    // 清除对应字段的错误信息
    if (errors[index]?.[field]) {
      const newErrors = { ...errors }
      delete newErrors[index][field]
      setErrors(newErrors)
    }
  }

  // 验证单个字段
  const validateField = (index: number, field: keyof ProjectExperienceData, value: string): string => {
    switch (field) {
      case 'projectName':
        if (!value.trim()) return '项目名称不能为空'
        if (value.length > 200) return '项目名称不能超过200个字符'
        break
      case 'companyName':
        if (!value.trim()) return '公司名称不能为空'
        if (value.length > 200) return '公司名称不能超过200个字符'
        break
      case 'startDate':
        if (!value) return '开始时间不能为空'
        break
      case 'endDate':
        // 如果不是"至今"（value !== null），则必须填写结束时间
        if (value !== null && !value) return '请选择结束时间或选择"至今"'
        // 如果有具体的结束时间，验证时间逻辑
        const startDate = projectExperiences[index]?.startDate
        if (startDate && value && value < startDate) {
          return '结束时间不能早于开始时间'
        }
        break
      case 'projectRole':
        if (!value.trim()) return '项目角色不能为空'
        if (value.length > 50) return '项目角色不能超过50个字符'
        break
      case 'technologies':
        if (value.length > 1000) return '技术栈不能超过1000个字符'
        break
      case 'projectDesc':
        if (value.length > 2000) return '项目描述不能超过2000个字符'
        break
      case 'projectResponsibility':
        if (value.length > 1000) return '项目职责不能超过1000个字符'
        break
      case 'projectAchievement':
        if (value.length > 1000) return '项目业绩不能超过1000个字符'
        break
    }
    return ''
  }

  // 处理字段失焦验证
  const handleFieldBlur = (index: number, field: keyof ProjectExperienceData, value: string) => {
    const error = validateField(index, field, value)
    if (error) {
      setErrors(prev => ({
        ...prev,
        [index]: {
          ...prev[index],
          [field]: error
        }
      }))
    }
  }

  return (
    <div className="space-y-6">


      {/* 项目经历列表 */}
      {projectExperiences.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Code className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>暂无项目经历，点击"添加项目经历"开始填写</p>
        </div>
      ) : (
        <div className="space-y-4">
          {projectExperiences.map((project, index) => (
            <div key={project.id || index} className="border border-gray-200 rounded-lg p-4">
              {/* 项目经历标题栏 */}
              <div className="flex items-center justify-between mb-3">
                <div
                  onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                  className="flex items-center gap-2 text-left flex-1 cursor-pointer"
                  role="button"
                  tabIndex={0}
                >
                  <Code className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="font-medium text-gray-900 flex flex-col md:flex-row md:items-center">
                      <span>{project.projectName || '项目名称'}</span>
                      {formatDateRange(project.startDate, project.endDate) && (
                        <span className="text-xs text-gray-500 font-normal mt-1 md:mt-0 md:ml-2">
                          {formatDateRange(project.startDate, project.endDate)}
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {project.companyName || '公司名称'} · {project.projectRole || '项目角色'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeProjectExperience(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="删除项目经历"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* 展开的项目经历详情 */}
              {expandedIndex === index && (
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  {/* 基本信息 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        项目名称 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={project.projectName || ''}
                        onChange={(e) => updateProjectExperience(index, 'projectName', e.target.value)}
                        onBlur={(e) => handleFieldBlur(index, 'projectName', e.target.value)}
                        placeholder="请输入项目名称"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {errors[index]?.projectName && (
                        <p className="mt-1 text-sm text-red-600">{errors[index].projectName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        公司名称 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={project.companyName || ''}
                        onChange={(e) => updateProjectExperience(index, 'companyName', e.target.value)}
                        onBlur={(e) => handleFieldBlur(index, 'companyName', e.target.value)}
                        placeholder="请输入公司名称"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {errors[index]?.companyName && (
                        <p className="mt-1 text-sm text-red-600">{errors[index].companyName}</p>
                      )}
                    </div>
                  </div>

                  {/* 时间信息 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        开始时间 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={project.startDate || ''}
                        onChange={(e) => updateProjectExperience(index, 'startDate', e.target.value)}
                        onBlur={(e) => handleFieldBlur(index, 'startDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {errors[index]?.startDate && (
                        <p className="mt-1 text-sm text-red-600">{errors[index].startDate}</p>
                      )}
                    </div>

                    <div>
                      <DatePickerWithToday
                        label="结束时间"
                        required
                        value={project.endDate}
                        onChange={(value) => updateProjectExperience(index, 'endDate', value)}
                        placeholder="请选择结束时间"
                        error={errors[index]?.endDate}
                      />
                    </div>
                  </div>

                  {/* 项目角色和技术栈 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        项目角色 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={project.projectRole || ''}
                        onChange={(e) => updateProjectExperience(index, 'projectRole', e.target.value)}
                        onBlur={(e) => handleFieldBlur(index, 'projectRole', e.target.value)}
                        placeholder="如：前端开发工程师、项目经理等"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {errors[index]?.projectRole && (
                        <p className="mt-1 text-sm text-red-600">{errors[index].projectRole}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        技术栈
                      </label>
                      <input
                        type="text"
                        value={project.technologies || ''}
                        onChange={(e) => updateProjectExperience(index, 'technologies', e.target.value)}
                        onBlur={(e) => handleFieldBlur(index, 'technologies', e.target.value)}
                        placeholder="如：React, Node.js, MySQL等"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {errors[index]?.technologies && (
                        <p className="mt-1 text-sm text-red-600">{errors[index].technologies}</p>
                      )}
                    </div>
                  </div>

                  {/* 项目描述 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FileText className="w-4 h-4 inline mr-1" />
                      项目描述
                    </label>
                    <textarea
                      value={project.projectDesc || ''}
                      onChange={(e) => updateProjectExperience(index, 'projectDesc', e.target.value)}
                      onBlur={(e) => handleFieldBlur(index, 'projectDesc', e.target.value)}
                      placeholder="请描述项目的背景、目标、规模等基本信息"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors[index]?.projectDesc && (
                      <p className="mt-1 text-sm text-red-600">{errors[index].projectDesc}</p>
                    )}
                  </div>

                  {/* 项目职责 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      项目职责
                    </label>
                    <textarea
                      value={project.projectResponsibility || ''}
                      onChange={(e) => updateProjectExperience(index, 'projectResponsibility', e.target.value)}
                      onBlur={(e) => handleFieldBlur(index, 'projectResponsibility', e.target.value)}
                      placeholder="请描述您在项目中的具体职责和工作内容"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors[index]?.projectResponsibility && (
                      <p className="mt-1 text-sm text-red-600">{errors[index].projectResponsibility}</p>
                    )}
                  </div>

                  {/* 项目业绩 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      项目业绩
                    </label>
                    <textarea
                      value={project.projectAchievement || ''}
                      onChange={(e) => updateProjectExperience(index, 'projectAchievement', e.target.value)}
                      onBlur={(e) => handleFieldBlur(index, 'projectAchievement', e.target.value)}
                      placeholder="请描述项目取得的成果、效果或您的个人贡献"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors[index]?.projectAchievement && (
                      <p className="mt-1 text-sm text-red-600">{errors[index].projectAchievement}</p>
                    )}
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
