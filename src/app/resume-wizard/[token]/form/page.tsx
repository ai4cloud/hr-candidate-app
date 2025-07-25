'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import BasicInfoForm from '@/components/forms/BasicInfoForm'

// 步骤定义
const STEPS = [
  { id: 'basic', title: '基本信息', icon: '👤' },
  { id: 'job-preferences', title: '求职期望', icon: '💼' },
  { id: 'education', title: '教育经历', icon: '🎓' },
  { id: 'work', title: '工作经历', icon: '💻' },
  { id: 'projects', title: '项目经历', icon: '🚀' },
  { id: 'skills', title: '技能特长', icon: '⚡' },
  { id: 'certificates', title: '资格证书', icon: '🏆' },
  { id: 'training', title: '培训经历', icon: '📚' },
  { id: 'languages', title: '语言能力', icon: '🌍' },
  { id: 'social-insurance', title: '社保记录', icon: '🛡️' }
]

export default function FormPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [personId, setPersonId] = useState<string>('')
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null)

  // 表单数据状态
  const [basicInfo, setBasicInfo] = useState({})
  const [jobExpectations, setJobExpectations] = useState([])
  const [educations, setEducations] = useState([])
  const [workExperiences, setWorkExperiences] = useState([])
  const [projectExperiences, setProjectExperiences] = useState([])
  const [skills, setSkills] = useState([])
  const [certificates, setCertificates] = useState([])
  const [trainings, setTrainings] = useState([])
  const [languages, setLanguages] = useState([])
  const [socialInsurances, setSocialInsurances] = useState([])
  const [personData, setPersonData] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  const params = useParams()
  const router = useRouter()
  const token = decodeURIComponent(params.token as string)

  // 验证token和获取用户信息
  useEffect(() => {
    const initializeForm = async () => {
      try {
        setLoading(true)

        // 检查是否有有效的session
        const savedPersonId = sessionStorage.getItem('personId')
        if (savedPersonId) {
          // 从数据库加载候选人完整信息
          await loadPersonData(savedPersonId)
        } else {
          // 如果没有保存的用户信息，重定向到登录页
          router.push(`/resume-wizard/${encodeURIComponent(token)}`)
        }
      } catch (error) {
        console.error('初始化失败:', error)
        setError('页面初始化失败，请重新登录')
        setLoading(false)
      }
    }

    initializeForm()
  }, [token, router])

  // 从数据库加载候选人信息
  const loadPersonData = async (personId: string) => {
    try {
      console.log('加载候选人信息，ID:', personId)

      const response = await fetch(`/api/person/${personId}`)
      if (!response.ok) {
        throw new Error('获取候选人信息失败')
      }

      const result = await response.json()
      if (result.success) {
        setPersonData(result.data)
        setPersonId(personId)

        // 设置各种数据到对应的状态
        if (result.data.person) {
          setBasicInfo({
            name: result.data.person.name || '',
            gender: result.data.person.gender || '',
            birthDate: result.data.person.birthDate || '',
            age: result.data.person.age || '',
            phone: result.data.person.phone || '',
            email: result.data.person.email || '',
            idCard: result.data.person.idCard || '',
            ethnicity: result.data.person.ethnicity || '',
            nationality: result.data.person.nationality || '',
            politicalStatus: result.data.person.politicalStatus || '',
            maritalStatus: result.data.person.maritalStatus || '',
            currentCity: result.data.person.currentCity || '',
            jobType: result.data.person.jobType || '',
            availableDate: result.data.person.availableDate || '',
            currentAddress: result.data.person.currentAddress || '',
            registeredAddress: result.data.person.registeredAddress || ''
          })
        }

        // 设置其他数据
        if (result.data.jobExpectations) {
          setJobExpectations(result.data.jobExpectations)
        }
        if (result.data.educations) {
          setEducations(result.data.educations)
        }
        if (result.data.workExperiences) {
          setWorkExperiences(result.data.workExperiences)
        }
        if (result.data.projectExperiences) {
          setProjectExperiences(result.data.projectExperiences)
        }
        if (result.data.skills) {
          setSkills(result.data.skills)
        }
        if (result.data.certificates) {
          setCertificates(result.data.certificates)
        }
        if (result.data.trainings) {
          setTrainings(result.data.trainings)
        }
        if (result.data.languages) {
          setLanguages(result.data.languages)
        }
        if (result.data.socialInsurances) {
          setSocialInsurances(result.data.socialInsurances)
        }

        console.log('候选人信息加载成功:', result.data)
      } else {
        throw new Error(result.error || '获取候选人信息失败')
      }
    } catch (error) {
      console.error('加载候选人信息失败:', error)
      setError('加载候选人信息失败，请重新登录')
    } finally {
      setLoading(false)
    }
  }

  // 自动保存 - 2分钟定时
  useEffect(() => {
    const interval = setInterval(() => {
      handleAutoSave()
    }, 2 * 60 * 1000) // 2分钟

    return () => clearInterval(interval)
  }, [])

  // 处理步骤切换
  const handleStepChange = async (newStep: number) => {
    if (newStep >= 0 && newStep < STEPS.length) {
      // 切换步骤时自动保存
      await handleAutoSave()
      setCurrentStep(newStep)
    }
  }

  // 自动保存函数
  const handleAutoSave = async () => {
    if (!personId || saving) {
      return
    }

    try {
      setSaving(true)
      console.log('自动保存数据...', {
        basicInfo,
        jobExpectations,
        educations,
        workExperiences,
        projectExperiences,
        skills,
        certificates,
        trainings,
        languages,
        socialInsurances
      })

      const response = await fetch(`/api/person/${personId}/save-draft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          basicInfo,
          jobExpectations,
          educations,
          workExperiences,
          projectExperiences,
          skills,
          certificates,
          trainings,
          languages,
          socialInsurances
        })
      })

      if (!response.ok) {
        throw new Error('保存失败')
      }

      const result = await response.json()
      if (result.success) {
        setLastSaveTime(new Date())
        console.log('保存成功:', result.message)
      } else {
        throw new Error(result.message || '保存失败')
      }
    } catch (error) {
      console.error('自动保存失败:', error)
      // 可以在这里添加用户提示
    } finally {
      setSaving(false)
    }
  }

  // 处理基本信息变化
  const handleBasicInfoChange = (data: any) => {
    setBasicInfo(data)
  }



  // 处理滑动切换
  const handleSwipe = (direction: 'up' | 'down') => {
    if (direction === 'down' && currentStep > 0) {
      handleStepChange(currentStep - 1)
    } else if (direction === 'up' && currentStep < STEPS.length - 1) {
      handleStepChange(currentStep + 1)
    }
  }

  // 渲染步骤内容
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // 基本信息
        return (
          <BasicInfoForm
            data={basicInfo}
            onChange={handleBasicInfoChange}
          />
        )
      case 1: // 求职期望
        return (
          <div className="text-center text-gray-500 py-20">
            <p>正在开发 求职期望 表单...</p>
            <p className="text-sm mt-2">支持最多3条求职期望记录</p>
          </div>
        )
      default:
        return (
          <div className="text-center text-gray-500 py-20">
            <p>正在开发 {STEPS[currentStep].title} 表单...</p>
            <p className="text-sm mt-2">当前步骤: {currentStep + 1}</p>
          </div>
        )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">{error}</div>
          <button 
            onClick={() => window.location.href = `/resume-wizard/${encodeURIComponent(token)}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            返回登录
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">简历信息填写</h1>
            <div className="text-sm text-gray-500">
              {lastSaveTime && (
                <span>最后保存: {lastSaveTime.toLocaleTimeString()}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 步骤导航 - 固定在顶部 */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center space-x-3 overflow-x-auto">
            {STEPS.map((step, index) => (
              <button
                key={step.id}
                onClick={() => handleStepChange(index)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg whitespace-nowrap transition-all duration-200 ${
                  index === currentStep
                    ? 'bg-blue-600 text-white shadow-md scale-105'
                    : index < currentStep
                    ? 'bg-green-100 text-green-700 border border-green-200 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                <span className="text-base">{step.icon}</span>
                <span className="text-sm font-medium">{step.title}</span>
                {index < currentStep && (
                  <span className="text-green-600 font-bold">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="text-2xl mr-3">{STEPS[currentStep].icon}</span>
              {STEPS[currentStep].title}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              步骤 {currentStep + 1} / {STEPS.length}
            </p>
          </div>

          {/* 步骤内容 */}
          <div className="min-h-96">
            {renderStepContent()}
          </div>

          {/* 底部导航按钮 */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <button
              onClick={() => handleStepChange(currentStep - 1)}
              disabled={currentStep === 0}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上一步
            </button>
            
            <div className="flex space-x-3">
              <button
                onClick={handleAutoSave}
                disabled={saving}
                className={`px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 ${
                  saving ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {saving ? '保存中...' : '保存草稿'}
              </button>
              
              {currentStep === STEPS.length - 1 ? (
                <button className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                  提交简历
                </button>
              ) : (
                <button
                  onClick={() => handleStepChange(currentStep + 1)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  下一步
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
