'use client'

import { useState } from 'react'
import CitySelector from '@/components/ui/CitySelector'

export default function TestCityPage() {
  const [selectedCity, setSelectedCity] = useState('')
  const [isCitySelectorOpen, setIsCitySelectorOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">城市选择器测试</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              现居城市
            </label>
            <div className="relative">
              <input
                type="text"
                value={selectedCity}
                onClick={() => setIsCitySelectorOpen(true)}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer bg-white"
                placeholder="请选择现居城市"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {selectedCity && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800">
                <strong>选择的城市：</strong> {selectedCity}
              </p>
            </div>
          )}

          <button
            onClick={() => setSelectedCity('')}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            清空选择
          </button>
        </div>

        <CitySelector
          value={selectedCity}
          onChange={(city) => setSelectedCity(city)}
          onClose={() => setIsCitySelectorOpen(false)}
          isOpen={isCitySelectorOpen}
        />
      </div>
    </div>
  )
}
