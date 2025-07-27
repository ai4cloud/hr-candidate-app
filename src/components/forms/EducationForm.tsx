'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, GraduationCap, Calendar, FileText, Upload, Eye, Download } from 'lucide-react'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import FileUpload from '@/components/FileUpload'

// 教育经历数据类型 - 基于数据库表结构
interface EducationData {
  id?: string
  schoolName: string
  startDate: string
  endDate: string
  major: string
  educationLevel: string
  degree: string
  isFullTime: boolean
  schoolExperience: string
  educationCertFile?: string
  educationCertNo?: string
  educationVerifyCode?: string
  educationVerifyFile?: string
  degreeCertFile?: string
  degreeCertNo?: string
  degreeVerifyCode?: string
  degreeVerifyFile?: string
}

interface EducationFormProps {
  data: EducationData[]
  onChange: (data: EducationData[]) => void
}

// 文件预览组件
function FilePreview({ fileUrl, fileName }: { fileUrl: string; fileName?: string }) {
  if (!fileUrl) return null

  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileUrl)
  const displayName = fileName || fileUrl.split('/').pop() || '文件'

  return (
    <div className="mt-2 p-3 bg-gray-50 rounded-lg border">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-700 truncate">{displayName}</span>
        </div>
        <div className="flex items-center space-x-2">
          {isImage && (
            <button
              type="button"
              onClick={() => window.open(fileUrl, '_blank')}
              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
              title="预览图片"
            >
              <Eye className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => window.open(fileUrl, '_blank')}
            className="p-1 text-gray-600 hover:bg-gray-100 rounded"
            title="下载文件"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isImage && (
        <div className="mt-2">
          <img
            src={fileUrl}
            alt="预览"
            className="max-w-full h-32 object-contain rounded border"
          />
        </div>
      )}
    </div>
  )
}

