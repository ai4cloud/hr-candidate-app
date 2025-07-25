'use client'

import { useState, useEffect } from 'react'

// 基本信息数据类型
interface BasicInfoData {
  name: string
  gender: string
  age: number | null
  birthDate: string
  idCard: string
  phone: string
  email: string
  city: string
  address: string
  registeredAddress: string
  ethnicity: string
  nationality: string
  politicalStatus: string
  maritalStatus: string
  jobType: string
  availableDate: string
}

interface BasicInfoFormProps {
  data: Partial<BasicInfoData>
  onChange: (data: Partial<BasicInfoData>) => void
}

export default function BasicInfoForm({ data, onChange }: BasicInfoFormProps) {
  const [formData, setFormData] = useState<Partial<BasicInfoData>>(data)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [dictData, setDictData] = useState<Record<string, Array<{ label: string; value: string }>>>({})
  const [loading, setLoading] = useState(true)

  // 固定的性别选项
  const genderOptions = [
    { value: 'male', label: '男' },
    { value: 'female', label: '女' }
  ]

  // 当外部数据更新时，同步内部状态
  useEffect(() => {
    setFormData(data)
  }, [data])

  // 从API获取字典数据
  useEffect(() => {
    const fetchDictData = async () => {
      try {
        const response = await fetch('/api/dict', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            types: ['ethnicity', 'nationality', 'political_status', 'marital_status', 'job_type']
          }),
        })

        if (response.ok) {
          const result = await response.json()
          setDictData(result.data)
        } else {
          console.error('获取字典数据失败')
        }
      } catch (error) {
        console.error('获取字典数据异常:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDictData()
  }, [])

  // 更新表单数据
  const handleChange = (field: keyof BasicInfoData, value: string | number | null) => {
    const newData = { ...formData, [field]: value }
    setFormData(newData)
    onChange(newData)
    
    // 清除该字段的错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // 计算年龄
  const calculateAge = (birthDate: string) => {
    if (!birthDate) return null
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  // 生日变化时自动计算年龄
  useEffect(() => {
    if (formData.birthDate) {
      const age = calculateAge(formData.birthDate)
      if (age !== formData.age) {
        handleChange('age', age)
      }
    }
  }, [formData.birthDate])

  // 验证表单
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name?.trim()) {
      newErrors.name = '请输入姓名'
    }

    if (!formData.gender) {
      newErrors.gender = '请选择性别'
    }

    if (!formData.phone?.trim()) {
      newErrors.phone = '请输入手机号'
    } else if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = '请输入正确的手机号格式'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '请输入正确的邮箱格式'
    }

    if (formData.idCard && !/^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/.test(formData.idCard)) {
      newErrors.idCard = '请输入正确的身份证号格式'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }



  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">加载字典数据中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 基本信息 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 姓名 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            姓名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="请输入姓名"
          />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
        </div>

        {/* 性别 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            性别 <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.gender || ''}
            onChange={(e) => handleChange('gender', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.gender ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">请选择性别</option>
            {genderOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          {errors.gender && <p className="mt-1 text-sm text-red-500">{errors.gender}</p>}
        </div>

        {/* 出生日期 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            出生日期
          </label>
          <input
            type="date"
            value={formData.birthDate || ''}
            onChange={(e) => handleChange('birthDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 年龄 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            年龄
          </label>
          <input
            type="number"
            value={formData.age || ''}
            onChange={(e) => handleChange('age', e.target.value ? parseInt(e.target.value) : null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="自动计算或手动输入"
            min="0"
            max="100"
          />
        </div>

        {/* 手机号 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            手机号 <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={formData.phone || ''}
            onChange={(e) => handleChange('phone', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.phone ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="请输入手机号"
          />
          {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
        </div>

        {/* 邮箱 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            邮箱
          </label>
          <input
            type="email"
            value={formData.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="请输入邮箱地址"
          />
          {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
        </div>
      </div>

      {/* 身份信息 */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">身份信息</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 身份证号 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              身份证号
            </label>
            <input
              type="text"
              value={formData.idCard || ''}
              onChange={(e) => handleChange('idCard', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.idCard ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="请输入身份证号"
            />
            {errors.idCard && <p className="mt-1 text-sm text-red-500">{errors.idCard}</p>}
          </div>

          {/* 民族 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              民族
            </label>
            <select
              value={formData.ethnicity || ''}
              onChange={(e) => handleChange('ethnicity', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">请选择民族</option>
              {(dictData.ethnicity || []).map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* 国籍 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              国籍
            </label>
            <select
              value={formData.nationality || ''}
              onChange={(e) => handleChange('nationality', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">请选择国籍</option>
              {(dictData.nationality || []).map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* 政治面貌 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              政治面貌
            </label>
            <select
              value={formData.politicalStatus || ''}
              onChange={(e) => handleChange('politicalStatus', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">请选择政治面貌</option>
              {(dictData.political_status || []).map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* 婚姻状况 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              婚姻状况
            </label>
            <select
              value={formData.maritalStatus || ''}
              onChange={(e) => handleChange('maritalStatus', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">请选择婚姻状况</option>
              {(dictData.marital_status || []).map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 地址信息 */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">地址信息</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 现居城市 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              现居城市
            </label>
            <input
              type="text"
              value={formData.city || ''}
              onChange={(e) => handleChange('city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入现居城市"
            />
          </div>

          {/* 求职类型 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              求职类型
            </label>
            <select
              value={formData.jobType || ''}
              onChange={(e) => handleChange('jobType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">请选择求职类型</option>
              {(dictData.job_type || []).map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* 可入职时间 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              可入职时间
            </label>
            <input
              type="text"
              value={formData.availableDate || ''}
              onChange={(e) => handleChange('availableDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="如：随时、一个月内、三个月内等"
            />
          </div>
        </div>

        {/* 现居地址 */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            现居地址
          </label>
          <textarea
            value={formData.address || ''}
            onChange={(e) => handleChange('address', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="请输入详细地址"
          />
        </div>

        {/* 户籍地址 */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            户籍地址
          </label>
          <textarea
            value={formData.registeredAddress || ''}
            onChange={(e) => handleChange('registeredAddress', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="请输入户籍地址"
          />
        </div>
      </div>

      {/* 保存按钮 */}

    </div>
  )
}
