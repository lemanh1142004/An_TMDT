import React, { useState } from 'react';
import { Server, Database, Cpu, Globe, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { checkHealth } from '../services/api';
import type { HealthCheckResponse } from '../types';

export const HomePage: React.FC = () => {
  const [health, setHealth] = useState<HealthCheckResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleTestConnection = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await checkHealth();
      setHealth(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Không thể kết nối tới Gateway / Backend. Vui lòng kiểm tra các dịch vụ đang chạy.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-8 sm:p-12 shadow-xl">
        <div className="max-w-3xl">
          <span className="inline-block px-3 py-1 rounded-md bg-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-4 border border-indigo-500/30">
            Khởi tạo Nền tảng Thành công
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Fashion Store E-Commerce
          </h1>
          <p className="mt-4 text-slate-300 text-base sm:text-lg leading-relaxed">
            Hệ thống kiến trúc thương mại điện tử thời trang hiện đại với Spring Cloud Gateway,
            Spring Boot 3 Modular Monolith, React Vite Frontend và Docker Infrastructure (PostgreSQL 16 + Redis 7).
          </p>
        </div>
      </div>

      {/* Architecture Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Frontend Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 mb-4">
            <Globe className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-slate-900 text-lg">Frontend Client</h3>
          <p className="text-slate-500 text-sm mt-1">React + Vite + TypeScript + Tailwind</p>
          <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
            <span className="text-slate-500">Port</span>
            <span className="font-mono font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">5173</span>
          </div>
        </div>

        {/* Gateway Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 mb-4">
            <Server className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-slate-900 text-lg">API Gateway</h3>
          <p className="text-slate-500 text-sm mt-1">Spring Cloud Gateway (Reactive)</p>
          <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
            <span className="text-slate-500">Port</span>
            <span className="font-mono font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">8081</span>
          </div>
        </div>

        {/* Backend Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-slate-900 text-lg">Backend API</h3>
          <p className="text-slate-500 text-sm mt-1">Spring Boot 3 Modular Monolith</p>
          <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
            <span className="text-slate-500">Port</span>
            <span className="font-mono font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">8080</span>
          </div>
        </div>

        {/* Infrastructure Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 mb-4">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-slate-900 text-lg">Infrastructure</h3>
          <p className="text-slate-500 text-sm mt-1">PostgreSQL 16 & Redis 7 (Docker)</p>
          <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
            <span className="text-slate-500">Ports</span>
            <span className="font-mono font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">5432 / 6379</span>
          </div>
        </div>
      </div>

      {/* Live Integration Test Box */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Kiểm tra kết nối Frontend → Gateway → Backend</h2>
            <p className="text-sm text-slate-500">
              Gửi request từ React tới Gateway (<code className="bg-slate-100 px-1 py-0.5 rounded text-xs">http://localhost:8081/api/health</code>), sau đó định tuyến tới Backend.
            </p>
          </div>
          <button
            onClick={handleTestConnection}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Đang kiểm tra...' : 'Test Connection'}
          </button>
        </div>

        {health && (
          <div className="mt-4 p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Kết nối thành công qua Gateway!</p>
              <pre className="mt-1 font-mono text-xs bg-white/70 p-2 rounded border border-emerald-200 overflow-x-auto">
                {JSON.stringify(health, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Chưa phát hiện phản hồi từ Gateway:</p>
              <p className="text-xs text-amber-700 mt-1">{error}</p>
              <p className="text-xs text-slate-500 mt-2">
                (Gợi ý: Hãy khởi chạy Gateway trên port 8081 và Backend trên port 8080 để kiểm tra kết nối thực tế).
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
