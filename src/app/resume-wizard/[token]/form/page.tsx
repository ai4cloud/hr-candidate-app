'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import BasicInfoForm from '@/components/forms/BasicInfoForm'
import JobExpectationForm from '@/components/forms/JobExpectationForm'
import EducationForm from '@/components/forms/EducationForm'
import WorkExperienceForm from '@/components/forms/WorkExperienceForm'
import ProjectExperienceForm from '@/components/forms/ProjectExperienceForm'

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
  { id: 'languages', title: '语言能力', icon: '🌍' }
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
  const [, setPersonData] = useState<Record<string, unknown> | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

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
            city: result.data.person.city || '',
            jobType: result.data.person.jobType || '',
            availableDate: result.data.person.availableDate || '',
            address: result.data.person.address || '',
            registeredAddress: result.data.person.registeredAddress || '',
            // 工作相关字段
            employmentStatus: result.data.person.employmentStatus || '',
            workYear: result.data.person.workYear || '',
            workStartDate: result.data.person.workStartDate || ''
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

  // 自动隐藏保存提示
  useEffect(() => {
    if (saveMessage) {
      const timer = setTimeout(() => {
        setSaveMessage(null)
      }, 3000) // 3秒后自动隐藏
      return () => clearTimeout(timer)
    }
  }, [saveMessage])

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
        languages
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
          languages
        })
      })

      if (!response.ok) {
        throw new Error('保存失败')
      }

      const result = await response.json()
      if (result.success) {
        setLastSaveTime(new Date())
        console.log('保存成功:', result.message)
        // 显示成功提示
        setSaveMessage({ type: 'success', text: '草稿保存成功！' })
      } else {
        throw new Error(result.message || '保存失败')
      }
    } catch (error) {
      console.error('自动保存失败:', error)
      // 显示失败提示
      setSaveMessage({ type: 'error', text: error instanceof Error ? error.message : '保存失败，请重试' })
    } finally {
      setSaving(false)
    }
  }

  // 处理基本信息变化
  const handleBasicInfoChange = (data: any) => {
    setBasicInfo(data)
  }

  // 处理求职期望变化
  const handleJobExpectationChange = async (data: any) => {
    setJobExpectations(data)
    // 立即保存到数据库
    setTimeout(() => handleAutoSave(), 100) // 延迟100ms确保状态更新完成
  }

  // 处理教育经历变化
  const handleEducationChange = async (data: any) => {
    setEducations(data)
    // 立即保存到数据库
    setTimeout(() => handleAutoSave(), 100) // 延迟100ms确保状态更新完成
  }

  // 处理工作经历变化
  const handleWorkExperienceChange = async (data: any) => {
    setWorkExperiences(data)
    // 立即保存到数据库
    setTimeout(() => handleAutoSave(), 100) // 延迟100ms确保状态更新完成
  }

  // 处理项目经历变化
  const handleProjectExperienceChange = async (data: any) => {
    setProjectExperiences(data)
    // 立即保存到数据库
    setTimeout(() => handleAutoSave(), 100) // 延迟100ms确保状态更新完成
  }

  // 处理滑动切换
  const handleSwipe = (direction: 'up' | 'down') => {
    if (direction === 'down' && currentStep > 0) {
      handleStepChange(currentStep - 1)
    } else if (direction === 'up' && currentStep < STEPS.length - 1) {
      handleStepChange(currentStep + 1)
    }
  }

  // 渲染添加按钮
  const renderAddButton = () => {
    switch (currentStep) {
      case 1: // 求职期望
        return (
          <button
            onClick={() => {
              // 触发求职期望添加逻辑
              const newJobExpectation = {
                id: Date.now(),
                expectedPosition: '',
                expectedIndustry: '',
                expectedCity: '',
                expectedSalary: ''
              }
              setJobExpectations(prev => {
                const newList = [...prev, newJobExpectation]
                // 自动展开新添加的记录
                setTimeout(() => {
                  const newIndex = newList.length - 1
                  const expandEvent = new CustomEvent('expandJobExpectation', {
                    detail: { index: newIndex }
                  })
                  window.dispatchEvent(expandEvent)
                }, 100)
                return newList
              })
            }}
            disabled={jobExpectations.length >= 3}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              jobExpectations.length >= 3
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            添加求职期望 ({jobExpectations.length}/3)
          </button>
        )
      case 2: // 教育经历
        return (
          <button
            onClick={() => {
              // 触发教育经历添加逻辑
              const newEducation = {
                id: Date.now(),
                school: '',
                major: '',
                degree: '',
                startDate: '',
                endDate: '',
                description: ''
              }
              setEducations(prev => {
                const newList = [...prev, newEducation]
                // 自动展开新添加的记录
                setTimeout(() => {
                  const newIndex = newList.length - 1
                  const expandEvent = new CustomEvent('expandEducation', {
                    detail: { index: newIndex }
                  })
                  window.dispatchEvent(expandEvent)
                }, 100)
                return newList
              })
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            添加教育经历
          </button>
        )
      case 3: // 工作经历
        return (
          <button
            onClick={() => {
              // 触发工作经历添加逻辑
              const newWorkExperience = {
                id: Date.now(),
                company: '',
                position: '',
                industry: '',
                startDate: '',
                endDate: '',
                description: ''
              }
              setWorkExperiences(prev => {
                const newList = [...prev, newWorkExperience]
                // 自动展开新添加的记录
                setTimeout(() => {
                  const newIndex = newList.length - 1
                  const expandEvent = new CustomEvent('expandWorkExperience', {
                    detail: { index: newIndex }
                  })
                  window.dispatchEvent(expandEvent)
                }, 100)
                return newList
              })
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            添加工作经历
          </button>
        )
      case 4: // 项目经历
        return (
          <button
            onClick={() => {
              // 触发项目经历添加逻辑
              const newProjectExperience = {
                id: Date.now(),
                name: '',
                role: '',
                startDate: '',
                endDate: '',
                description: '',
                technologies: ''
              }
              setProjectExperiences(prev => {
                const newList = [...prev, newProjectExperience]
                // 自动展开新添加的记录
                setTimeout(() => {
                  const newIndex = newList.length - 1
                  const expandEvent = new CustomEvent('expandProjectExperience', {
                    detail: { index: newIndex }
                  })
                  window.dispatchEvent(expandEvent)
                }, 100)
                return newList
              })
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            添加项目经历
          </button>
        )
      default:
        return null
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
          <JobExpectationForm
            data={jobExpectations}
            onChange={handleJobExpectationChange}
          />
        )
      case 2: // 教育经历
        return (
          <EducationForm
            data={educations}
            onChange={handleEducationChange}
          />
        )
      case 3: // 工作经历
        return (
          <WorkExperienceForm
            data={workExperiences}
            onChange={handleWorkExperienceChange}
          />
        )
      case 4: // 项目经历
        return (
          <ProjectExperienceForm
            data={projectExperiences}
            onChange={handleProjectExperienceChange}
          />
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
      {/* 顶部导航栏 - 固定在顶部 */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b z-30">
        <div className="px-4 py-4 pl-72">
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

      {/* 左侧步骤导航 - 固定侧边栏 */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white border-r shadow-lg z-20 overflow-y-auto">
        <div className="p-4 pt-20">
          <h2 className="text-base font-semibold text-gray-900 mb-4">填写步骤</h2>
          <nav className="space-y-1">
            {STEPS.map((step, index) => (
              <button
                key={step.id}
                onClick={() => handleStepChange(index)}
                className={`w-full flex items-center space-x-2 px-3 py-2 rounded-md text-left transition-all duration-200 ${
                  index === currentStep
                    ? 'bg-blue-600 text-white shadow-md'
                    : index < currentStep
                    ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                    : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                <span className="text-lg flex-shrink-0">{step.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{step.title}</div>
                  <div className="text-xs opacity-75">
                    步骤 {index + 1} / {STEPS.length}
                  </div>
                </div>
                {index < currentStep && (
                  <span className="text-green-600 font-bold text-base flex-shrink-0">✓</span>
                )}
                {index === currentStep && (
                  <span className="text-white font-bold text-base flex-shrink-0">●</span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="ml-64 px-6 py-6 pt-24">
        <div className="max-w-5xl">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <span className="text-2xl mr-3">{STEPS[currentStep].icon}</span>
                    {STEPS[currentStep].title}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    步骤 {currentStep + 1} / {STEPS.length}
                  </p>
                </div>
                {/* 添加按钮区域 - 根据当前步骤显示对应的添加按钮 */}
                {renderAddButton()}
              </div>
            </div>

          {/* 步骤内容 */}
          <div className="min-h-96">
            {renderStepContent()}
          </div>



          {/* 底部导航按钮 */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <button
              onClick={() => handleStepChange(currentStep - 1)}
              disabled={currentStep === 0}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上一步
            </button>

            <div className="flex items-center space-x-3">
              {/* 保存提示消息 - 内联显示 */}
              {saveMessage && (
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-md text-sm ${
                  saveMessage.type === 'success'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                }`}>
                  <div className="flex-shrink-0">
                    {saveMessage.type === 'success' ? (
                      <svg className="h-4 w-4 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className="font-medium">{saveMessage.text}</span>
                </div>
              )}

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
    </div>
  )
}
