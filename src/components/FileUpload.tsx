'use client'

import React, { useState, useRef } from 'react'
import { Upload, X, FileText, Image, File } from 'lucide-react'

interface FileUploadProps {
  onFileUploaded: (fileUrl: string, fileName: string) => void
  directory?: string
  accept?: string
  maxSize?: number // MB
  className?: string
  placeholder?: string
  currentFile?: string
  variant?: 'default' | 'compact' // 样式变体
  hideFileInfo?: boolean // 是否隐藏文件信息（仅在compact模式下有效）
}

interface UploadedFile {
  url: string
  name: string
  size: number
  type: string
}

export default function FileUpload({
  onFileUploaded,
  directory = 'uploads',
  accept,
  maxSize = 10,
  className = '',
  placeholder = '点击上传文件',
  currentFile,
  variant = 'default',
  hideFileInfo = false
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 如果有当前文件，初始化显示
  React.useEffect(() => {
    if (currentFile && !uploadedFile) {
      const fileName = currentFile.split('/').pop() || 'unknown'
      setUploadedFile({
        url: currentFile,
        name: fileName,
        size: 0,
        type: ''
      })
    }
  }, [currentFile, uploadedFile])

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError(null)

    // 验证文件大小
    if (file.size > maxSize * 1024 * 1024) {
      setError(`文件大小不能超过 ${maxSize}MB`)
      return
    }

    // 验证文件类型
    if (accept && !accept.split(',').some(type => file.type.match(type.trim()))) {
      setError('不支持的文件类型')
      return
    }

    await uploadFile(file)
  }

  const uploadFile = async (file: File) => {
    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('directory', directory)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('上传失败')
      }

      const result = await response.json()

      if (result.success) {
        const uploadedFileInfo: UploadedFile = {
          url: result.data.fileUrl,
          name: result.data.originalName,
          size: result.data.size,
          type: result.data.type
        }

        setUploadedFile(uploadedFileInfo)
        onFileUploaded(uploadedFileInfo.url, uploadedFileInfo.name)
      } else {
        throw new Error(result.error || '上传失败')
      }
    } catch (error) {
      console.error('文件上传失败:', error)
      setError(error instanceof Error ? error.message : '上传失败')
    } finally {
      setUploading(false)
    }
  }

  const removeFile = () => {
    setUploadedFile(null)
    setError(null)
    onFileUploaded('', '')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <Image className="h-4 w-4" />
    } else if (type.includes('text') || type.includes('document')) {
      return <FileText className="h-4 w-4" />
    } else {
      return <File className="h-4 w-4" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '未知大小'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {!uploadedFile || (variant === 'compact' && hideFileInfo) ? (
        variant === 'compact' ? (
          // 紧凑样式 - 用于头像上传
          <button
            type="button"
            className={`
              flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700
              hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            onClick={() => !uploading && fileInputRef.current?.click()}
            disabled={uploading}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept={accept}
              onChange={handleFileSelect}
              disabled={uploading}
            />

            <Upload className="h-4 w-4" />

            {uploading ? (
              <span>正在上传...</span>
            ) : (
              <span>{placeholder}</span>
            )}
          </button>
        ) : (
          // 默认样式 - 用于其他文件上传
          <div
            className={`
              border-2 border-dashed border-gray-300 rounded-lg p-4 md:p-6 text-center cursor-pointer
              hover:border-blue-400 hover:bg-blue-50 transition-colors
              ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            onClick={() => !uploading && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept={accept}
              onChange={handleFileSelect}
              disabled={uploading}
            />

            <Upload className="h-6 w-6 md:h-8 md:w-8 text-gray-400 mx-auto mb-2" />

            {uploading ? (
              <p className="text-xs md:text-sm text-gray-600">正在上传...</p>
            ) : (
              <>
                <p className="text-xs md:text-sm text-gray-600 mb-1">{placeholder}</p>
                <p className="text-[10px] md:text-xs text-gray-400">
                  {accept && `支持格式: ${accept}`}
                  {maxSize && ` • 最大 ${maxSize}MB`}
                </p>
              </>
            )}
          </div>
        )
      ) : (
        <div className="flex items-center justify-between p-2 md:p-3 bg-gray-50 rounded-lg border">
          <div className="flex items-center space-x-3">
            {getFileIcon(uploadedFile.type)}
            <div>
              <p className="text-sm font-medium text-gray-900">{uploadedFile.name}</p>
              <p className="text-xs text-gray-500">{formatFileSize(uploadedFile.size)}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {uploadedFile.url && (
              <a
                href={uploadedFile.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                预览
              </a>
            )}
            <button
              onClick={removeFile}
              className="text-gray-400 hover:text-red-500 transition-colors"
              title="删除文件"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
