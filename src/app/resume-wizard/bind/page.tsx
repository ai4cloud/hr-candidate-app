'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function BindForm() {
    const [phone, setPhone] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()
    const searchParams = useSearchParams()
    const openid = searchParams.get('openid')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        if (!openid) {
            setError('缺少微信授权信息，请重新从微信菜单进入')
            setLoading(false)
            return
        }

        try {
            const response = await fetch('/api/auth/bind', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ phone, openid }),
            })

            const data = await response.json()

            if (response.ok) {
                // 绑定成功，保存用户信息
                sessionStorage.setItem('personId', data.personId)
                sessionStorage.setItem('recordStatus', data.recordStatus)

                // 跳转到填写页面
                router.push(`/resume-wizard/${data.token}/form`)
            } else {
                setError(data.message || '绑定失败')
            }
        } catch (error) {
            console.error('绑定请求失败:', error)
            setError('网络连接异常，请检查网络连接后重试。')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    绑定手机号
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    这是您首次通过微信访问，请验证手机号以完成绑定
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                手机号码 *
                            </label>
                            <div className="mt-1">
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    required
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="请输入手机号码"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="rounded-md bg-red-50 p-4">
                                <div className="text-sm text-red-700">{error}</div>
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? '验证并绑定' : '验证并绑定'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="text-center text-xs text-gray-500">
                            绑定后，下次可直接通过微信菜单进入填写
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function BindPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <BindForm />
        </Suspense>
    )
}
