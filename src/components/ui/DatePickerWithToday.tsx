'use client'

import React from 'react'

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
  const isToday = value === null

  // 处理日期输入框变化
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    if (newValue) {
      onChange(newValue)
    } else {
      // 如果清空了日期，保持为空字符串而不是 null
      onChange('')
    }
  }

  // 处理"至今"按钮点击 - 作为切换开关
  const handleTodayClick = () => {
    if (isToday) {
      // 如果当前是"至今"模式，切换回日期输入模式
      onChange('')
    } else {
      // 如果当前不是"至今"模式，切换为"至今"
      onChange(null)
    }
  }

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* 日期输入框和"至今"按钮的容器 */}
      <div className="flex items-center gap-2">
        {/* 条件渲染：至今模式显示文本框，否则显示日期输入框 */}
        {isToday ? (
          /* 至今模式：显示空的置灰文本框 */
          <input
            type="text"
            value=""
            readOnly
            disabled
            className={`
              flex-1 px-3 py-2 border border-gray-300 rounded-md
              bg-gray-100 cursor-not-allowed
              ${error ? 'border-red-500' : ''}
              ${className}
            `}
          />
        ) : (
          /* 日期模式：显示原生日期输入框 */
          <input
            type="date"
            value={value || ''}
            onChange={handleDateChange}
            disabled={disabled}
            className={`
              flex-1 px-3 py-2 border border-gray-300 rounded-md
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
              ${error ? 'border-red-500' : ''}
              ${className}
            `}
          />
        )}

        {/* "至今"按钮 - 切换开关 */}
        <button
          type="button"
          onClick={handleTodayClick}
          disabled={disabled}
          className={`
            px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${isToday
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }
          `}
        >
          至今
        </button>
      </div>

      {/* 错误信息 */}
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  )
}
