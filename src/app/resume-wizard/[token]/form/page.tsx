'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import BasicInfoForm, { BasicInfoData } from '@/components/forms/BasicInfoForm'
import JobExpectationForm, { JobExpectationData } from '@/components/forms/JobExpectationForm'
import EducationForm, { EducationData } from '@/components/forms/EducationForm'
import WorkExperienceForm, { WorkExperienceData } from '@/components/forms/WorkExperienceForm'
import ProjectExperienceForm, { ProjectExperienceData } from '@/components/forms/ProjectExperienceForm'
import SkillsForm, { SkillData } from '@/components/forms/SkillsForm'
import PreviewForm from '@/components/forms/PreviewForm'

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
  { id: 'preview', title: '预览提交', icon: '📋' }
]

export default function FormPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [personId, setPersonId] = useState<string>('')
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null)

  // 表单数据状态
  const [basicInfo, setBasicInfo] = useState<Partial<BasicInfoData>>({})
  const [jobExpectations, setJobExpectations] = useState<JobExpectationData[]>([])
  const [educations, setEducations] = useState<EducationData[]>([])
  const [workExperiences, setWorkExperiences] = useState<WorkExperienceData[]>([])
  const [projectExperiences, setProjectExperiences] = useState<ProjectExperienceData[]>([])
  const [skills, setSkills] = useState<SkillData[]>([])
  const [certificates, setCertificates] = useState([])
  const [trainings, setTrainings] = useState([])
  const [languages, setLanguages] = useState([])
  const [, setPersonData] = useState<Record<string, unknown> | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isBasicInfoValid, setIsBasicInfoValid] = useState(true)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showCloseHint, setShowCloseHint] = useState(false)

  // 防抖保存的引用
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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
          // 尝试使用Token自动登录
          console.log('Session不存在，尝试使用Token自动登录...')
          try {
            const loginResponse = await fetch('/api/auth/token-login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token })
            })

            const loginResult = await loginResponse.json()

            if (loginResponse.ok && loginResult.success) {
              console.log('Token自动登录成功:', loginResult.personId)
              sessionStorage.setItem('personId', loginResult.personId)
              sessionStorage.setItem('recordStatus', loginResult.recordStatus)

              // 登录成功后加载数据
              await loadPersonData(loginResult.personId)
            } else {
              console.warn('Token自动登录失败:', loginResult)
              // 登录失败，重定向到手动登录页
              router.push(`/resume-wizard/${encodeURIComponent(token)}`)
            }
          } catch (loginError) {
            console.error('Token自动登录异常:', loginError)
            router.push(`/resume-wizard/${encodeURIComponent(token)}`)
          }
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
            wechat: result.data.person.wechat || '',
            email: result.data.person.email || '',
            idCard: result.data.person.idCard || '',
            idType: result.data.person.idType || '',
            idNumber: result.data.person.idNumber || '',
            ethnicity: result.data.person.ethnicity || '',
            nationality: result.data.person.nationality || '',
            politicalStatus: result.data.person.politicalStatus || '',
            maritalStatus: result.data.person.maritalStatus || '',
            city: result.data.person.city || '',
            nativePlace: result.data.person.nativePlace || '',
            jobType: result.data.person.jobType || '',
            availableDate: result.data.person.availableDate || '',
            address: result.data.person.address || '',
            registeredAddress: result.data.person.registeredAddress || '',
            highlights: result.data.person.highlights || '',
            avatarUrl: result.data.person.avatarUrl || '',
            idCardFrontUrl: result.data.person.idCardFrontUrl || '',
            idCardBackUrl: result.data.person.idCardBackUrl || '',
            socialInsuranceImageUrl: result.data.person.socialInsuranceImageUrl || '',
            // 工作相关字段
            employmentStatus: result.data.person.employmentStatus || '',
            workYear: result.data.person.workYear || '',
            workStartDate: result.data.person.workStartDate || ''
          })

          // 检查是否已提交
          if (result.data.person.recordStatus === 'submitted') {
            setIsSubmitted(true)
            setCurrentStep(STEPS.length - 1) // 直接跳转到预览页面
          }
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
      // 如果当前在基本信息步骤且要前进，检查必填字段
      if (currentStep === 0 && newStep > currentStep && !isBasicInfoValid) {
        alert('请填写完整的基本信息必填字段后再继续')
        return
      }

      // 切换步骤时自动保存
      await handleAutoSave()
      setCurrentStep(newStep)
    }
  }

  // 防抖保存函数
  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    saveTimeoutRef.current = setTimeout(() => {
      handleAutoSave()
    }, 1000) // 1秒防抖延迟
  }, [])

  // 清理防抖定时器
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  // 自动保存函数
  const handleAutoSave = async () => {
    if (!personId || saving) {
      return
    }

    // 如果当前在基本信息步骤且必填字段未填写完整，显示提示
    if (currentStep === 0 && !isBasicInfoValid) {
      alert('请填写完整的基本信息必填字段后再保存')
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

      console.log('发送保存请求，personId:', personId)

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

      console.log('API响应状态:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API错误响应:', errorText)
        throw new Error(`保存失败: ${response.status} ${response.statusText}`)
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

  // 提交简历函数
  const handleSubmit = async () => {
    if (!personId || submitting) {
      return
    }

    try {
      setSubmitting(true)

      // 先保存当前数据
      await handleAutoSave()

      // 提交简历
      const response = await fetch(`/api/person/${personId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error('提交失败')
      }

      const result = await response.json()
      if (result.success) {
        console.log('提交成功:', result.message)
        setIsSubmitted(true)
        setSaveMessage({ type: 'success', text: '简历提交成功！' })
      } else {
        throw new Error(result.message || '提交失败')
      }
    } catch (error) {
      console.error('提交失败:', error)
      setSaveMessage({ type: 'error', text: error instanceof Error ? error.message : '提交失败，请重试' })
    } finally {
      setSubmitting(false)
    }
  }

  // 关闭页面函数
  const handleClosePage = () => {
    // 尝试关闭窗口
    if (window.opener) {
      // 如果是弹窗打开的，可以关闭
      window.close()
    } else {
      // 如果是直接访问的，显示友好的提示界面
      setShowCloseHint(true)
    }
  }

  // 处理基本信息变化
  const handleBasicInfoChange = (data: any) => {
    setBasicInfo(data)
  }

  // 处理求职期望变化
  const handleJobExpectationChange = async (data: any) => {
    setJobExpectations(data)
    // 使用防抖延迟保存，避免频繁触发
    debouncedSave()
  }

  // 处理教育经历变化
  const handleEducationChange = async (data: any) => {
    setEducations(data)
    // 使用防抖延迟保存，避免频繁触发
    debouncedSave()
  }

  // 处理工作经历变化
  const handleWorkExperienceChange = async (data: any) => {
    setWorkExperiences(data)

    // 检查是否有多个"至今"的工作记录
    const currentWorkCount = data.filter((work: any) => !work.endDate).length
    if (currentWorkCount > 1) {
      setSaveMessage({
        type: 'error',
        text: '只能有一个当前在职的工作经历，请检查结束时间设置'
      })
      return
    }

    // 使用防抖延迟保存，避免频繁触发
    debouncedSave()
  }

  // 处理项目经历变化
  const handleProjectExperienceChange = async (data: any) => {
    setProjectExperiences(data)
    // 使用防抖延迟保存，避免频繁触发
    debouncedSave()
  }

  // 处理技能特长变化
  const handleSkillsChange = async (data: any) => {
    setSkills(data)
    // 使用防抖延迟保存，避免频繁触发
    debouncedSave()
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
              setJobExpectations(prev => {
                const newJobExpectation = {
                  id: String(Date.now()),
                  expectedPosition: '',
                  expectedIndustry: '',
                  expectedCity: '',
                  expectedSalary: ''
                }
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
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${jobExpectations.length >= 3
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
              setProjectExperiences(prev => {
                const newProjectExperience = {
                  id: String(Date.now()),
                  projectName: '',
                  companyName: '',
                  startDate: '',
                  endDate: '',
                  projectDesc: '',
                  projectRole: '',
                  technologies: '',
                  projectResponsibility: '',
                  projectAchievement: ''
                }
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
      case 5: // 技能特长
        return (
          <button
            onClick={() => {
              // 触发技能特长添加逻辑
              const newSkill = {
                id: `temp_${Date.now()}`,
                skillId: null,
                skillName: '',
                proficiencyLevel: '',
                yearsOfExperience: null,
                sourceType: 'catalog'
              }
              setSkills(prev => {
                const newList = [...prev, newSkill]
                // 自动展开新添加的记录
                setTimeout(() => {
                  const newIndex = newList.length - 1
                  const expandEvent = new CustomEvent('expandSkill', {
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
            添加技能
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
            onValidationChange={setIsBasicInfoValid}
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
      case 5: // 技能特长
        return (
          <SkillsForm
            data={skills}
            onChange={handleSkillsChange}
          />
        )
      case 9: // 预览提交
        return (
          <PreviewForm
            data={{
              person: basicInfo as any,
              jobExpectations: jobExpectations as any,
              educations: educations as any,
              workExperiences: workExperiences as any,
              projectExperiences: projectExperiences as any,
              skills: skills as any,
              certificates: [],
              trainings: [],
              languages: []
            }}
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
        <div className={`px-4 py-2 ${isSubmitted ? '' : 'md:pl-72'}`}>
          <div className="flex items-center justify-between">
            <h1 className="text-lg md:text-xl font-semibold text-gray-900 truncate">
              {isSubmitted ? '简历信息' : '简历信息填写'}
            </h1>
            <div className="text-xs md:text-sm text-gray-500 flex-shrink-0 ml-2">
              {lastSaveTime && !isSubmitted && (
                <span>{lastSaveTime.toLocaleTimeString()} 保存</span>
              )}
            </div>
          </div>

          {/* 移动端进度条 - 仅在移动端显示 */}
          {!isSubmitted && (
            <div className="mt-2 md:hidden">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>步骤 {currentStep + 1}/{STEPS.length}: {STEPS[currentStep].title}</span>
                <span>{Math.round(((currentStep + 1) / STEPS.length) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 左侧步骤导航 - 固定侧边栏 (仅PC端显示) */}
      {!isSubmitted && (
        <div className="hidden md:block fixed left-0 top-0 h-full w-64 bg-white border-r shadow-lg z-20 overflow-y-auto">
          <div className="p-4 pt-15">
            <h2 className="text-base font-semibold text-gray-900 mb-3">填写步骤</h2>
            <nav className="space-y-1">
              {STEPS.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => handleStepChange(index)}
                  className={`w-full flex items-center space-x-2 px-3 py-2 rounded-md text-left transition-all duration-200 ${index === currentStep
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
      )}

      {/* 主要内容区域 */}
      <div className={`px-3 md:px-6 py-4 md:py-6 pt-24 md:pt-16 ${isSubmitted ? '' : 'ml-0 md:ml-64'}`}>
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-4 md:p-6">
            {!isSubmitted && (
              <div className="mb-4 md:mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                      <span className="text-xl md:text-2xl mr-2 md:mr-3">{STEPS[currentStep].icon}</span>
                      {STEPS[currentStep].title}
                    </h2>
                    <p className="text-xs md:text-sm text-gray-600 mt-1 ml-8 md:ml-10">
                      步骤 {currentStep + 1} / {STEPS.length}
                    </p>
                  </div>
                  {/* 添加按钮区域 - 根据当前步骤显示对应的添加按钮 */}
                  <div className="w-full md:w-auto">
                    {renderAddButton()}
                  </div>
                </div>
              </div>
            )}

            {/* 步骤内容 */}
            <div className="min-h-96">
              {renderStepContent()}
            </div>



            {/* 底部导航按钮 */}
            {!isSubmitted && (
              <div className="flex flex-col-reverse md:flex-row justify-between items-center mt-6 md:mt-8 pt-4 md:pt-6 border-t gap-4 md:gap-0">
                <button
                  onClick={() => handleStepChange(currentStep - 1)}
                  disabled={currentStep === 0}
                  className="w-full md:w-auto px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  上一步
                </button>

                <div className="flex flex-col md:flex-row items-center gap-3 md:gap-3 w-full md:w-auto">
                  {/* 保存提示消息 - 内联显示 */}
                  {saveMessage && (
                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-md text-sm w-full md:w-auto justify-center ${saveMessage.type === 'success'
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
                    className={`w-full md:w-auto px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 ${saving ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                  >
                    {saving ? '保存中...' : '保存草稿'}
                  </button>

                  {currentStep === STEPS.length - 1 ? (
                    isSubmitted ? (
                      <button
                        onClick={handleClosePage}
                        className="w-full md:w-auto px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                      >
                        关闭页面
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className={`w-full md:w-auto px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 ${submitting ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                      >
                        {submitting ? '提交中...' : '提交简历'}
                      </button>
                    )
                  ) : (
                    <button
                      onClick={() => handleStepChange(currentStep + 1)}
                      className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      下一步
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 已提交状态下的关闭按钮 */}
            {isSubmitted && (
              <div className="flex justify-center mt-8 pt-6 border-t">
                <button
                  onClick={handleClosePage}
                  className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  关闭页面
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 关闭页面提示模态框 */}
      {showCloseHint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <div className="text-center">
              <div className="mb-4">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                简历提交成功！
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                感谢您完成简历信息填写。HR将会审核您的信息并与您联系。
              </p>
              <div className="bg-gray-50 rounded-md p-4 mb-4">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>关闭此页面：</strong>
                </p>
                <p className="text-sm text-gray-600">
                  • Windows/Linux: 按 <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Ctrl + W</kbd>
                </p>
                <p className="text-sm text-gray-600">
                  • Mac: 按 <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Cmd + W</kbd>
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  或直接关闭浏览器标签页
                </p>
              </div>
              <button
                onClick={() => setShowCloseHint(false)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
