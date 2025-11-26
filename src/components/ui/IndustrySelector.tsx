'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Search, ChevronRight } from 'lucide-react'

// 行业数据类型
interface Industry {
  id: number
  code: string
  name: string
  parentId: number | null
  level: number
  enabled: boolean
  displayOrder: number
  children?: Industry[]
}

interface IndustrySelectorProps {
  value?: string
  onChange: (industry: string) => void
  onClose: () => void
  isOpen: boolean
}

export default function IndustrySelector({ value, onChange, onClose, isOpen }: IndustrySelectorProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [industries, setIndustries] = useState<Industry[]>([])
  const [selectedFirstLevel, setSelectedFirstLevel] = useState<number | null>(null)
  const [filteredIndustries, setFilteredIndustries] = useState<Industry[]>([])
  const [loading, setLoading] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  // 获取行业数据
  useEffect(() => {
    if (isOpen && industries.length === 0) {
      fetchIndustries()
    }
  }, [isOpen])

  const fetchIndustries = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/industry')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setIndustries(data.data)
        }
      }
    } catch (error) {
      console.error('获取行业数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 搜索行业
  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = industries.filter(industry =>
        industry.name.includes(searchTerm) && industry.enabled
      )
      setFilteredIndustries(filtered)
    } else {
      setFilteredIndustries([])
    }
  }, [searchTerm, industries])

  // 重置状态当选择器打开时
  useEffect(() => {
    if (isOpen) {
      setSelectedFirstLevel(null)
      setSearchTerm('')
    }
  }, [isOpen])

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  // 获取一级行业
  const getFirstLevelIndustries = () => {
    return industries.filter(industry => industry.level === 1 && industry.enabled)
      .sort((a, b) => a.displayOrder - b.displayOrder)
  }

  // 获取二级行业
  const getSecondLevelIndustries = (parentId: number) => {
    return industries.filter(industry => industry.parentId === parentId && industry.enabled)
      .sort((a, b) => a.displayOrder - b.displayOrder)
  }

  const handleIndustrySelect = (industryName: string) => {
    onChange(industryName)
    onClose()
  }

  const handleSearchResultSelect = (industry: Industry) => {
    onChange(industry.name)
    onClose()
  }

  if (!isOpen) return null

  const firstLevelIndustries = getFirstLevelIndustries()
  const selectedIndustry = selectedFirstLevel ?
    industries.find(i => i.id === selectedFirstLevel) : null
  const secondLevelIndustries = selectedFirstLevel ?
    getSecondLevelIndustries(selectedFirstLevel) : []

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-white rounded-lg w-full max-w-4xl h-[80vh] md:h-[600px] flex flex-col m-4 md:m-0">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-medium">请选择行业</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 搜索框 */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="搜索行业"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* 左侧一级行业 */}
          <div className="w-24 md:w-64 border-r bg-gray-50 overflow-y-auto flex-shrink-0">
            <div className="p-2">
              <div className="text-sm font-medium text-gray-700 mb-2">一级行业</div>
              {loading ? (
                <div className="text-center py-4 text-gray-500">加载中...</div>
              ) : (
                firstLevelIndustries.map((industry) => (
                  <button
                    key={industry.id}
                    onClick={() => setSelectedFirstLevel(industry.id)}
                    className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 flex items-center justify-between ${selectedFirstLevel === industry.id ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                      }`}
                  >
                    <span>{industry.name}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ))
              )}
            </div>
          </div>

          {/* 右侧内容 */}
          <div className="flex-1 overflow-y-auto">
            {searchTerm.trim() ? (
              /* 搜索结果 */
              <div className="p-4">
                <div className="text-sm font-medium text-gray-700 mb-3">搜索结果</div>
                <div className="space-y-1">
                  {filteredIndustries.map((industry) => (
                    <button
                      key={industry.id}
                      onClick={() => handleSearchResultSelect(industry)}
                      className="w-full text-left px-3 py-2 text-sm border border-gray-200 rounded hover:border-blue-500 hover:text-blue-600"
                    >
                      <div className="font-medium">{industry.name}</div>
                      <div className="text-xs text-gray-400">
                        {industry.level === 1 ? '一级行业' : '二级行业'}
                      </div>
                    </button>
                  ))}
                </div>
                {filteredIndustries.length === 0 && (
                  <div className="text-center text-gray-500 py-8">未找到相关行业</div>
                )}
              </div>
            ) : selectedIndustry ? (
              /* 二级行业 */
              <div className="p-4">
                <div className="text-lg font-medium text-gray-900 mb-4">{selectedIndustry.name}</div>
                <div className="space-y-1">
                  {/* 可以选择一级行业本身 */}
                  <button
                    onClick={() => handleIndustrySelect(selectedIndustry.name)}
                    className="w-full text-left px-3 py-2 text-sm border border-orange-300 rounded hover:border-orange-500 text-orange-600 bg-orange-50"
                  >
                    {selectedIndustry.name}（通用）
                  </button>

                  {/* 二级行业选项 */}
                  {secondLevelIndustries.map((industry) => (
                    <button
                      key={industry.id}
                      onClick={() => handleIndustrySelect(industry.name)}
                      className="w-full text-left px-3 py-2 text-sm border border-gray-200 rounded hover:border-blue-500 hover:text-blue-600"
                    >
                      {industry.name}
                    </button>
                  ))}

                  {secondLevelIndustries.length === 0 && (
                    <div className="text-center text-gray-500 py-4">该行业暂无细分类别</div>
                  )}
                </div>
              </div>
            ) : (
              /* 默认提示 */
              <div className="p-4 text-center text-gray-500">
                <div className="py-8">
                  <div className="text-lg mb-2">请选择行业分类</div>
                  <div className="text-sm">从左侧选择一级行业，然后选择具体的细分行业</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
