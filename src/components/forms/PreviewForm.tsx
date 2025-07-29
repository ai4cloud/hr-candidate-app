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
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            🎓 教育经历
          </h3>
          <div className="space-y-4">
            {educations.map((education, index) => (
              <div key={education.id || index} className="border border-gray-200 rounded-lg p-4">
                {/* 教育经历标题栏 */}
                <div className="flex items-center gap-2 mb-3">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {education.schoolName || '未填写'}
                      {(education.startDate || education.endDate) && (
                        <span className="ml-2 text-xs text-gray-500 font-normal">
                          {formatDate(education.startDate)} - {formatDate(education.endDate)}
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {education.major || '专业'} · {education.educationLevel || '学历'}
                    </p>
                  </div>
                </div>

                {/* 展开内容 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                  {/* 学校名称 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      学校名称
                    </label>
                    <p className="text-gray-900 px-3 py-2 bg-gray-50 rounded-md">
                      {education.schoolName || '未填写'}
                    </p>
                  </div>

                  {/* 专业 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      专业
                    </label>
                    <p className="text-gray-900 px-3 py-2 bg-gray-50 rounded-md">
                      {education.major || '未填写'}
                    </p>
                  </div>

                  {/* 学历 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      学历
                    </label>
                    <p className="text-gray-900 px-3 py-2 bg-gray-50 rounded-md">
                      {education.educationLevel || '未填写'}
                    </p>
                  </div>

                  {/* 学位 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      学位
                    </label>
                    <p className="text-gray-900 px-3 py-2 bg-gray-50 rounded-md">
                      {education.degree || '未填写'}
                    </p>
                  </div>

                  {/* 入学时间 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      入学时间
                    </label>
                    <p className="text-gray-900 px-3 py-2 bg-gray-50 rounded-md">
                      {formatDate(education.startDate) || '未填写'}
                    </p>
                  </div>

                  {/* 毕业时间 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      毕业时间
                    </label>
                    <p className="text-gray-900 px-3 py-2 bg-gray-50 rounded-md">
                      {formatDate(education.endDate) || '未填写'}
                    </p>
                  </div>

                  {/* 是否统招 */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      是否统招
                    </label>
                    <p className="text-gray-900 px-3 py-2 bg-gray-50 rounded-md">
                      {education.isFullTime ? '是' : '否'}
                    </p>
                  </div>

                  {/* 在校情况 */}
                  {education.schoolExperience && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        在校情况
                      </label>
                      <p className="text-gray-900 px-3 py-2 bg-gray-50 rounded-md whitespace-pre-wrap">
                        {education.schoolExperience}
                      </p>
                    </div>
                  )}

                  {/* 证书文件 */}
                  {(education.educationCertFile || education.educationVerifyFile ||
                    education.degreeCertFile || education.degreeVerifyFile) && (
                    <div className="md:col-span-2">
                      <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        证书文件
                      </h4>
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
          <div className="space-y-4">
            {workExperiences.map((work, index) => (
              <div key={work.id || index} className="border border-gray-200 rounded-lg p-4">
                {/* 工作经历标题栏 */}
                <div className="flex items-center gap-2 mb-3">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {work.companyName || '未填写'}
                      {(work.startDate || work.endDate) && (
                        <span className="ml-2 text-xs text-gray-500 font-normal">
                          {formatDate(work.startDate)} - {formatDate(work.endDate)}
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {work.position || '职位'} · {work.industry || '行业'}
                    </p>
                  </div>
                </div>

                {/* 展开内容 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                  {/* 公司名称 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      公司名称
                    </label>
                    <p className="text-gray-900 px-3 py-2 bg-gray-50 rounded-md">
                      {work.companyName || '未填写'}
                    </p>
                  </div>

                  {/* 职位 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      职位
                    </label>
                    <p className="text-gray-900 px-3 py-2 bg-gray-50 rounded-md">
                      {work.position || '未填写'}
                    </p>
                  </div>

                  {/* 行业 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      行业
                    </label>
                    <p className="text-gray-900 px-3 py-2 bg-gray-50 rounded-md">
                      {work.industry || '未填写'}
                    </p>
                  </div>

                  {/* 工作地点 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      工作地点
                    </label>
                    <p className="text-gray-900 px-3 py-2 bg-gray-50 rounded-md">
                      {work.location || '未填写'}
                    </p>
                  </div>

                  {/* 开始时间 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      开始时间
                    </label>
                    <p className="text-gray-900 px-3 py-2 bg-gray-50 rounded-md">
                      {formatDate(work.startDate) || '未填写'}
                    </p>
                  </div>

                  {/* 结束时间 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      结束时间
                    </label>
                    <p className="text-gray-900 px-3 py-2 bg-gray-50 rounded-md">
                      {formatDate(work.endDate) || '未填写'}
                    </p>
                  </div>

                  {/* 所属部门 */}
                  {work.department && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        所属部门
                      </label>
                      <p className="text-gray-900 px-3 py-2 bg-gray-50 rounded-md">
                        {work.department}
                      </p>
                    </div>
                  )}

                  {/* 职责业绩 */}
                  {work.responsibilityPerformance && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        职责业绩
                      </label>
                      <p className="text-gray-900 px-3 py-2 bg-gray-50 rounded-md whitespace-pre-wrap">
                        {work.responsibilityPerformance}
                      </p>
                    </div>
                  )}
                </div>
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
                  <div className="flex items-baseline justify-between mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {project.projectName || '未填写'}
                    </h4>
                    <span className="text-sm text-gray-500 ml-4">
                      {formatDate(project.startDate)}-{formatDate(project.endDate)}
                    </span>
                  </div>
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
