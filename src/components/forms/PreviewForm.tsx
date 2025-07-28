'use client'

import { useState, useEffect } from 'react'
import { User, MapPin, Phone, Mail, Calendar, FileText, Eye, Download } from 'lucide-react'

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
}

interface JobExpectationData {
  position: string
  industry: string
  salary: string
  workLocation: string
  workType: string
}

interface EducationData {
  id: string
  school: string
  major: string
  degree: string
  startDate: string
  endDate: string
  description: string
  educationCertFile: string
  educationVerifyFile: string
  degreeCertFile: string
  degreeVerifyFile: string
}

interface WorkExperienceData {
  id: string
  company: string
  position: string
  startDate: string
  endDate: string
  description: string
  isCurrent: boolean
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

interface PreviewFormProps {
  data: {
    person: PersonData
    jobExpectations: JobExpectationData[]
    educations: EducationData[]
    workExperiences: WorkExperienceData[]
    projectExperiences: ProjectExperienceData[]
    skills: any[]
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
  const { person, jobExpectations, educations, workExperiences, projectExperiences } = data

  // 性别映射
  const getGenderText = (gender: string) => {
    switch (gender) {
      case '1': return '男'
      case '2': return '女'
      default: return gender || '未填写'
    }
  }

  // 格式化日期
  const formatDate = (dateString: string) => {
    if (!dateString) return '未填写'
    return dateString
  }

  return (
    <div className="space-y-8">
      {/* 基本信息 */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <User className="h-5 w-5 mr-2" />
          基本信息
        </h3>
        
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
            <label className="text-sm font-medium text-gray-500">现居城市</label>
            <p className="text-gray-900">{person.city || '未填写'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">民族</label>
            <p className="text-gray-900">{person.ethnicity || '未填写'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">国籍</label>
            <p className="text-gray-900">{person.nationality || '未填写'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">政治面貌</label>
            <p className="text-gray-900">{person.politicalStatus || '未填写'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">婚姻状况</label>
            <p className="text-gray-900">{person.maritalStatus || '未填写'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">在职状态</label>
            <p className="text-gray-900">{person.employmentStatus || '未填写'}</p>
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
                <p className="text-gray-900">{job.position || '未填写'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">期望行业</label>
                <p className="text-gray-900">{job.industry || '未填写'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">期望薪资</label>
                <p className="text-gray-900">{job.salary || '未填写'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">工作地点</label>
                <p className="text-gray-900">{job.workLocation || '未填写'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">工作类型</label>
                <p className="text-gray-900">{job.workType || '未填写'}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 教育经历 */}
      {educations && educations.length > 0 && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            🎓 教育经历
          </h3>
          <div className="space-y-6">
            {educations.map((education, index) => (
              <div key={education.id || index} className="border-l-4 border-blue-500 pl-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">学校名称</label>
                    <p className="text-gray-900 font-medium">{education.school || '未填写'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">专业</label>
                    <p className="text-gray-900">{education.major || '未填写'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">学历</label>
                    <p className="text-gray-900">{education.degree || '未填写'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">开始时间</label>
                    <p className="text-gray-900">{formatDate(education.startDate)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">结束时间</label>
                    <p className="text-gray-900">{formatDate(education.endDate)}</p>
                  </div>
                </div>

                {education.description && (
                  <div className="mb-4">
                    <label className="text-sm font-medium text-gray-500">描述</label>
                    <p className="text-gray-900 whitespace-pre-wrap">{education.description}</p>
                  </div>
                )}

                {/* 教育相关文件 */}
                {(education.educationCertFile || education.educationVerifyFile ||
                  education.degreeCertFile || education.degreeVerifyFile) && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">相关文件</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {education.educationCertFile && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">学历证文件</label>
                          <FilePreview fileUrl={education.educationCertFile} />
                        </div>
                      )}
                      {education.educationVerifyFile && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">学历证书电子注册备案表</label>
                          <FilePreview fileUrl={education.educationVerifyFile} />
                        </div>
                      )}
                      {education.degreeCertFile && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">学位证文件</label>
                          <FilePreview fileUrl={education.degreeCertFile} />
                        </div>
                      )}
                      {education.degreeVerifyFile && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">学位在线验证报告</label>
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            💻 工作经历
          </h3>
          <div className="space-y-6">
            {workExperiences.map((work, index) => (
              <div key={work.id || index} className="border-l-4 border-green-500 pl-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">公司名称</label>
                    <p className="text-gray-900 font-medium">{work.company || '未填写'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">职位</label>
                    <p className="text-gray-900">{work.position || '未填写'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">在职状态</label>
                    <p className="text-gray-900">{work.isCurrent ? '目前在职' : '已离职'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">开始时间</label>
                    <p className="text-gray-900">{formatDate(work.startDate)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">结束时间</label>
                    <p className="text-gray-900">{work.isCurrent ? '至今' : formatDate(work.endDate)}</p>
                  </div>
                </div>

                {work.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">工作描述</label>
                    <p className="text-gray-900 whitespace-pre-wrap">{work.description}</p>
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            🚀 项目经历
          </h3>
          <div className="space-y-6">
            {projectExperiences.map((project, index) => (
              <div key={project.id || index} className="border-l-4 border-purple-500 pl-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">项目名称</label>
                    <p className="text-gray-900 font-medium">{project.name || '未填写'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">担任角色</label>
                    <p className="text-gray-900">{project.role || '未填写'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">技术栈</label>
                    <p className="text-gray-900">{project.technologies || '未填写'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">开始时间</label>
                    <p className="text-gray-900">{formatDate(project.startDate)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">结束时间</label>
                    <p className="text-gray-900">{formatDate(project.endDate)}</p>
                  </div>
                </div>

                {project.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">项目描述</label>
                    <p className="text-gray-900 whitespace-pre-wrap">{project.description}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 其他模块占位 */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">其他信息</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl mb-2">⚡</div>
            <div className="text-sm font-medium text-gray-700">技能特长</div>
            <div className="text-xs text-gray-500 mt-1">待完善</div>
          </div>
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
