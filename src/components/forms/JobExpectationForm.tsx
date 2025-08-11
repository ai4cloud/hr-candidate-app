'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Target, MapPin, DollarSign, Briefcase } from 'lucide-react'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import CitySelector from '@/components/ui/CitySelector'
import IndustrySelector from '@/components/ui/IndustrySelector'

// 求职期望数据类型 - 基于数据库表结构
interface JobExpectationData {
  id?: string
  expectedPosition: string
  expectedIndustry: string
  expectedCity: string
  expectedSalary: string
}

interface JobExpectationFormProps {
  data: JobExpectationData[]
  onChange: (data: JobExpectationData[]) => void
}

export default function JobExpectationForm({ data, onChange }: JobExpectationFormProps) {
  const [jobExpectations, setJobExpectations] = useState<JobExpectationData[]>(data || [])
  const [errors, setErrors] = useState<Record<string, Record<string, string>>>({})
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const [citySelectorState, setCitySelectorState] = useState<{
    isOpen: boolean
    currentIndex: number | null
  }>({
    isOpen: false,
    currentIndex: null
  })
  const [industrySelectorState, setIndustrySelectorState] = useState<{
    isOpen: boolean
    currentIndex: number | null
  }>({
    isOpen: false,
    currentIndex: null
  })
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
    setJobExpectations(data || [])
  }, [data])

  // 监听自动展开事件
  useEffect(() => {
    const handleExpandEvent = (event: CustomEvent) => {
      const { index } = event.detail
      setExpandedIndex(index)
    }

    window.addEventListener('expandJobExpectation', handleExpandEvent as EventListener)

    return () => {
      window.removeEventListener('expandJobExpectation', handleExpandEvent as EventListener)
    }
  }, [])

  // 添加新的求职期望
  const addJobExpectation = () => {
    // 检查是否已达到最大数量限制（3条）
    if (jobExpectations.length >= 3) {
      alert('最多只能添加3条求职期望')
      return
    }

    const newJobExpectation: JobExpectationData = {
      id: `temp_${Date.now()}`,
      expectedPosition: '',
      expectedIndustry: '',
      expectedCity: '',
      expectedSalary: ''
    }

    const updatedJobExpectations = [...jobExpectations, newJobExpectation]
    setJobExpectations(updatedJobExpectations)
    onChange(updatedJobExpectations)
    setExpandedIndex(jobExpectations.length) // 展开新添加的求职期望
  }

  // 删除求职期望
  const removeJobExpectation = (index: number) => {
    const jobExpectation = jobExpectations[index]
    const positionName = jobExpectation.expectedPosition || '该求职期望'
    
    // 显示确认对话框
    setConfirmDialog({
      isOpen: true,
      title: '删除求职期望',
      message: `确定要删除"${positionName}"吗？删除后无法恢复。`,
      onConfirm: () => {
        // 执行删除操作
        const updatedJobExpectations = jobExpectations.filter((_, i) => i !== index)
        setJobExpectations(updatedJobExpectations)
        onChange(updatedJobExpectations)
        
        // 如果删除的是当前展开的求职期望，关闭展开状态
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

  // 更新求职期望
  const updateJobExpectation = (index: number, field: keyof JobExpectationData, value: any) => {
    const updatedJobExpectations = [...jobExpectations]
    updatedJobExpectations[index] = {
      ...updatedJobExpectations[index],
      [field]: value
    }

    setJobExpectations(updatedJobExpectations)
    onChange(updatedJobExpectations)

    // 清除对应字段的错误信息
    if (errors[index]?.[field]) {
      const newErrors = { ...errors }
      delete newErrors[index][field]
      setErrors(newErrors)
    }
  }

  // 验证单个字段
  const validateField = (index: number, field: keyof JobExpectationData, value: string): string => {
    switch (field) {
      case 'expectedPosition':
        if (!value.trim()) return '期望职位不能为空'
        if (value.length > 100) return '期望职位不能超过100个字符'
        break
      case 'expectedIndustry':
        if (value.length > 100) return '期望行业不能超过100个字符'
        break
      case 'expectedCity':
        if (value.length > 50) return '期望城市不能超过50个字符'
        break
      case 'expectedSalary':
        if (value.length > 100) return '期望薪资不能超过100个字符'
        break
    }
    return ''
  }

  // 处理字段失焦验证
  const handleFieldBlur = (index: number, field: keyof JobExpectationData, value: string) => {
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
      {/* 说明文字 */}
      <p className="text-sm text-gray-500 mb-4">最多可添加3条求职期望</p>

      {/* 求职期望列表 */}
      {jobExpectations.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Target className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>暂无求职期望，点击"添加求职期望"开始填写</p>
          <p className="text-sm mt-1">最多可添加3条求职期望</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobExpectations.map((jobExpectation, index) => (
            <div key={jobExpectation.id || index} className="border border-gray-200 rounded-lg p-4">
              {/* 求职期望标题栏 */}
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                  className="flex items-center gap-2 text-left flex-1"
                >
                  <Target className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {jobExpectation.expectedPosition || '期望职位'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {jobExpectation.expectedIndustry || '期望行业'} · {jobExpectation.expectedCity || '期望城市'}
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => removeJobExpectation(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="删除求职期望"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* 展开的求职期望详情 */}
              {expandedIndex === index && (
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  {/* 期望职位和期望行业 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Briefcase className="w-4 h-4 inline mr-1" />
                        期望职位 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={jobExpectation.expectedPosition}
                        onChange={(e) => updateJobExpectation(index, 'expectedPosition', e.target.value)}
                        onBlur={(e) => handleFieldBlur(index, 'expectedPosition', e.target.value)}
                        placeholder="如：前端开发工程师、产品经理等"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {errors[index]?.expectedPosition && (
                        <p className="mt-1 text-sm text-red-600">{errors[index].expectedPosition}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        期望行业
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={jobExpectation.expectedIndustry}
                          onClick={() => setIndustrySelectorState({ isOpen: true, currentIndex: index })}
                          readOnly
                          placeholder="请选择期望行业"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer bg-white"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                      {errors[index]?.expectedIndustry && (
                        <p className="mt-1 text-sm text-red-600">{errors[index].expectedIndustry}</p>
                      )}
                    </div>
                  </div>

                  {/* 期望城市和期望薪资 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <MapPin className="w-4 h-4 inline mr-1" />
                        期望工作城市
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={jobExpectation.expectedCity}
                          onClick={() => setCitySelectorState({ isOpen: true, currentIndex: index })}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer bg-white"
                          placeholder="请选择期望工作城市"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                          </svg>
                        </div>
                      </div>
                      {errors[index]?.expectedCity && (
                        <p className="mt-1 text-sm text-red-600">{errors[index].expectedCity}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <DollarSign className="w-4 h-4 inline mr-1" />
                        期望薪资
                      </label>
                      <input
                        type="text"
                        value={jobExpectation.expectedSalary}
                        onChange={(e) => updateJobExpectation(index, 'expectedSalary', e.target.value)}
                        onBlur={(e) => handleFieldBlur(index, 'expectedSalary', e.target.value)}
                        placeholder="如：10-15K、面议等"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {errors[index]?.expectedSalary && (
                        <p className="mt-1 text-sm text-red-600">{errors[index].expectedSalary}</p>
                      )}
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

      {/* 城市选择器 */}
      <CitySelector
        value={citySelectorState.currentIndex !== null ? jobExpectations[citySelectorState.currentIndex]?.expectedCity || '' : ''}
        onChange={(city) => {
          if (citySelectorState.currentIndex !== null) {
            updateJobExpectation(citySelectorState.currentIndex, 'expectedCity', city)
          }
        }}
        onClose={() => setCitySelectorState({ isOpen: false, currentIndex: null })}
        isOpen={citySelectorState.isOpen}
      />

      {/* 行业选择器 */}
      <IndustrySelector
        value={industrySelectorState.currentIndex !== null ? jobExpectations[industrySelectorState.currentIndex]?.expectedIndustry || '' : ''}
        onChange={(industry) => {
          if (industrySelectorState.currentIndex !== null) {
            updateJobExpectation(industrySelectorState.currentIndex, 'expectedIndustry', industry)
          }
        }}
        onClose={() => setIndustrySelectorState({ isOpen: false, currentIndex: null })}
        isOpen={industrySelectorState.isOpen}
      />
    </div>
  )
}
