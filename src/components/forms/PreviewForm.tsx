'use client'

import { useState, useEffect } from 'react'
import { User, MapPin, Phone, Mail, Calendar, FileText, Eye, Download, GraduationCap, Briefcase, Code } from 'lucide-react'

// 数据类型定义
interface PersonData {
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
  idCardFrontUrl: string
  idCardBackUrl: string
  employmentStatus: string
  workYear: string
  workStartDate: string
  educationLevel: string
  degree: string
  school: string
  companyName: string
  position: string
}

interface JobExpectationData {
  expectedPosition: string
  expectedIndustry: string
  expectedSalary: string
  expectedCity: string
  workType?: string
}

interface EducationData {
  id: string
  schoolName: string
  major: string
  degree: string
  educationLevel: string
  startDate: string
  endDate: string
  schoolExperience: string
  isFullTime: boolean
  educationCertFile: string
  educationVerifyFile: string
  degreeCertFile: string
  degreeVerifyFile: string
}

interface WorkExperienceData {
  id: string
  companyName: string
  position: string
  industry: string
  location: string
  department: string
  responsibilityPerformance: string
  startDate: string
  endDate: string
  description: string
}

interface ProjectExperienceData {
  id: string
  name: string
  role: string
  startDate: string
  endDate: string
  description: string
  technologies: string
}

interface SkillData {
  id: string
  skillId?: number | null
  skillName: string
  proficiencyLevel: string
  yearsOfExperience: number | null
  sourceType: string
}

interface PreviewFormProps {
  data: {
    person: PersonData
    jobExpectations: JobExpectationData[]
    educations: EducationData[]
    workExperiences: WorkExperienceData[]
    projectExperiences: ProjectExperienceData[]
    skills: SkillData[]
    certificates: any[]
    trainings: any[]
    languages: any[]
  }
}

