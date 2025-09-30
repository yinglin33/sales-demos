import React, { useState } from "react"
import "./App.css"
import CustomQuoteDemo from "./components/CustomQuoteDemo"
import PhotoQuoteDemo from "./components/PhotoQuoteDemo"

type TabType = "custom" | "photo"

function App(): JSX.Element {
    const [activeTab, setActiveTab] = useState<TabType>("custom")

    return (
        <div className="App">
            <header className="header">
                <h1>Diploy Beta</h1>
                <p>Modern Sales Platform</p>
            </header>

            <div className="tabs">
                <button
                    className={`tab ${activeTab === "custom" ? "active" : ""}`}
                    onClick={() => setActiveTab("custom")}
                >
                    Custom Quote Builder
                </button>
                <button
                    className={`tab ${activeTab === "photo" ? "active" : ""}`}
                    onClick={() => setActiveTab("photo")}
                >
                    Photo Quote
                </button>
            </div>

            {activeTab === "custom" && <CustomQuoteDemo />}
            {activeTab === "photo" && <PhotoQuoteDemo />}
        </div>
    )
}

export default App
