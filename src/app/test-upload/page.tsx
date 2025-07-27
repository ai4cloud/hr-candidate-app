'use client'

import React, { useState } from 'react'
import FileUpload from '@/components/FileUpload'

export default function TestUploadPage() {
  const [avatarUrl, setAvatarUrl] = useState('')
  const [resumeUrl, setResumeUrl] = useState('')
  const [idCardFrontUrl, setIdCardFrontUrl] = useState('')

  const handleAvatarUpload = (fileUrl: string, fileName: string) => {
    setAvatarUrl(fileUrl)
    console.log('头像上传成功:', { fileUrl, fileName })
  }

  const handleResumeUpload = (fileUrl: string, fileName: string) => {
    setResumeUrl(fileUrl)
    console.log('简历上传成功:', { fileUrl, fileName })
  }

  const handleIdCardUpload = (fileUrl: string, fileName: string) => {
    setIdCardFrontUrl(fileUrl)
    console.log('身份证上传成功:', { fileUrl, fileName })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">文件上传组件测试</h1>
        
        <div className="space-y-8">
          {/* 头像上传 */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">头像上传</h2>
            <FileUpload
              onFileUploaded={handleAvatarUpload}
              directory="avatars"
              accept="image/*"
              maxSize={5}
              placeholder="点击上传头像"
              className="max-w-md"
            />
            {avatarUrl && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">上传的头像:</p>
                <img 
                  src={avatarUrl} 
                  alt="头像预览" 
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                />
              </div>
            )}
          </div>

          {/* 简历上传 */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">简历文件上传</h2>
            <FileUpload
              onFileUploaded={handleResumeUpload}
              directory="resumes"
              accept=".pdf,.doc,.docx,.txt"
              maxSize={10}
              placeholder="点击上传简历文件"
              className="max-w-md"
            />
            {resumeUrl && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">简历文件URL:</p>
                <a 
                  href={resumeUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm break-all"
                >
                  {resumeUrl}
                </a>
              </div>
            )}
          </div>

          {/* 身份证上传 */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">身份证正面上传</h2>
            <FileUpload
              onFileUploaded={handleIdCardUpload}
              directory="id-cards"
              accept="image/*"
              maxSize={5}
              placeholder="点击上传身份证正面"
              className="max-w-md"
            />
            {idCardFrontUrl && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">身份证图片:</p>
                <img 
                  src={idCardFrontUrl} 
                  alt="身份证预览" 
                  className="max-w-sm rounded-lg border-2 border-gray-200"
                />
              </div>
            )}
          </div>

          {/* 上传结果汇总 */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">上传结果汇总</h2>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">头像URL:</span> 
                <span className="ml-2 text-gray-600">{avatarUrl || '未上传'}</span>
              </div>
              <div>
                <span className="font-medium">简历URL:</span> 
                <span className="ml-2 text-gray-600">{resumeUrl || '未上传'}</span>
              </div>
              <div>
                <span className="font-medium">身份证URL:</span> 
                <span className="ml-2 text-gray-600">{idCardFrontUrl || '未上传'}</span>
              </div>
            </div>
          </div>

          {/* 使用说明 */}
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">使用说明</h2>
            <div className="text-sm text-blue-800 space-y-2">
              <p>• <strong>头像上传</strong>: 支持图片格式，最大5MB</p>
              <p>• <strong>简历上传</strong>: 支持PDF、Word、文本格式，最大10MB</p>
              <p>• <strong>身份证上传</strong>: 支持图片格式，最大5MB</p>
              <p>• 文件上传后会自动保存到管理端文件服务</p>
              <p>• 支持预览和删除已上传的文件</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
