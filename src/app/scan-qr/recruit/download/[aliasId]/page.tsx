'use client';

import { I18n } from '@/i18n';

interface RecruitPageProps {
  params: Promise<{ aliasId: string }>;
}

const APP_STORE_URL = 'https://apps.apple.com/vn/app/izion24agent/id6476207814';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.izion24agent';

export default function RecruitLandingPage(_props: RecruitPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          {/* Header */}
          <div className="mb-8">
            <div className="w-20 h-20 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {I18n.scanQrPage.recruitTitle}
            </h1>
            <p className="text-sm text-gray-500">
              {I18n.scanQrPage.recruitDesc}
            </p>
          </div>

          {/* Features list */}
          <div className="space-y-3 mb-8 text-left">
            {[
              { icon: '📱', text: 'Quản lý hợp đồng dễ dàng' },
              { icon: '📊', text: 'Theo dõi hiệu suất real-time' },
              { icon: '🎯', text: 'Công cụ marketing chuyên nghiệp' },
              { icon: '💰', text: 'Thu nhập hấp dẫn' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm text-gray-700">{item.text}</span>
              </div>
            ))}
          </div>

          {/* Download buttons */}
          <div className="space-y-3">
            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full bg-black text-white py-3.5 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              <div className="text-left">
                <div className="text-[10px] opacity-80">Download on the</div>
                <div className="text-base font-semibold -mt-0.5">App Store</div>
              </div>
            </a>

            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full bg-black text-white py-3.5 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.807 1.626a1 1 0 010 1.732l-2.807 1.626L15.206 12l2.492-2.492zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/>
              </svg>
              <div className="text-left">
                <div className="text-[10px] opacity-80">GET IT ON</div>
                <div className="text-base font-semibold -mt-0.5">Google Play</div>
              </div>
            </a>
          </div>

          {/* Contact support */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <a
              href="https://zalo.me"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-500 hover:text-blue-600 font-medium"
            >
              {I18n.scanQrPage.contactSupport}
            </a>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-4">
          Powered by Marketing Kit
        </p>
      </div>
    </div>
  );
}
