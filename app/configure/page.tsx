'use client'

import React, { useState } from "react"
import CustomQuoteDemo from "../CustomQuoteDemo"
import PhotoQuoteDemo from "../PhotoQuoteDemo"

type TabType = "custom" | "photo"

export default function DemosPage() {
    const [activeTab, setActiveTab] = useState<TabType>("custom")

    return (
        <div className="min-h-screen p-6 sm:p-8">
            <header className="text-center pt-8 pb-8 animate-fade-in-up">
                <div className="inline-block mb-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-sky-500 rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                        <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                </div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-500 bg-clip-text text-transparent mb-3">
                    Diploy Beta
                </h1>
                <p className="text-lg text-slate-600 font-medium">Modern AI-Powered Sales Platform</p>
            </header>

            <div className="flex justify-center gap-4 mb-8 animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
                <button
                    className={`px-8 py-3.5 text-base font-semibold rounded-2xl transition-all duration-300 transform ${
                        activeTab === "custom"
                            ? "bg-gradient-to-r from-blue-500 to-sky-500 text-white shadow-xl shadow-blue-500/30 scale-105"
                            : "bg-white/80 backdrop-blur-sm text-slate-700 shadow-lg hover:shadow-xl hover:-translate-y-1 hover:bg-white"
                    }`}
                    onClick={() => setActiveTab("custom")}
                >
                    <span className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Custom Quote Builder
                    </span>
                </button>
                <button
                    className={`px-8 py-3.5 text-base font-semibold rounded-2xl transition-all duration-300 transform ${
                        activeTab === "photo"
                            ? "bg-gradient-to-r from-blue-500 to-sky-500 text-white shadow-xl shadow-blue-500/30 scale-105"
                            : "bg-white/80 backdrop-blur-sm text-slate-700 shadow-lg hover:shadow-xl hover:-translate-y-1 hover:bg-white"
                    }`}
                    onClick={() => setActiveTab("photo")}
                >
                    <span className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Photo Quote
                    </span>
                </button>
            </div>

            <div className="animate-fade-in-up" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
                {activeTab === "custom" && <CustomQuoteDemo />}
                {activeTab === "photo" && <PhotoQuoteDemo />}
            </div>
        </div>
    )
}