export default function EducationForm({ data, onChange }: EducationFormProps) {
  const [educations, setEducations] = useState<EducationData[]>(data || [])
  const [errors, setErrors] = useState<Record<string, Record<string, string>>>({})
  const [dictData, setDictData] = useState<Record<string, Array<{ label: string; value: string }>>>({})
  const [loading, setLoading] = useState(true)
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

  // 根据value获取label的辅助函数
  const getDictLabel = (dictType: string, value: string): string => {
    const options = dictData[dictType] || []
    const option = options.find(opt => opt.value === value)
    return option ? option.label : value
  }

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

  // 当外部数据更新时，同步内部状态
  useEffect(() => {
    setEducations(data || [])
  }, [data])

  // 监听自动展开事件
  useEffect(() => {
    const handleExpandEvent = (event: CustomEvent) => {
      const { index } = event.detail
      setExpandedIndex(index)
    }

    window.addEventListener('expandEducation', handleExpandEvent as EventListener)

    return () => {
      window.removeEventListener('expandEducation', handleExpandEvent as EventListener)
    }
  }, [])

  // 加载字典数据
  useEffect(() => {
    const loadDictData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/dict', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            types: ['education_level', 'degree']
          }),
        })
        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            setDictData(result.data)
          }
        }
      } catch (error) {
        console.error('加载字典数据失败:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDictData()
  }, [])

  // 添加新的教育经历
  const addEducation = () => {
    const newEducation: EducationData = {
      id: `temp_${Date.now()}`,
      schoolName: '',
      startDate: '',
      endDate: '',
      major: '',
      educationLevel: '',
      degree: '',
      isFullTime: true,
      schoolExperience: ''
    }

    const updatedEducations = [...educations, newEducation]
    setEducations(updatedEducations)
    onChange(updatedEducations)
    setExpandedIndex(educations.length) // 展开新添加的教育经历
  }

  // 删除教育经历
  const removeEducation = (index: number) => {
    const education = educations[index]
    const schoolName = education.schoolName || '该教育经历'

    // 显示确认对话框
    setConfirmDialog({
      isOpen: true,
      title: '删除教育经历',
      message: `确定要删除"${schoolName}"吗？删除后无法恢复。`,
      onConfirm: () => {
        // 执行删除操作
        const updatedEducations = educations.filter((_, i) => i !== index)
        setEducations(updatedEducations)
        onChange(updatedEducations)

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

  // 更新教育经历
  const updateEducation = (index: number, field: keyof EducationData, value: any) => {
    const updatedEducations = [...educations]
    updatedEducations[index] = {
      ...updatedEducations[index],
      [field]: value
    }

    setEducations(updatedEducations)
    onChange(updatedEducations)

    // 清除对应字段的错误信息
    if (errors[index]?.[field]) {
      const newErrors = { ...errors }
      delete newErrors[index][field]
      setErrors(newErrors)
    }
  }

  // 验证表单
  const validateEducation = (education: EducationData, index: number) => {
    const educationErrors: Record<string, string> = {}

    if (!education.schoolName.trim()) {
      educationErrors.schoolName = '请输入学校名称'
    }

    if (!education.major.trim()) {
      educationErrors.major = '请输入专业名称'
    }

    if (!education.educationLevel) {
      educationErrors.educationLevel = '请选择学历'
    }

    if (!education.degree) {
      educationErrors.degree = '请选择学位'
    }

    if (!education.startDate) {
      educationErrors.startDate = '请选择开始时间'
    }

    // 如果不是"至今"（endDate !== null），则必须填写结束时间
    if (education.endDate !== null && !education.endDate) {
      educationErrors.endDate = '请选择结束时间或选择"至今"'
    }

    // 如果有具体的结束时间，检查时间逻辑
    if (education.startDate && education.endDate && education.startDate > education.endDate) {
      educationErrors.endDate = '结束时间不能早于开始时间'
    }

    return educationErrors
  }

  // 验证所有教育经历
  const validateAllEducations = () => {
    const allErrors: Record<string, Record<string, string>> = {}
    let hasErrors = false

    educations.forEach((education, index) => {
      const educationErrors = validateEducation(education, index)
      if (Object.keys(educationErrors).length > 0) {
        allErrors[index] = educationErrors
        hasErrors = true
      }
    })

    setErrors(allErrors)
    return !hasErrors
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">加载中...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">


      {/* 教育经历列表 */}
      {educations.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <GraduationCap className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>暂无教育经历，点击"添加教育经历"开始填写</p>
        </div>
      ) : (
        <div className="space-y-4">
          {educations.map((education, index) => (
            <div key={education.id || index} className="border border-gray-200 rounded-lg p-4">
              {/* 教育经历标题栏 */}
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                  className="flex items-center gap-2 text-left flex-1"
                >
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {education.schoolName || '学校名称'}
                      {formatDateRange(education.startDate, education.endDate) && (
                        <span className="ml-2 text-xs text-gray-500 font-normal">
                          {formatDateRange(education.startDate, education.endDate)}
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {education.major || '专业'} · {getDictLabel('education_level', education.educationLevel) || '学历'}
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => removeEducation(index)}
                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* 折叠内容 */}
              {expandedIndex === index && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                  {/* 学校名称 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      学校名称 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={education.schoolName}
                      onChange={(e) => updateEducation(index, 'schoolName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="请输入学校名称"
                    />
                    {errors[index]?.schoolName && (
                      <p className="text-red-500 text-sm mt-1">{errors[index].schoolName}</p>
                    )}
                  </div>

                  {/* 专业 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      专业 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={education.major}
                      onChange={(e) => updateEducation(index, 'major', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="请输入专业"
                    />
                    {errors[index]?.major && (
                      <p className="text-red-500 text-sm mt-1">{errors[index].major}</p>
                    )}
                  </div>

                  {/* 学历 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      学历 <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={education.educationLevel}
                      onChange={(e) => updateEducation(index, 'educationLevel', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">请选择学历</option>
                      {(dictData.education_level || []).map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors[index]?.educationLevel && (
                      <p className="text-red-500 text-sm mt-1">{errors[index].educationLevel}</p>
                    )}
                  </div>

                  {/* 学位 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      学位 <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={education.degree}
                      onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">请选择学位</option>
                      {(dictData.degree || []).map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors[index]?.degree && (
                      <p className="text-red-500 text-sm mt-1">{errors[index].degree}</p>
                    )}
                  </div>

                  {/* 入学时间 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      入学时间 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={education.startDate}
                      onChange={(e) => updateEducation(index, 'startDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors[index]?.startDate && (
                      <p className="text-red-500 text-sm mt-1">{errors[index].startDate}</p>
                    )}
                  </div>

                  {/* 毕业时间 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      毕业时间 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={education.endDate === null ? "text" : "date"}
                        value={education.endDate === null ? "至今" : (education.endDate || '')}
                        onChange={(e) => education.endDate !== null && updateEducation(index, 'endDate', e.target.value)}
                        readOnly={education.endDate === null}
                        className={`w-full px-3 py-2 pr-12 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          education.endDate === null ? 'bg-gray-50 text-gray-700' : ''
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => updateEducation(index, 'endDate', education.endDate === null ? '' : null)}
                        className={`absolute right-2 top-1/2 transform -translate-y-1/2 px-2 py-1 text-xs rounded transition-colors ${
                          education.endDate === null
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        至今
                      </button>
                    </div>
                    {errors[index]?.endDate && (
                      <p className="text-red-500 text-sm mt-1">{errors[index].endDate}</p>
                    )}
                  </div>

                  {/* 是否统招 */}
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                      <input
                        type="checkbox"
                        checked={education.isFullTime}
                        onChange={(e) => updateEducation(index, 'isFullTime', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      是否统招
                    </label>
                  </div>

                  {/* 在校情况 */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      在校情况
                    </label>
                    <textarea
                      value={education.schoolExperience}
                      onChange={(e) => updateEducation(index, 'schoolExperience', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="请描述在校期间的学习成绩、获奖情况、社团活动等"
                    />
                  </div>

                  {/* 证书文件上传区域 */}
                  <div className="md:col-span-2">
                    <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      证书文件
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* 学历证文件 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          学历证文件
                        </label>
                        <FileUpload
                          onFileUploaded={(fileUrl, fileName) => updateEducation(index, 'educationCertFile', fileUrl)}
                          directory="education-certs"
                          accept="image/*,.pdf,.doc,.docx"
                          maxSize={10}
                          placeholder="上传学历证文件"
                          currentFile={education.educationCertFile}
                        />
                        <FilePreview fileUrl={education.educationCertFile || ''} />
                      </div>

                      {/* 学历证书电子注册备案表 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          学历证书电子注册备案表
                        </label>
                        <FileUpload
                          onFileUploaded={(fileUrl, fileName) => updateEducation(index, 'educationVerifyFile', fileUrl)}
                          directory="education-verify"
                          accept="image/*,.pdf,.doc,.docx"
                          maxSize={10}
                          placeholder="上传备案表文件"
                          currentFile={education.educationVerifyFile}
                        />
                        <FilePreview fileUrl={education.educationVerifyFile || ''} />
                      </div>

                      {/* 学位证文件 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          学位证文件
                        </label>
                        <FileUpload
                          onFileUploaded={(fileUrl, fileName) => updateEducation(index, 'degreeCertFile', fileUrl)}
                          directory="degree-certs"
                          accept="image/*,.pdf,.doc,.docx"
                          maxSize={10}
                          placeholder="上传学位证文件"
                          currentFile={education.degreeCertFile}
                        />
                        <FilePreview fileUrl={education.degreeCertFile || ''} />
                      </div>

                      {/* 学位在线验证报告 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          学位在线验证报告
                        </label>
                        <FileUpload
                          onFileUploaded={(fileUrl, fileName) => updateEducation(index, 'degreeVerifyFile', fileUrl)}
                          directory="degree-verify"
                          accept="image/*,.pdf,.doc,.docx"
                          maxSize={10}
                          placeholder="上传验证报告"
                          currentFile={education.degreeVerifyFile}
                        />
                        <FilePreview fileUrl={education.degreeVerifyFile || ''} />
                      </div>
                    </div>
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
