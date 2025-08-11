'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Zap, Search } from 'lucide-react'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

// 技能数据类型
interface SkillData {
  id?: string
  skillId?: number | null
  skillName: string
  proficiencyLevel: string
  yearsOfExperience: number | null
  sourceType: string // 'catalog' | 'custom'
}

// 技能目录数据类型
interface SkillCatalog {
  id: number
  code: string
  name: string
  category: string
}

// 技能分类
interface SkillCategory {
  key: string
  label: string
  skills: SkillCatalog[]
}

interface SkillsFormProps {
  data: SkillData[]
  onChange: (data: SkillData[]) => void
  onValidationChange?: (isValid: boolean) => void
}

export default function SkillsForm({ data, onChange, onValidationChange }: SkillsFormProps) {
  // 规范化技能数据，确保所有字段都有默认值
  const normalizeSkill = (skill: Partial<SkillData>): SkillData => ({
    id: skill.id || '',
    skillId: skill.skillId || null,
    skillName: skill.skillName || '',
    proficiencyLevel: skill.proficiencyLevel || '',
    yearsOfExperience: skill.yearsOfExperience || null,
    sourceType: skill.sourceType || 'catalog'
  })

  const [skills, setSkills] = useState<SkillData[]>((data || []).map(normalizeSkill))
  const [errors, setErrors] = useState<Record<string, Record<string, string>>>({})
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const [skillCatalogs, setSkillCatalogs] = useState<SkillCategory[]>([])
  const [dictData, setDictData] = useState<Record<string, Array<{ label: string; value: string }>>>({})
  const [loading, setLoading] = useState(true)
  const [showSkillSelector, setShowSkillSelector] = useState(false)
  const [currentEditingIndex, setCurrentEditingIndex] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [skillSelectorMode, setSkillSelectorMode] = useState<'catalog' | 'custom'>('catalog')
  const [customSkillName, setCustomSkillName] = useState('')
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
    setSkills((data || []).map(normalizeSkill))
  }, [data])

  // 监听自动展开事件
  useEffect(() => {
    const handleExpandEvent = (event: CustomEvent) => {
      const { index } = event.detail
      setExpandedIndex(index)
    }

    window.addEventListener('expandSkill', handleExpandEvent as EventListener)

    return () => {
      window.removeEventListener('expandSkill', handleExpandEvent as EventListener)
    }
  }, [])

  // 加载技能目录和字典数据
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)

        // 加载技能目录
        const skillResponse = await fetch('/api/skills/catalog')
        if (skillResponse.ok) {
          const skillResult = await skillResponse.json()
          if (skillResult.success) {
            setSkillCatalogs(skillResult.data)
          }
        }

        // 加载字典数据
        const dictResponse = await fetch('/api/dict/proficiency_level')
        if (dictResponse.ok) {
          const dictResult = await dictResponse.json()
          if (dictResult.success) {
            setDictData({
              proficiency_level: dictResult.data
            })
          }
        }
      } catch (error) {
        console.error('加载数据失败:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // 移除自动同步useEffect，改为在具体操作中调用onChange

  // 添加新技能
  const addSkill = () => {
    const newSkill: SkillData = {
      id: `temp_${Date.now()}`,
      skillId: null,
      skillName: '',
      proficiencyLevel: '',
      yearsOfExperience: null,
      sourceType: 'catalog'
    }

    const updatedSkills = [...skills, newSkill]
    setSkills(updatedSkills)
    onChange(updatedSkills)
    setExpandedIndex(skills.length) // 展开新添加的技能
  }

  // 删除技能
  const removeSkill = (index: number) => {
    const skill = skills[index]
    const skillName = skill.skillName || '该技能'

    // 显示确认对话框
    setConfirmDialog({
      isOpen: true,
      title: '删除技能',
      message: `确定要删除"${skillName}"吗？删除后无法恢复。`,
      onConfirm: () => {
        // 执行删除操作
        const updatedSkills = skills.filter((_, i) => i !== index)
        setSkills(updatedSkills)
        onChange(updatedSkills)

        // 如果删除的是当前展开的技能，关闭展开状态
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

  // 更新技能
  const updateSkill = (index: number, field: keyof SkillData, value: any) => {
    const updatedSkills = [...skills]
    updatedSkills[index] = {
      ...updatedSkills[index],
      [field]: value
    }

    setSkills(updatedSkills)
    onChange(updatedSkills)

    // 清除对应字段的错误信息
    if (errors[index]?.[field]) {
      const newErrors = { ...errors }
      delete newErrors[index][field]
      setErrors(newErrors)
    }
  }

  // 从技能目录选择技能
  const selectSkillFromCatalog = (skill: SkillCatalog, index: number) => {
    console.log('selectSkillFromCatalog called:', { skillName: skill.name, skillId: skill.id, index })

    // 检查索引是否有效
    if (index === null || index === undefined || index < 0 || index >= skills.length) {
      console.error('Invalid index:', index, 'skills.length:', skills.length)
      alert('选择技能时出现错误，请重试')
      return
    }

    // 检查是否已存在相同技能
    const exists = skills.some((s, i) => i !== index && s.skillName === skill.name)
    if (exists) {
      alert('该技能已存在')
      return
    }

    // 一次性更新所有字段
    const updatedSkills = [...skills]
    updatedSkills[index] = {
      ...updatedSkills[index],
      skillId: skill.id,
      skillName: skill.name,
      sourceType: 'catalog'
    }

    console.log('Updated skills:', updatedSkills[index])
    setSkills(updatedSkills)
    onChange(updatedSkills)

    setShowSkillSelector(false)
    setCurrentEditingIndex(null)
    setSkillSelectorMode('catalog')
    setCustomSkillName('')
  }

  // 选择自定义技能
  const selectCustomSkill = (skillName: string, index: number) => {
    console.log('selectCustomSkill called:', { skillName, index })

    // 检查索引是否有效
    if (index === null || index === undefined || index < 0 || index >= skills.length) {
      console.error('Invalid index:', index, 'skills.length:', skills.length)
      alert('选择技能时出现错误，请重试')
      return
    }

    // 检查技能名称是否为空
    if (!skillName.trim()) {
      alert('请输入技能名称')
      return
    }

    // 检查是否已存在相同技能
    const exists = skills.some((s, i) => i !== index && s.skillName === skillName.trim())
    if (exists) {
      alert('该技能已存在')
      return
    }

    // 一次性更新所有字段（自定义技能skillId为null）
    const updatedSkills = [...skills]
    updatedSkills[index] = {
      ...updatedSkills[index],
      skillId: null,
      skillName: skillName.trim(),
      sourceType: 'custom'
    }

    console.log('Updated custom skill:', updatedSkills[index])
    setSkills(updatedSkills)
    onChange(updatedSkills)

    setShowSkillSelector(false)
    setCurrentEditingIndex(null)
    setSkillSelectorMode('catalog')
    setCustomSkillName('')
  }

  // 验证单个字段
  const validateField = (index: number, field: keyof SkillData, value: string | number | null): string => {
    switch (field) {
      case 'skillName':
        if (!value || !String(value).trim()) return '技能名称不能为空'
        if (String(value).length > 100) return '技能名称不能超过100个字符'
        // 检查是否与其他技能重复
        const exists = skills.some((s, i) => i !== index && s.skillName === String(value))
        if (exists) return '该技能已存在'
        break
      case 'proficiencyLevel':
        if (!value) return '请选择熟练程度'
        break
      case 'yearsOfExperience':
        if (value === null || value === undefined || value === '') return '使用年限不能为空'
        const years = Number(value)
        if (isNaN(years) || years < 0) return '使用年限必须是非负整数'
        if (years > 50) return '使用年限不能超过50年'
        break
    }
    return ''
  }

  // 处理字段失焦验证
  const handleFieldBlur = (index: number, field: keyof SkillData, value: string) => {
    const error = validateField(index, field, value)
    const newErrors = { ...errors }

    if (error) {
      if (!newErrors[index]) newErrors[index] = {}
      newErrors[index][field] = error
    } else {
      if (newErrors[index]) {
        delete newErrors[index][field]
        if (Object.keys(newErrors[index]).length === 0) {
          delete newErrors[index]
        }
      }
    }

    setErrors(newErrors)
  }

  // 过滤技能目录
  const filteredSkillCatalogs = skillCatalogs.map(category => ({
    ...category,
    skills: category.skills.filter(skill =>
      skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      skill.code.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.skills.length > 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500">加载中...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 技能列表 */}
      {skills.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Zap className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>暂无技能信息，点击"添加技能"开始填写</p>
        </div>
      ) : (
        <div className="space-y-4">
          {skills.map((skill, index) => (
            <div key={skill.id || index} className="border border-gray-200 rounded-lg p-4">
              {/* 技能标题栏 */}
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                  className="flex items-center gap-2 text-left flex-1"
                >
                  <Zap className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {skill.skillName || '技能名称'}
                      {skill.proficiencyLevel && (
                        <span className="ml-2 text-xs text-gray-500 font-normal">
                          {dictData.proficiency_level?.find(p => p.value === skill.proficiencyLevel)?.label}
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {skill.yearsOfExperience ? `${skill.yearsOfExperience}年经验` : '经验待填写'}
                      {skill.sourceType === 'custom' && (
                        <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-1 rounded">自定义</span>
                      )}
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => removeSkill(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="删除技能"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* 展开的技能详情 */}
              {expandedIndex === index && (
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  {/* 技能名称 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        技能名称 <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={skill.skillName || ''}
                          onClick={() => {
                            console.log('Skill name input clicked for index:', index)
                            setCurrentEditingIndex(index)
                            setShowSkillSelector(true)
                          }}
                          onChange={(e) => {
                            updateSkill(index, 'skillName', e.target.value)
                            updateSkill(index, 'sourceType', 'custom')
                            updateSkill(index, 'skillId', null)
                          }}
                          onBlur={(e) => handleFieldBlur(index, 'skillName', e.target.value)}
                          placeholder="请输入技能名称或点击选择"
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                      {errors[index]?.skillName && (
                        <p className="mt-1 text-sm text-red-600">{errors[index].skillName}</p>
                      )}
                    </div>

                    {/* 熟练程度 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        熟练程度 <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={skill.proficiencyLevel || ''}
                        onChange={(e) => updateSkill(index, 'proficiencyLevel', e.target.value)}
                        onBlur={(e) => handleFieldBlur(index, 'proficiencyLevel', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">请选择熟练程度</option>
                        {dictData.proficiency_level?.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                      {errors[index]?.proficiencyLevel && (
                        <p className="mt-1 text-sm text-red-600">{errors[index].proficiencyLevel}</p>
                      )}
                    </div>
                  </div>

                  {/* 使用年限 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        使用年限（年） <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={skill.yearsOfExperience || ''}
                        onChange={(e) => updateSkill(index, 'yearsOfExperience', e.target.value ? parseInt(e.target.value) : null)}
                        onBlur={(e) => handleFieldBlur(index, 'yearsOfExperience', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="请输入使用年限"
                      />
                      {errors[index]?.yearsOfExperience && (
                        <p className="mt-1 text-sm text-red-600">{errors[index].yearsOfExperience}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 技能选择弹窗 */}
      {showSkillSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl h-[600px] flex flex-col">
            {/* 固定头部 */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">
                选择技能
                <span className="text-sm text-gray-500 ml-2">
                  (编辑索引: {currentEditingIndex})
                </span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowSkillSelector(false)
                  setCurrentEditingIndex(null)
                  setSkillSelectorMode('catalog')
                  setCustomSkillName('')
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 选择模式切换 */}
            <div className="flex border-b">
              <button
                onClick={() => setSkillSelectorMode('catalog')}
                className={`px-4 py-2 font-medium ${
                  skillSelectorMode === 'catalog'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                从技能库选择
              </button>
              <button
                onClick={() => setSkillSelectorMode('custom')}
                className={`px-4 py-2 font-medium ${
                  skillSelectorMode === 'custom'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                输入自定义技能
              </button>
            </div>

            {/* 搜索框 - 仅在技能库模式下显示 */}
            {skillSelectorMode === 'catalog' && (
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="搜索技能..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {/* 自定义技能输入模式 */}
            {skillSelectorMode === 'custom' && (
              <div className="p-4 border-b">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      技能名称 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={customSkillName}
                      onChange={(e) => setCustomSkillName(e.target.value)}
                      placeholder="请输入自定义技能名称"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      maxLength={100}
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSkillSelectorMode('catalog')
                        setCustomSkillName('')
                      }}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      取消
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (customSkillName.trim() && currentEditingIndex !== null) {
                          selectCustomSkill(customSkillName, currentEditingIndex)
                        } else {
                          alert('请输入技能名称')
                        }
                      }}
                      disabled={!customSkillName.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      确认添加
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 可滚动内容区域 */}
            <div className="flex-1 overflow-y-auto">
              {/* 技能分类列表 - 仅在技能库模式下显示 */}
              {skillSelectorMode === 'catalog' && (
                <div className="p-4">
                  <div className="space-y-4">
                    {filteredSkillCatalogs.map((category) => (
                      <div key={category.key} className="border border-gray-200 rounded-lg p-4">
                        <h5 className="font-medium text-gray-900 mb-3">{category.label}</h5>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                          {category.skills.map((skill) => (
                            <button
                              key={skill.id}
                              type="button"
                              onClick={() => {
                                if (currentEditingIndex !== null) {
                                  selectSkillFromCatalog(skill, currentEditingIndex)
                                } else {
                                  console.error('currentEditingIndex is null')
                                  alert('请先选择要编辑的技能')
                                }
                              }}
                              className="p-2 text-sm border border-gray-200 rounded-md text-left hover:bg-blue-50 hover:border-blue-300 transition-colors"
                            >
                              {skill.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {filteredSkillCatalogs.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>未找到匹配的技能</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 确认删除对话框 */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  )
}