// 文件预览组件
function FilePreview({ fileUrl, fileName }: { fileUrl: string; fileName?: string }) {
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

export default function PreviewForm({ data }: PreviewFormProps) {
  const [person, setPerson] = useState<PersonData>(data.person)
  const [jobExpectations, setJobExpectations] = useState<JobExpectationData[]>(data.jobExpectations || [])
  const [educations, setEducations] = useState(data.educations || [])
  const [workExperiences, setWorkExperiences] = useState(data.workExperiences || [])
  const [projectExperiences, setProjectExperiences] = useState(data.projectExperiences || [])
  const [skills, setSkills] = useState<SkillData[]>(data.skills || [])
  const [dictData, setDictData] = useState<Record<string, Array<{ label: string; value: string }>>>({})
  const [loading, setLoading] = useState(true)

  // 从API获取最新的person数据和字典数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 获取personId
        const personId = sessionStorage.getItem('personId')
        if (!personId) {
          console.error('未找到personId')
          setLoading(false)
          return
        }

        // 并行获取person数据和字典数据
        const [personResponse, dictResponse] = await Promise.all([
          fetch(`/api/person/${personId}`),
          fetch('/api/dict', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              types: ['ethnicity', 'nationality', 'political_status', 'marital_status', 'job_type', 'employment_status', 'education_level', 'degree', 'proficiency_level']
            }),
          })
        ])

        // 处理person数据
        if (personResponse.ok) {
          const personResult = await personResponse.json()
          if (personResult.success && personResult.data) {
            // 更新person数据
            if (personResult.data.person) {
              setPerson(personResult.data.person)
            }
            // 更新求职期望数据
            if (personResult.data.jobExpectations) {
              setJobExpectations(personResult.data.jobExpectations)
            }
            // 更新其他数据
            if (personResult.data.educations) {
              setEducations(personResult.data.educations)
            }
            if (personResult.data.workExperiences) {
              setWorkExperiences(personResult.data.workExperiences)
            }
            if (personResult.data.projectExperiences) {
              setProjectExperiences(personResult.data.projectExperiences)
            }
            if (personResult.data.skills) {
              setSkills(personResult.data.skills)
            }
          }
        } else {
          console.error('获取person数据失败')
        }

        // 处理字典数据
        if (dictResponse.ok) {
          const dictResult = await dictResponse.json()
          setDictData(dictResult.data)
        } else {
          console.error('获取字典数据失败')
        }
      } catch (error) {
        console.error('获取数据异常:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // 根据value获取label的辅助函数
  const getDictLabel = (dictType: string, value: string): string => {
    if (!value) return '未填写'
    const options = dictData[dictType] || []
    const option = options.find(opt => opt.value === value)
    return option ? option.label : value
  }

  // 性别映射
  const getGenderText = (gender: string) => {
    switch (gender) {
      case '1': return '男'
      case '2': return '女'
      default: return gender || '未填写'
    }
  }

  // 格式化日期为 yyyy/mm 格式
  const formatDate = (dateString: string) => {
    if (!dateString) return '未填写'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return dateString // 如果日期无效，返回原字符串

      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      return `${year}/${month}`
    } catch (error) {
      return dateString // 如果解析失败，返回原字符串
    }
  }

  // 格式化日期范围，处理endDate为null的情况
  const formatDateRange = (startDate: string, endDate: string | null) => {
    const formattedStartDate = formatDate(startDate)

    if (!endDate || endDate === null) {
      return `${formattedStartDate}-至今`
    }

    const formattedEndDate = formatDate(endDate)
    return `${formattedStartDate}-${formattedEndDate}`
  }

  return (
    <div className="space-y-8">
      {/* 基本信息 */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <User className="h-5 w-5 mr-2" />
          基本信息
        </h3>

        {/* 头像区域 */}
        {person.avatarUrl && (
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <img
                src={person.avatarUrl}
                alt="头像"
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 shadow-lg"
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">姓名</label>
            <p className="text-gray-900">{person.name || '未填写'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">性别</label>
            <p className="text-gray-900">{getGenderText(person.gender)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">出生日期</label>
            <p className="text-gray-900">{formatDate(person.birthDate)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">年龄</label>
            <p className="text-gray-900">{person.age ? `${person.age}岁` : '未填写'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">身份证号</label>
            <p className="text-gray-900">{person.idCard || '未填写'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">手机号</label>
            <p className="text-gray-900">{person.phone || '未填写'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">邮箱</label>
            <p className="text-gray-900">{person.email || '未填写'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">微信号</label>
            <p className="text-gray-900">{person.wechat || '未填写'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">现居城市</label>
            <p className="text-gray-900">{person.city || '未填写'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">籍贯</label>
            <p className="text-gray-900">{person.nativePlace || '未填写'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">国籍</label>
            <p className="text-gray-900">{getDictLabel('nationality', person.nationality)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">民族</label>
            <p className="text-gray-900">{getDictLabel('ethnicity', person.ethnicity)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">政治面貌</label>
            <p className="text-gray-900">{getDictLabel('political_status', person.politicalStatus)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">婚姻状况</label>
            <p className="text-gray-900">{getDictLabel('marital_status', person.maritalStatus)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">在职状态</label>
            <p className="text-gray-900">{getDictLabel('employment_status', person.employmentStatus)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">当前公司</label>
            <p className="text-gray-900">{person.companyName || '未填写'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">当前职位</label>
            <p className="text-gray-900">{person.position || '未填写'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">最高学历</label>
            <p className="text-gray-900">{getDictLabel('education_level', person.educationLevel)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">最高学位</label>
            <p className="text-gray-900">{getDictLabel('degree', person.degree)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">毕业学校</label>
            <p className="text-gray-900">{person.school || '未填写'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">参加工作时间</label>
            <p className="text-gray-900">{formatDate(person.workStartDate)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">工作年限</label>
            <p className="text-gray-900">{person.workYear || '未填写'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">求职类型</label>
            <p className="text-gray-900">{getDictLabel('job_type', person.jobType)}</p>
          </div>
        </div>

        {/* 地址信息 */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">现居地址</label>
            <p className="text-gray-900">{person.address || '未填写'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">户籍地址</label>
            <p className="text-gray-900">{person.registeredAddress || '未填写'}</p>
          </div>
        </div>

        {/* 优势亮点 */}
        {person.highlights && (
          <div className="mt-6">
            <label className="text-sm font-medium text-gray-500">优势亮点</label>
            <div className="mt-2 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-900 whitespace-pre-wrap">{person.highlights}</p>
            </div>
          </div>
        )}

        {/* 身份证照片 */}
        {(person.idCardFrontUrl || person.idCardBackUrl) && (
          <div className="mt-6">
            <h4 className="text-md font-medium text-gray-900 mb-3">身份证照片</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {person.idCardFrontUrl && (
                <div>
                  <label className="text-sm font-medium text-gray-500">身份证正面照</label>
                  <FilePreview fileUrl={person.idCardFrontUrl} />
                </div>
              )}
              {person.idCardBackUrl && (
                <div>
                  <label className="text-sm font-medium text-gray-500">身份证反面照</label>
                  <FilePreview fileUrl={person.idCardBackUrl} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 求职期望 */}
      {jobExpectations && jobExpectations.length > 0 && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            💼 求职期望
          </h3>
          {jobExpectations.map((job, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">期望职位</label>
                <p className="text-gray-900">{job.expectedPosition || '未填写'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">期望行业</label>
                <p className="text-gray-900">{job.expectedIndustry || '未填写'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">期望薪资</label>
                <p className="text-gray-900">{job.expectedSalary || '未填写'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">期望城市</label>
                <p className="text-gray-900">{job.expectedCity || '未填写'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">工作类型</label>
                <p className="text-gray-900">{job.workType || '未填写'}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 求职期望为空时的提示 */}
      {(!jobExpectations || jobExpectations.length === 0) && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            💼 求职期望
          </h3>
          <p className="text-gray-500">暂无求职期望信息</p>
        </div>
      )}

      {/* 教育经历 */}
      {educations && educations.length > 0 && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            🎓 教育经历
          </h3>
          <div className="space-y-6">
            {educations.map((education, index) => (
              <div key={education.id || index} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                {/* 学校和时间 */}
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {education.schoolName || '未填写'}
                    <span className="text-sm text-gray-500 font-normal ml-3">
                      {formatDateRange(education.startDate, education.endDate)}
                    </span>
                  </h4>
                  <p className="text-base font-medium text-gray-700 mb-3">
                    {education.major || '专业'} · {getDictLabel('education_level', education.educationLevel)} · {getDictLabel('degree', education.degree)}
                    {education.isFullTime !== undefined && (
                      <> · {education.isFullTime ? '统招' : '非统招'}</>
                    )}
                  </p>
                </div>

                {/* 在校情况 */}
                {education.schoolExperience && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">在校情况：</p>
                    <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                      {education.schoolExperience}
                    </p>
                  </div>
                )}

                {/* 证书文件 */}
                {(education.educationCertFile || education.educationVerifyFile ||
                  education.degreeCertFile || education.degreeVerifyFile) && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">证书文件：</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {education.educationCertFile && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            学历证文件
                          </label>
                          <FilePreview fileUrl={education.educationCertFile} />
                        </div>
                      )}
                      {education.educationVerifyFile && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            学历证书电子注册备案表
                          </label>
                          <FilePreview fileUrl={education.educationVerifyFile} />
                        </div>
                      )}
                      {education.degreeCertFile && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            学位证文件
                          </label>
                          <FilePreview fileUrl={education.degreeCertFile} />
                        </div>
                      )}
                      {education.degreeVerifyFile && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            学位在线验证报告
                          </label>
                          <FilePreview fileUrl={education.degreeVerifyFile} />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 工作经历 */}
      {workExperiences && workExperiences.length > 0 && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            💻 工作经历
          </h3>
          <div className="space-y-6">
            {workExperiences.map((work, index) => (
              <div key={work.id || index} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                {/* 公司和时间 */}
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {work.companyName || '未填写'}
                    <span className="text-sm text-gray-500 font-normal ml-3">
                      {formatDateRange(work.startDate, work.endDate)}
                    </span>
                  </h4>
                  <p className="text-base font-medium text-gray-700 mb-3">
                    {work.position || '职位'}
                  </p>
                </div>

                {/* 行业和地点 */}
                <div className="mb-4">
                  <p className="text-gray-900 leading-relaxed">
                    <span className="text-sm font-medium text-gray-700">行业：</span>
                    {work.industry || '未填写'}
                    {work.location && (
                      <>
                        <span className="mx-2">·</span>
                        <span className="text-sm font-medium text-gray-700">工作地点：</span>
                        {work.location}
                      </>
                    )}
                  </p>
                </div>

                {/* 所属部门 */}
                {work.department && (
                  <div className="mb-4">
                    <p className="text-gray-900 leading-relaxed">
                      <span className="text-sm font-medium text-gray-700">所属部门：</span>
                      {work.department}
                    </p>
                  </div>
                )}

                {/* 职责业绩 */}
                {work.responsibilityPerformance && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">职责业绩：</p>
                    <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                      {work.responsibilityPerformance}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 项目经历 */}
      {projectExperiences && projectExperiences.length > 0 && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            🚀 项目经历
          </h3>
          <div className="space-y-6">
            {projectExperiences.map((project, index) => (
              <div key={project.id || index} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                {/* 项目标题和时间 */}
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {project.projectName || '未填写'}
                    <span className="text-sm text-gray-500 font-normal ml-3">
                      {formatDateRange(project.startDate, project.endDate)}
                    </span>
                  </h4>
                  <p className="text-base font-medium text-gray-700 mb-3">
                    {project.projectRole || '项目角色'}
                  </p>
                </div>

                {/* 项目描述 */}
                {project.projectDesc && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">项目描述：</p>
                    <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                      {project.projectDesc}
                    </p>
                  </div>
                )}

                {/* 技术栈 */}
                {project.technologies && (
                  <div className="mb-4">
                    <p className="text-gray-900 leading-relaxed">
                      <span className="text-sm font-medium text-gray-700">技术栈：</span>
                      {project.technologies}
                    </p>
                  </div>
                )}

                {/* 项目职责 */}
                {project.projectResponsibility && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">项目职责：</p>
                    <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                      {project.projectResponsibility}
                    </p>
                  </div>
                )}

                {/* 项目业绩 */}
                {project.projectAchievement && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">项目业绩：</p>
                    <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                      {project.projectAchievement}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 技能特长 */}
      {skills && skills.length > 0 && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            ⚡ 技能特长
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {skills.map((skill, index) => (
              <div key={skill.id || index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                {/* 技能名称和熟练程度 */}
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 text-base">
                    {skill.skillName || '未填写'}
                  </h4>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {getDictLabel('proficiency_level', skill.proficiencyLevel)}
                  </span>
                </div>

                {/* 使用年限 */}
                <div className="text-sm text-gray-600">
                  {skill.yearsOfExperience !== null && skill.yearsOfExperience !== undefined
                    ? `${skill.yearsOfExperience}年经验`
                    : '经验待填写'
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 其他模块占位 */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">其他信息</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl mb-2">🏆</div>
            <div className="text-sm font-medium text-gray-700">资格证书</div>
            <div className="text-xs text-gray-500 mt-1">待完善</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl mb-2">📚</div>
            <div className="text-sm font-medium text-gray-700">培训经历</div>
            <div className="text-xs text-gray-500 mt-1">待完善</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl mb-2">🌍</div>
            <div className="text-sm font-medium text-gray-700">语言能力</div>
            <div className="text-xs text-gray-500 mt-1">待完善</div>
          </div>
        </div>
      </div>
    </div>
  )
}
