'use client'

import React, { useState } from 'react';

interface Items {
  bedrooms: number;
  bathrooms: number;
  largeFurniture: number;
  tables: number;
  chairs: number;
}

type Step = 'form' | 'loading' | 'quote' | 'schedule' | 'payment' | 'success';
type ItemKey = keyof Items;

interface QuoteBreakdown {
  [key: string]: number;
}

function CustomQuoteDemo(): JSX.Element {
  const [items, setItems] = useState<Items>({
    bedrooms: 0,
    bathrooms: 0,
    largeFurniture: 0,
    tables: 0,
    chairs: 0,
  });
  const [step, setStep] = useState<Step>('form');
  const [quoteBreakdown, setQuoteBreakdown] = useState<QuoteBreakdown>({});
  const [totalQuote, setTotalQuote] = useState<number>(0);

  const updateCount = (item: ItemKey, delta: number): void => {
    setItems((prev) => ({
      ...prev,
      [item]: Math.max(0, prev[item] + delta),
    }));
  };

  const generateDynamicPrice = (basePrice: number, quantity: number): number => {
    const variance = 0.85 + Math.random() * 0.3;
    const quantityDiscount = quantity > 3 ? 0.95 : 1;
    const complexityFactor = 0.95 + Math.random() * 0.1;
    return Math.round(basePrice * variance * quantityDiscount * complexityFactor * quantity);
  };

  const getQuote = (): void => {
    setStep('loading');
    setTimeout(() => {
      const breakdown: QuoteBreakdown = {};
      let total = 0;

      const basePrices: Items = {
        bedrooms: 150,
        bathrooms: 100,
        largeFurniture: 80,
        tables: 50,
        chairs: 15,
      };

      (Object.keys(items) as ItemKey[]).forEach((item) => {
        if (items[item] > 0) {
          const price = generateDynamicPrice(basePrices[item], items[item]);
          breakdown[item] = price;
          total += price;
        }
      });

      const baseFee = 50;
      const serviceFee = Math.round(baseFee + Math.random() * 30);
      breakdown['serviceFee'] = serviceFee;
      total += serviceFee;

      setQuoteBreakdown(breakdown);
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
    setItems({
      bedrooms: 0,
      bathrooms: 0,
      largeFurniture: 0,
      tables: 0,
      chairs: 0,
    });
    setQuoteBreakdown({});
    setTotalQuote(0);
    setStep('form');
  };

  if (step === 'loading') {
    return (
      <div className="max-w-3xl mx-auto w-full bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-blue-500/10 border border-blue-100/50 animate-scale-in">
        <div className="text-center py-16">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-4 border-transparent border-t-sky-400 rounded-full animate-spin" style={{ animationDuration: '0.8s', animationDirection: 'reverse' }}></div>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent mb-4">
            Preparing Your Quote...
          </h2>
          <p className="text-lg text-slate-600">
            Our AI is analyzing your selections and calculating the best price
          </p>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="max-w-3xl mx-auto w-full bg-white/80 backdrop-blur-xl rounded-3xl p-10 shadow-2xl shadow-blue-500/10 border border-blue-100/50 animate-scale-in">
        <div className="text-center py-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 animate-pulse">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent mb-4">Booking Confirmed!</h2>
          <p className="text-base text-slate-600 mb-2">Your service has been scheduled and payment processed successfully.</p>
          <p className="text-base text-slate-600 mb-8">A confirmation email has been sent to your inbox.</p>
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
          <h3 className="text-lg font-bold text-blue-600 mb-4">Order Summary</h3>
          {Object.keys(quoteBreakdown).map((key) => {
            if (key === 'serviceFee') {
              return (
                <div key={key} className="flex justify-between py-3 border-b border-blue-200/50 text-base">
                  <span className="text-slate-700">Service Fee</span>
                  <span className="font-semibold text-blue-600">${quoteBreakdown[key]}</span>
                </div>
              );
            }
            return (
              <div key={key} className="flex justify-between py-3 border-b border-blue-200/50 text-base">
                <span className="text-slate-700">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str: string) => str.toUpperCase())} x{items[key as ItemKey]}
                </span>
                <span className="font-semibold text-blue-600">${quoteBreakdown[key]}</span>
              </div>
            );
          })}
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
        <button className="w-full px-8 py-4 text-lg font-semibold rounded-2xl bg-gradient-to-r from-blue-500 to-sky-500 text-white shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 hover:-translate-y-1 transition-all duration-300 mt-6" onClick={proceedToPayment}>
          Proceed to Payment
        </button>
      </div>
    );
  }

  if (step === 'quote') {
    return (
      <div className="max-w-3xl mx-auto w-full bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-blue-500/10 border border-blue-100/50 animate-scale-in">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent mb-6 text-center">Your AI-Generated Quote</h2>
        <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-2xl p-6 my-6 border border-blue-200/50 max-h-80 overflow-y-auto shadow-inner">
          <h3 className="text-lg font-bold text-blue-600 mb-4">Quote Breakdown</h3>
          {Object.keys(quoteBreakdown).map((key) => {
            if (key === 'serviceFee') {
              return (
                <div key={key} className="flex justify-between py-3 border-b border-blue-200/50 text-base">
                  <span className="text-slate-700">Service Fee</span>
                  <span className="font-semibold text-blue-600">${quoteBreakdown[key]}</span>
                </div>
              );
            }
            return (
              <div key={key} className="flex justify-between py-3 border-b border-blue-200/50 text-base">
                <span className="text-slate-700">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str: string) => str.toUpperCase())} x{items[key as ItemKey]}
                </span>
                <span className="font-semibold text-blue-600">${quoteBreakdown[key]}</span>
              </div>
            );
          })}
          <div className="flex justify-between py-4 pt-5 border-t-2 border-blue-400 font-bold text-lg mt-3">
            <span className="bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">Total Estimated Cost</span>
            <span className="bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">${totalQuote}</span>
          </div>
        </div>
        <div className="text-center text-slate-600 mt-6 text-base space-y-2">
          <p className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            AI-optimized pricing
          </p>
          <p className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Professional service guaranteed
          </p>
        </div>
        <button className="w-full px-8 py-4 text-lg font-semibold rounded-2xl bg-gradient-to-r from-blue-500 to-sky-500 text-white shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 hover:-translate-y-1 transition-all duration-300 mt-6" onClick={scheduleService}>
          Schedule Service
        </button>
        <button
          className="w-full px-8 py-4 mt-4 bg-white/80 border-2 border-blue-400 rounded-2xl text-blue-600 text-lg font-semibold hover:shadow-xl hover:bg-white hover:-translate-y-1 transition-all duration-300"
          onClick={() => setStep('form')}
        >
          Modify Quote
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto w-full bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-blue-500/10 border border-blue-100/50 animate-scale-in">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent mb-6 text-center">Configure Your Service</h2>

      <div className="mb-4">
        <div className="flex items-center gap-4 px-5 py-4 bg-gradient-to-r from-blue-50 to-sky-50 rounded-xl border border-blue-200/50 hover:shadow-lg transition-all duration-300">
          <span className="flex-1 text-base font-medium text-slate-700">🛏️ Bedrooms</span>
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 border-none rounded-full bg-gradient-to-r from-blue-500 to-sky-500 text-white text-xl font-bold shadow-md hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center" onClick={() => updateCount('bedrooms', -1)}>
              −
            </button>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent min-w-10 text-center">{items.bedrooms}</span>
            <button className="w-10 h-10 border-none rounded-full bg-gradient-to-r from-blue-500 to-sky-500 text-white text-xl font-bold shadow-md hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center" onClick={() => updateCount('bedrooms', 1)}>
              +
            </button>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-4 px-5 py-4 bg-gradient-to-r from-blue-50 to-sky-50 rounded-xl border border-blue-200/50 hover:shadow-lg transition-all duration-300">
          <span className="flex-1 text-base font-medium text-slate-700">🚿 Bathrooms</span>
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 border-none rounded-full bg-gradient-to-r from-blue-500 to-sky-500 text-white text-xl font-bold shadow-md hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center" onClick={() => updateCount('bathrooms', -1)}>
              −
            </button>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent min-w-10 text-center">{items.bathrooms}</span>
            <button className="w-10 h-10 border-none rounded-full bg-gradient-to-r from-blue-500 to-sky-500 text-white text-xl font-bold shadow-md hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center" onClick={() => updateCount('bathrooms', 1)}>
              +
            </button>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-4 px-5 py-4 bg-gradient-to-r from-blue-50 to-sky-50 rounded-xl border border-blue-200/50 hover:shadow-lg transition-all duration-300">
          <span className="flex-1 text-base font-medium text-slate-700">🛋️ Large Furniture</span>
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 border-none rounded-full bg-gradient-to-r from-blue-500 to-sky-500 text-white text-xl font-bold shadow-md hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center" onClick={() => updateCount('largeFurniture', -1)}>
              −
            </button>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent min-w-10 text-center">{items.largeFurniture}</span>
            <button className="w-10 h-10 border-none rounded-full bg-gradient-to-r from-blue-500 to-sky-500 text-white text-xl font-bold shadow-md hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center" onClick={() => updateCount('largeFurniture', 1)}>
              +
            </button>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-4 px-5 py-4 bg-gradient-to-r from-blue-50 to-sky-50 rounded-xl border border-blue-200/50 hover:shadow-lg transition-all duration-300">
          <span className="flex-1 text-base font-medium text-slate-700">🪑 Tables</span>
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 border-none rounded-full bg-gradient-to-r from-blue-500 to-sky-500 text-white text-xl font-bold shadow-md hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center" onClick={() => updateCount('tables', -1)}>
              −
            </button>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent min-w-10 text-center">{items.tables}</span>
            <button className="w-10 h-10 border-none rounded-full bg-gradient-to-r from-blue-500 to-sky-500 text-white text-xl font-bold shadow-md hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center" onClick={() => updateCount('tables', 1)}>
              +
            </button>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-4 px-5 py-4 bg-gradient-to-r from-blue-50 to-sky-50 rounded-xl border border-blue-200/50 hover:shadow-lg transition-all duration-300">
          <span className="flex-1 text-base font-medium text-slate-700">💺 Chairs</span>
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 border-none rounded-full bg-gradient-to-r from-blue-500 to-sky-500 text-white text-xl font-bold shadow-md hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center" onClick={() => updateCount('chairs', -1)}>
              −
            </button>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent min-w-10 text-center">{items.chairs}</span>
            <button className="w-10 h-10 border-none rounded-full bg-gradient-to-r from-blue-500 to-sky-500 text-white text-xl font-bold shadow-md hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center" onClick={() => updateCount('chairs', 1)}>
              +
            </button>
          </div>
        </div>
      </div>

      <button
        className="w-full px-8 py-4 text-lg font-semibold rounded-2xl bg-gradient-to-r from-blue-500 to-sky-500 text-white shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 hover:-translate-y-1 transition-all duration-300 mt-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-xl disabled:hover:translate-y-0 disabled:from-gray-400 disabled:to-gray-500"
        onClick={getQuote}
        disabled={Object.values(items).every(val => val === 0)}
      >
        {Object.values(items).every(val => val === 0) ? 'Select Items to Continue' : 'Get AI Quote'}
      </button>
    </div>
  );
}

export default CustomQuoteDemo;
