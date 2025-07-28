'use client'

import { useState, useEffect } from 'react'
import CitySelector from '@/components/ui/CitySelector'
import FileUpload from '@/components/FileUpload'
import { User, FileText, Eye, Download, Upload, Trash2, CreditCard } from 'lucide-react'

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
  avatarUrl: string
  idCardFrontUrl: string  // 身份证正面照URL
  idCardBackUrl: string   // 身份证反面照URL

  // 工作相关字段
  employmentStatus: string
  workYear: string
  workStartDate: string
}

interface BasicInfoFormProps {
  data: Partial<BasicInfoData>
  onChange: (data: Partial<BasicInfoData>) => void
}

// 文件预览组件
function FilePreview({
  fileUrl,
  fileName,
  onDelete,
  onReupload
}: {
  fileUrl: string;
  fileName?: string;
  onDelete: () => void;
  onReupload: () => void;
}) {
  if (!fileUrl) return null

  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileUrl)
  const displayName = fileName || fileUrl.split('/').pop() || '文件'

  return (
    <div className="mt-2 p-3 bg-gray-50 rounded-lg border">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
          <span className="text-sm text-gray-700 truncate">{displayName}</span>
        </div>
        <div className="flex items-center space-x-1 ml-2">
          {/* 预览按钮 */}
          <button
            type="button"
            onClick={() => window.open(fileUrl, '_blank')}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title={isImage ? "预览图片" : "查看文件"}
          >
            <Eye className="h-4 w-4" />
          </button>

          {/* 下载按钮 */}
          <button
            type="button"
            onClick={() => {
              const link = document.createElement('a')
              link.href = fileUrl
              link.download = displayName
              link.target = '_blank'
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
            }}
            className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
            title="下载文件"
          >
            <Download className="h-4 w-4" />
          </button>

          {/* 重新上传按钮 */}
          <button
            type="button"
            onClick={onReupload}
            className="p-1.5 text-orange-600 hover:bg-orange-50 rounded transition-colors"
            title="重新上传"
          >
            <Upload className="h-4 w-4" />
          </button>

          {/* 删除按钮 */}
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
            title="删除文件"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isImage && (
        <div className="mt-3">
          <img
            src={fileUrl}
            alt="预览"
            className="max-w-full h-32 object-contain rounded border bg-white"
          />
        </div>
      )}
    </div>
  )
}

export default function BasicInfoForm({ data, onChange }: BasicInfoFormProps) {
  const [formData, setFormData] = useState<Partial<BasicInfoData>>(data)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [dictData, setDictData] = useState<Record<string, Array<{ label: string; value: string }>>>({})
  const [loading, setLoading] = useState(true)
  const [isCitySelectorOpen, setIsCitySelectorOpen] = useState(false)

  // 固定的性别选项
  const genderOptions = [
    { value: '1', label: '男' },
    { value: '2', label: '女' }
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
            types: ['ethnicity', 'nationality', 'political_status', 'marital_status', 'job_type', 'employment_status']
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

  // 处理头像上传
  const handleAvatarUpload = (fileUrl: string, fileName: string) => {
    handleChange('avatarUrl', fileUrl)
  }

  // 处理身份证文件上传
  const handleIdCardUpload = (field: 'idCardFrontUrl' | 'idCardBackUrl') => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        try {
          const formData = new FormData()
          formData.append('file', file)
          formData.append('directory', 'id-cards')

          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          })

          const result = await response.json()
          if (result.success && result.data?.fileUrl) {
            handleChange(field, result.data.fileUrl)
          } else {
            console.error('文件上传失败:', result.error || result.message || '未知错误')
          }
        } catch (error) {
          console.error('文件上传失败:', error)
        }
      }
    }
    input.click()
  }

  return (
    <div className="space-y-6">
      {/* 头像和基本信息第一行 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* 头像上传区域 */}
        <div className="flex items-center space-x-4">
          {/* 头像预览 */}
          <div className="flex-shrink-0">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-200">
              {formData.avatarUrl ? (
                <img
                  src={formData.avatarUrl}
                  alt="头像预览"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="h-10 w-10 text-gray-400" />
              )}
            </div>
          </div>

          {/* 上传按钮 */}
          <div className="flex-1">
            <FileUpload
              onFileUploaded={handleAvatarUpload}
              directory="avatars"
              accept="image/*"
              maxSize={5}
              placeholder="上传头像"
              currentFile={formData.avatarUrl}
              variant="compact"
              hideFileInfo={true}
            />
          </div>
        </div>

        {/* 姓名 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            姓名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="请输入姓名"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* 性别 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            性别 <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.gender || ''}
            onChange={(e) => handleChange('gender', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">请选择性别</option>
            {genderOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 基本信息 - 按新顺序排列 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

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
      </div>

      {/* 联系信息 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        {/* 现居城市 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            现居城市
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.city || ''}
              onClick={() => setIsCitySelectorOpen(true)}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer bg-white"
              placeholder="请选择现居城市"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* 参加工作时间 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            参加工作时间
          </label>
          <input
            type="date"
            value={formData.workStartDate || ''}
            onChange={(e) => handleChange('workStartDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 在职状态 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            在职状态
          </label>
          <select
            value={formData.employmentStatus || ''}
            onChange={(e) => handleChange('employmentStatus', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">请选择在职状态</option>
            {(dictData.employment_status || []).map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
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

        {/* 现居地址 */}
        <div className="md:col-span-2">
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
        <div className="md:col-span-2">
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

      {/* 身份证照片上传区域 */}
      <div className="space-y-4">
        <h4 className="flex items-center text-lg font-medium text-gray-900">
          <CreditCard className="h-5 w-5 mr-2" />
          身份证照片
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 身份证正面照 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              身份证正面照
            </label>
            {!formData.idCardFrontUrl ? (
              <FileUpload
                onFileUploaded={(fileUrl, fileName) => handleChange('idCardFrontUrl', fileUrl)}
                directory="id-cards"
                accept="image/*"
                maxSize={10}
                placeholder="上传身份证正面照"
                currentFile={formData.idCardFrontUrl}
              />
            ) : (
              <FilePreview
                fileUrl={formData.idCardFrontUrl}
                onDelete={() => handleChange('idCardFrontUrl', '')}
                onReupload={() => handleIdCardUpload('idCardFrontUrl')}
              />
            )}
          </div>

          {/* 身份证反面照 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              身份证反面照
            </label>
            {!formData.idCardBackUrl ? (
              <FileUpload
                onFileUploaded={(fileUrl, fileName) => handleChange('idCardBackUrl', fileUrl)}
                directory="id-cards"
                accept="image/*"
                maxSize={10}
                placeholder="上传身份证反面照"
                currentFile={formData.idCardBackUrl}
              />
            ) : (
              <FilePreview
                fileUrl={formData.idCardBackUrl}
                onDelete={() => handleChange('idCardBackUrl', '')}
                onReupload={() => handleIdCardUpload('idCardBackUrl')}
              />
            )}
          </div>
        </div>
      </div>



      {/* 保存按钮 */}

      {/* 城市选择器 */}
      <CitySelector
        value={formData.city || ''}
        onChange={(city) => handleChange('city', city)}
        onClose={() => setIsCitySelectorOpen(false)}
        isOpen={isCitySelectorOpen}
      />
    </div>
  )
}
