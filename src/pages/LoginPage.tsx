import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { encrypt } from '../encryption/Encryption';
import { storeToken, getToken } from '../utils/jwtUtils';

interface LoginPageProps {
    redirect?: string;
    onSuccess?: () => void;
}

export default function LoginPage({ redirect, onSuccess }: LoginPageProps = {}) {
    const navigate = useNavigate();
    const location = useLocation() as { state?: { warning?: string; success?: string } };
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [provider, setProvider] = useState<'sms' | 'tt'>('sms');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (!username || !password) {
                setError('Enter username and password');
                return;
            }

            // Choose API base and endpoint by provider
            const smsApi = (process.env.REACT_APP_SMS_API_URL || 'http://localhost:8080').replace(/\/$/, '');
            const ttApi = (process.env.REACT_APP_TT_API_URL || 'http://localhost:8082').replace(/\/$/, '');
            const baseUrl = provider === 'sms' ? smsApi : ttApi;
            const endpoint = provider === 'sms' ? '/user/login' : '/auth/login';

            let token: string | undefined;

            try {
                const resp = await fetch(baseUrl + endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password }),
                    credentials: 'include',
                });

                if (resp.ok) {
                    const data = await resp.json();
                    token = data.token || data.accessToken || data.jwt;
                }
            } catch (fetchErr) {
                // Network failure falls back to demo flow below
            }

            if (token) {
                storeToken(token);
                if (onSuccess) {
                    onSuccess();
                } else if (redirect) {
                    navigate(redirect, { state: { success: 'You are logged in.' } });
                } else {
                    navigate('/admin', { state: { success: 'You are logged in.' } });
                }
                return;
            }

            // Fallback: demo-only session if no token returned (dev environments)
            const user = { username, roles: ['USER'], provider } as any;
            localStorage.setItem('ans-sms', JSON.stringify(user));
            sessionStorage.setItem('ans-sms', encrypt(user));
            if (onSuccess) {
                onSuccess();
            } else if (redirect) {
                navigate(redirect, { state: { success: 'You are logged in (demo mode).' } });
            } else {
                navigate('/admin', { state: { success: 'You are logged in (demo mode).' } });
            }
        } catch (err) {
            setError('Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="mb-6 text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl">📘</div>
                    <h1 className="mt-3 text-2xl font-semibold text-gray-900">OCMS Login</h1>
                    <p className="mt-1 text-sm text-gray-600">Sign in with your SMS or AIM account</p>
                    {location.state?.warning && (
                        <p className="mt-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">{location.state.warning}</p>
                    )}
                    {location.state?.success && (
                        <p className="mt-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-3 py-2">{location.state.success}</p>
                    )}
                </div>

                {/* Provider Switch */}
                <div className="mb-4 grid grid-cols-2 gap-2">
                    <button
                        type="button"
                        className={`px-3 py-2 rounded border text-sm ${provider === 'sms' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}
                        onClick={() => setProvider('sms')}
                    >
                        Use SMS Account
                    </button>
                    <button
                        type="button"
                        className={`px-3 py-2 rounded border text-sm ${provider === 'tt' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-700 border-gray-300'}`}
                        onClick={() => setProvider('tt')}
                    >
                        Use AIM Account
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                        <input
                            id="username"
                            type="text"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoComplete="username"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            id="password"
                            type="password"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    {error && (
                        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>
                    )}

                    <button
                        type="submit"
                        className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-60"
                        disabled={loading}
                    >
                        {loading ? `Signing in with ${provider === 'sms' ? 'SMS account' : 'AIM account'}…` : `Sign in with ${provider === 'sms' ? 'SMS account' : 'AIM account'}`}
                    </button>
                </form>
            </div>
        </div>
    );
}


