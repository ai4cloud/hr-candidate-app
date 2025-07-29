'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Calendar } from 'lucide-react'

interface DatePickerWithTodayProps {
  value: string | null
  onChange: (value: string | null) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  label?: string | React.ReactNode
  required?: boolean
  error?: string
}

export default function DatePickerWithToday({
  value,
  onChange,
  placeholder = "请选择日期",
  className = "",
  disabled = false,
  label,
  required = false,
  error
}: DatePickerWithTodayProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const containerRef = useRef<HTMLDivElement>(null)

  // 初始化选中日期
  useEffect(() => {
    if (value && value !== '') {
      setSelectedDate(new Date(value))
      setCurrentMonth(new Date(value))
    } else {
      setSelectedDate(null)
    }
  }, [value])

  // 点击外部关闭
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // 格式化显示值
  const getDisplayValue = () => {
    if (value === null) return '至今'
    if (!value || value === '') return ''
    
    const date = new Date(value)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '-')
  }

  // 处理日期选择
  const handleDateSelect = (date: Date) => {
    const formattedDate = date.toISOString().split('T')[0]
    onChange(formattedDate)
    setIsOpen(false)
  }

  // 处理"至今"按钮点击
  const handleTodayClick = () => {
    onChange(null)
    setIsOpen(false)
  }

  // 生成日历
  const generateCalendar = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    
    // 获取当月第一天和最后一天
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    // 获取第一天是星期几（0=周日，1=周一...）
    const firstDayOfWeek = firstDay.getDay()
    
    // 生成日期数组
    const days = []
    
    // 添加上个月的日期（灰色显示）
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i)
      days.push({ date, isCurrentMonth: false })
    }
    
    // 添加当月的日期
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day)
      days.push({ date, isCurrentMonth: true })
    }
    
    // 添加下个月的日期补齐6行
    const remainingDays = 42 - days.length
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day)
      days.push({ date, isCurrentMonth: false })
    }
    
    return days
  }

  // 上一个月
  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  // 下一个月
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const days = generateCalendar()
  const isToday = value === null

  return (
    <div className="relative" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      {/* 输入框 */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`
          w-full px-3 py-2 border border-gray-300 rounded-md cursor-pointer
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-gray-400'}
          ${isToday ? 'bg-blue-50 border-blue-300 text-blue-700' : ''}
          ${error ? 'border-red-500' : ''}
          ${className}
        `}
      >
        <div className="flex items-center justify-between">
          <span className={`${!getDisplayValue() ? 'text-gray-400' : ''}`}>
            {getDisplayValue() || placeholder}
          </span>
          <Calendar className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* 错误信息 */}
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}

      {/* 日期选择器弹出框 */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 min-w-[280px]">
          {/* 月份导航 */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={previousMonth}
              className="p-1 hover:bg-gray-100 rounded"
            >
              ‹
            </button>
            <h3 className="font-medium">
              {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月
            </h3>
            <button
              onClick={nextMonth}
              className="p-1 hover:bg-gray-100 rounded"
            >
              ›
            </button>
          </div>

          {/* 星期标题 */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['日', '一', '二', '三', '四', '五', '六'].map(day => (
              <div key={day} className="text-center text-sm text-gray-500 py-1">
                {day}
              </div>
            ))}
          </div>

          {/* 日期网格 */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {days.map((dayInfo, index) => {
              const isSelected = selectedDate && 
                dayInfo.date.toDateString() === selectedDate.toDateString()
              
              return (
                <button
                  key={index}
                  onClick={() => handleDateSelect(dayInfo.date)}
                  className={`
                    p-2 text-sm rounded hover:bg-blue-100
                    ${!dayInfo.isCurrentMonth ? 'text-gray-300' : 'text-gray-900'}
                    ${isSelected ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
                  `}
                >
                  {dayInfo.date.getDate()}
                </button>
              )
            })}
          </div>

          {/* 至今按钮 */}
          <div className="border-t pt-3">
            <button
              onClick={handleTodayClick}
              className={`
                w-full py-2 px-4 rounded-md text-sm font-medium transition-colors
                ${isToday 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700'
                }
              `}
            >
              至今
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
