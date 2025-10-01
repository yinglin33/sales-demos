'use client'

import React, { useState } from 'react';

interface ImageData {
  id: string;
  url: string;
  name: string;
}

interface DetectedItem {
  name: string;
  quantity: number;
  pricePerUnit: number;
  total: number;
}

type Step = 'upload' | 'analyzing' | 'quote' | 'schedule' | 'payment' | 'success';

function PhotoQuoteDemo(): JSX.Element {
  const [images, setImages] = useState<ImageData[]>([]);
  const [step, setStep] = useState<Step>('upload');
  const [dragOver, setDragOver] = useState<boolean>(false);
  const [detectedItems, setDetectedItems] = useState<DetectedItem[]>([]);
  const [totalQuote, setTotalQuote] = useState<number>(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
  };

  const processFiles = (files: File[]): void => {
    files.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          const target = e.target;
          if (target && target.result) {
            setImages((prev) => [
              ...prev,
              {
                id: Math.random().toString(36).substr(2, 9),
                url: target.result as string,
                name: file.name,
              },
            ]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (): void => {
    setDragOver(false);
  };

  const removeImage = (id: string): void => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const generateDetectedItems = (): DetectedItem[] => {
    const possibleItems = [
      { name: 'Bed Frame', basePrice: 120, maxQty: 4 },
      { name: 'Mattress', basePrice: 100, maxQty: 4 },
      { name: 'Dresser', basePrice: 90, maxQty: 3 },
      { name: 'Desk', basePrice: 80, maxQty: 2 },
      { name: 'Office Chair', basePrice: 40, maxQty: 4 },
      { name: 'Dining Table', basePrice: 150, maxQty: 1 },
      { name: 'Dining Chair', basePrice: 25, maxQty: 8 },
      { name: 'Sofa', basePrice: 180, maxQty: 2 },
      { name: 'Coffee Table', basePrice: 60, maxQty: 2 },
      { name: 'Bookshelf', basePrice: 70, maxQty: 3 },
      { name: 'TV Stand', basePrice: 65, maxQty: 1 },
      { name: 'Nightstand', basePrice: 45, maxQty: 4 },
      { name: 'Wardrobe', basePrice: 140, maxQty: 2 },
      { name: 'Storage Box', basePrice: 15, maxQty: 15 },
    ];

    const itemsPerPhoto = 4 + Math.floor(Math.random() * 5);
    const numItems = Math.min(itemsPerPhoto * images.length, 12);

    const selected = new Map<string, DetectedItem>();

    for (let i = 0; i < numItems; i++) {
      const item = possibleItems[Math.floor(Math.random() * possibleItems.length)];
      const existing = selected.get(item.name);

      if (existing) {
        if (existing.quantity < item.maxQty) {
          existing.quantity++;
          existing.total = existing.quantity * existing.pricePerUnit;
        }
      } else {
        const variance = 0.85 + Math.random() * 0.3;
        const pricePerUnit = Math.round(item.basePrice * variance);
        selected.set(item.name, {
          name: item.name,
          quantity: 1,
          pricePerUnit,
          total: pricePerUnit,
        });
      }
    }

    return Array.from(selected.values());
  };

  const analyzePhotos = (): void => {
    setStep('analyzing');
    setTimeout(() => {
      const items = generateDetectedItems();
      const baseFee = 150 + Math.round(Math.random() * 100);
      const itemsTotal = items.reduce((sum, item) => sum + item.total, 0);
      const total = baseFee + itemsTotal;

      items.push({
        name: 'Base Moving Fee',
        quantity: 1,
        pricePerUnit: baseFee,
        total: baseFee,
      });

      setDetectedItems(items);
      setTotalQuote(total);
      setStep('quote');
    }, 2500);
  };

  const scheduleService = (): void => {
    setStep('schedule');
  };

  const proceedToPayment = (): void => {
    setStep('payment');
  };

  const completePayment = (): void => {
    setStep('success');
  };

  const resetDemo = (): void => {
    setImages([]);
    setDetectedItems([]);
    setTotalQuote(0);
    setStep('upload');
  };

  if (step === 'success') {
    return (
      <div className="max-w-3xl mx-auto w-full bg-white/80 backdrop-blur-xl rounded-3xl p-10 shadow-2xl shadow-blue-500/10 border border-blue-100/50 animate-scale-in">
        <div className="text-center py-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 animate-pulse">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent mb-4">Move Scheduled!</h2>
          <p className="text-base text-slate-600 mb-2">Your move has been scheduled and payment processed successfully.</p>
          <p className="text-base text-slate-600 mb-8">Our team will arrive on your scheduled date ready to move all detected items.</p>
          <button className="w-full px-8 py-4 text-lg font-semibold rounded-2xl bg-gradient-to-r from-blue-500 to-sky-500 text-white shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 hover:-translate-y-1 transition-all duration-300" onClick={resetDemo}>
            Create Another Quote
          </button>
        </div>
      </div>
    );
  }

  if (step === 'payment') {
    return (
      <div className="max-w-3xl mx-auto w-full bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-blue-500/10 border border-blue-100/50 animate-scale-in">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent mb-6 text-center">Payment Details</h2>
        <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-2xl p-6 my-6 border border-blue-200/50 max-h-80 overflow-y-auto shadow-inner">
          <h3 className="text-lg font-bold text-blue-600 mb-4">Moving Quote Summary</h3>
          {detectedItems.slice(0, 5).map((item, idx) => (
            <div key={idx} className="flex justify-between py-3 border-b border-blue-200/50 text-base">
              <span className="text-slate-700">{item.name} {item.quantity > 1 ? `x${item.quantity}` : ''}</span>
              <span className="font-semibold text-blue-600">${item.total}</span>
            </div>
          ))}
          {detectedItems.length > 5 && (
            <div className="flex justify-between py-3 text-base italic text-slate-500">
              <span>+ {detectedItems.length - 5} more items</span>
              <span></span>
            </div>
          )}
          <div className="flex justify-between py-4 pt-5 border-t-2 border-blue-400 font-bold text-lg mt-3">
            <span className="bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">Total Amount</span>
            <span className="bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">${totalQuote}</span>
          </div>
        </div>
        <div className="mt-6 p-5 bg-gradient-to-r from-blue-100/50 to-sky-100/50 rounded-2xl border border-blue-200/50">
          <p className="text-center text-slate-600 text-base flex items-center justify-center gap-2">
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Payment processing demo
          </p>
        </div>
        <button className="w-full px-8 py-4 text-lg font-semibold rounded-2xl bg-gradient-to-r from-blue-500 to-sky-500 text-white shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 hover:-translate-y-1 transition-all duration-300 mt-6" onClick={completePayment}>
          Process Payment (Demo)
        </button>
      </div>
    );
  }

  if (step === 'schedule') {
    return (
      <div className="max-w-3xl mx-auto w-full bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-blue-500/10 border border-blue-100/50 animate-scale-in">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent mb-6 text-center">Schedule Your Service</h2>
        <div className="mb-5">
          <label className="block text-base font-semibold text-slate-700 mb-3">Preferred Date</label>
          <input
            type="date"
            className="w-full px-4 py-4 rounded-xl border-2 border-blue-200 text-base focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all bg-white/50"
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
        <div className="mb-5">
          <label className="block text-base font-semibold text-slate-700 mb-3">Preferred Time</label>
          <select className="w-full px-4 py-4 rounded-xl border-2 border-blue-200 text-base focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all bg-white/50">
            <option>8:00 AM - 10:00 AM</option>
            <option>10:00 AM - 12:00 PM</option>
            <option>12:00 PM - 2:00 PM</option>
            <option>2:00 PM - 4:00 PM</option>
            <option>4:00 PM - 6:00 PM</option>
          </select>
        </div>
        <div className="mb-5">
          <label className="block text-base font-semibold text-slate-700 mb-3">Contact Phone</label>
          <input
            type="tel"
            placeholder="(555) 123-4567"
            className="w-full px-4 py-4 rounded-xl border-2 border-blue-200 text-base focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all bg-white/50"
          />
        </div>
        <div className="mb-5">
          <label className="block text-base font-semibold text-slate-700 mb-3">Email Address</label>
          <input
            type="email"
            placeholder="your@email.com"
            className="w-full px-4 py-4 rounded-xl border-2 border-blue-200 text-base focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all bg-white/50"
          />
        </div>
        <button className="w-full px-8 py-4 text-lg font-semibold rounded-2xl bg-gradient-to-r from-blue-500 to-sky-500 text-white shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 hover:-translate-y-1 transition-all duration-300 mt-6" onClick={proceedToPayment}>
          Proceed to Payment
        </button>
      </div>
    );
  }

  if (step === 'analyzing') {
    return (
      <div className="max-w-3xl mx-auto w-full bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-blue-500/10 border border-blue-100/50 animate-scale-in">
        <div className="text-center py-16">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-4 border-transparent border-t-sky-400 rounded-full animate-spin" style={{ animationDuration: '0.8s', animationDirection: 'reverse' }}></div>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent mb-4">
            Analyzing Your Photos...
          </h2>
          <p className="text-lg text-slate-600">
            Our AI is detecting furniture and calculating your moving quote
          </p>
        </div>
      </div>
    );
  }

  if (step === 'quote') {
    return (
      <div className="max-w-3xl mx-auto w-full bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-blue-500/10 border border-blue-100/50 animate-scale-in">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent mb-4 text-center">Your Moving Quote</h2>

        <div className="mb-6">
          <p className="text-slate-600 text-center text-base">
            AI detected {detectedItems.length - 1} item types from {images.length} photo{images.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-2xl p-6 my-6 border border-blue-200/50 max-h-80 overflow-y-auto shadow-inner">
          <h3 className="text-lg font-bold text-blue-600 mb-4">Detected Items</h3>
          {detectedItems.map((item, idx) => (
            <div key={idx} className="flex justify-between py-3 border-b border-blue-200/50 text-base">
              <span className="text-slate-700">{item.name} {item.quantity > 1 ? `x${item.quantity}` : ''}</span>
              <span className="font-semibold text-blue-600">${item.total}</span>
            </div>
          ))}
          <div className="flex justify-between py-4 pt-5 border-t-2 border-blue-400 font-bold text-lg mt-3">
            <span className="bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">Total Moving Cost</span>
            <span className="bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">${totalQuote}</span>
          </div>
        </div>

        <div className="text-center text-slate-600 mt-6 text-base space-y-2">
          <p className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            AI-powered item detection
          </p>
          <p className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Professional moving service
          </p>
        </div>

        <button className="w-full px-8 py-4 text-lg font-semibold rounded-2xl bg-gradient-to-r from-blue-500 to-sky-500 text-white shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 hover:-translate-y-1 transition-all duration-300 mt-6" onClick={scheduleService}>
          Schedule Move
        </button>
        <button
          className="w-full px-8 py-4 mt-4 bg-white/80 border-2 border-blue-400 rounded-2xl text-blue-600 text-lg font-semibold hover:shadow-xl hover:bg-white hover:-translate-y-1 transition-all duration-300"
          onClick={() => setStep('upload')}
        >
          Upload Different Photos
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto w-full bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-blue-500/10 border border-blue-100/50 animate-scale-in">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent mb-6 text-center">Upload Photos of Your Space</h2>

      <div
        className={`border-3 border-dashed rounded-2xl p-12 text-center bg-gradient-to-br from-blue-50 to-sky-50 cursor-pointer transition-all duration-300 mb-6 ${
          dragOver ? 'border-blue-500 bg-blue-100 scale-[1.02] shadow-xl' : 'border-blue-300 hover:border-blue-500 hover:bg-blue-100/80 hover:scale-[1.01] hover:shadow-lg'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <div className="text-6xl mb-4 animate-bounce" style={{ animationDuration: '2s' }}>📸</div>
        <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent mb-2">Drop your photos here</h3>
        <p className="text-slate-600 text-base mb-6">or click to browse</p>
        <p className="text-sm text-slate-500 bg-white/60 backdrop-blur-sm rounded-xl px-4 py-2 inline-block">
          Upload photos of each room for the most accurate quote
        </p>
        <input
          id="file-input"
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {images.length > 0 && (
        <>
          <div className="mt-8 mb-6">
            <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">
              {images.length} Photo{images.length !== 1 ? 's' : ''} Uploaded
            </h3>
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-3 mt-4">
            {images.map((image) => (
              <div key={image.id} className="relative rounded-2xl overflow-hidden shadow-lg aspect-square hover:scale-105 transition-all duration-300 border-2 border-blue-200">
                <img src={image.url} alt={image.name} className="w-full h-full object-cover" />
                <button
                  className="absolute top-2 right-2 w-8 h-8 border-none rounded-full bg-gradient-to-r from-red-500 to-rose-500 text-white hover:scale-125 hover:shadow-xl transition-all duration-300 text-lg flex items-center justify-center font-bold"
                  onClick={() => removeImage(image.id)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      <button
        className="w-full px-8 py-4 text-lg font-semibold rounded-2xl bg-gradient-to-r from-blue-500 to-sky-500 text-white shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 hover:-translate-y-1 transition-all duration-300 mt-8 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-xl disabled:hover:translate-y-0 disabled:from-gray-400 disabled:to-gray-500"
        onClick={analyzePhotos}
        disabled={images.length === 0}
      >
        {images.length === 0 ? 'Upload Photos to Continue' : `Analyze ${images.length} Photo${images.length !== 1 ? 's' : ''} & Get Quote`}
      </button>
    </div>
  );
}

export default PhotoQuoteDemo;
