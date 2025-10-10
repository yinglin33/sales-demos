'use client'

import React, { useEffect, useRef, useState } from 'react';

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

function CustomQuoteDemo() {
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
  const [originAddress, setOriginAddress] = useState<string>('');
  const [destinationAddress, setDestinationAddress] = useState<string>('');
  const [distanceMeters, setDistanceMeters] = useState<number | null>(null);
  const [travelFee, setTravelFee] = useState<number>(0);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    date: '',
    time: '',
    phone: '',
    email: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const originInputRef = useRef<HTMLInputElement | null>(null);
  const destinationInputRef = useRef<HTMLInputElement | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const directionsRendererRef = useRef<any>(null);
  const originLatLngRef = useRef<any>(null);
  const destinationLatLngRef = useRef<any>(null);

  function maybeRoute(): void {
    const g = (window as any).google;
    if (!g || !originLatLngRef.current || !destinationLatLngRef.current) return;
    const directionsService = new g.maps.DirectionsService();
    directionsService.route(
      {
        origin: originLatLngRef.current,
        destination: destinationLatLngRef.current,
        travelMode: g.maps.TravelMode.DRIVING
      },
      (result: any, status: any) => {
        if (status === 'OK' && result && result.routes && result.routes[0]) {
          if (directionsRendererRef.current) {
            directionsRendererRef.current.setDirections(result);
          }
          const legs = result.routes[0].legs || [];
          const meters = legs.reduce((sum: number, leg: any) => sum + (leg.distance?.value || 0), 0);
          setDistanceMeters(meters);
          const miles = meters / 1609.34;
          setTravelFee(Math.round(miles * 0.5));
          if (mapRef.current && result.routes[0].bounds) {
            mapRef.current.fitBounds(result.routes[0].bounds);
          }
        }
      }
    );
  }

  useEffect(() => {
    const initializeMaps = () => {
      const g = (window as any).google;
      if (!g) {
        console.log('Custom Quote: Google Maps API not loaded, retrying...');
        setTimeout(initializeMaps, 500);
        return;
      }

      // Check if DOM elements are available
      if (!mapContainerRef.current || !originInputRef.current || !destinationInputRef.current) {
        console.log('Custom Quote: DOM elements not ready, retrying...');
        setTimeout(initializeMaps, 200);
        return;
      }
      
      console.log('Custom Quote: Initializing Google Maps...');
      
      if (!mapRef.current && mapContainerRef.current) {
        mapRef.current = new g.maps.Map(mapContainerRef.current, {
          center: { lat: 37.7749, lng: -122.4194 },
          zoom: 10
        });
        directionsRendererRef.current = new g.maps.DirectionsRenderer();
        directionsRendererRef.current.setMap(mapRef.current);
        console.log('Custom Quote: Map initialized successfully');
      }

      if (originInputRef.current) {
        const ac = new g.maps.places.Autocomplete(originInputRef.current, {
          fields: ['formatted_address', 'geometry']
        });
        ac.addListener('place_changed', () => {
          const place = ac.getPlace();
          if (place && place.geometry && place.geometry.location) {
            originLatLngRef.current = {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            };
            setOriginAddress(place.formatted_address || '');
            maybeRoute();
          }
        });
        console.log('Custom Quote: Origin autocomplete initialized');
      }

      if (destinationInputRef.current) {
        const ac2 = new g.maps.places.Autocomplete(destinationInputRef.current, {
          fields: ['formatted_address', 'geometry']
        });
        ac2.addListener('place_changed', () => {
          const place = ac2.getPlace();
          if (place && place.geometry && place.geometry.location) {
            destinationLatLngRef.current = {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            };
            setDestinationAddress(place.formatted_address || '');
            maybeRoute();
          }
        });
        console.log('Custom Quote: Destination autocomplete initialized');
      }
    };

    // Start initialization
    initializeMaps();
  }, []);

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

  const validateQuoteRequirements = (): boolean => {
    if (Object.values(items).every(val => val === 0)) {
      return false;
    }
    if (!originAddress.trim()) {
      alert('Please enter an origin address to calculate your quote.');
      return false;
    }
    if (!destinationAddress.trim()) {
      alert('Please enter a destination address to calculate your quote.');
      return false;
    }
    return true;
  };

  const getQuote = (): void => {
    if (!validateQuoteRequirements()) {
      return;
    }
    
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

      if (distanceMeters && distanceMeters > 0) {
        const miles = distanceMeters / 1609.34;
        const fee = Math.round(miles * 0.5);
        breakdown['travelFee'] = fee;
        total += fee;
      }

      setQuoteBreakdown(breakdown);
      setTotalQuote(total);
      setStep('quote');
    }, 2500);
  };

  const scheduleService = (): void => {
    setStep('schedule');
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    if (!formData.date) {
      errors.date = 'Preferred date is required';
    }
    if (!formData.time) {
      errors.time = 'Preferred time is required';
    }
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    }
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: string, value: string): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const proceedToPayment = (): void => {
    if (validateForm()) {
      setStep('success');
    }
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
    setFormData({
      firstName: '',
      lastName: '',
      date: '',
      time: '',
      phone: '',
      email: ''
    });
    setFormErrors({});
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
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 animate-pulse">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-3">Thanks for scheduling!</h2>
          <p className="text-base text-slate-600">Our team will confirm the details shortly.</p>
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
            if (key === 'travelFee') {
              return (
                <div key={key} className="flex justify-between py-3 border-b border-blue-200/50 text-base">
                  <span className="text-slate-700">Travel Fee</span>
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
          <label className="block text-base font-semibold text-slate-700 mb-3">First Name *</label>
          <input
            type="text"
            placeholder="First Name"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            className={`w-full px-4 py-4 rounded-xl border-2 text-base focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all bg-white/50 ${
              formErrors.firstName ? 'border-red-400 focus:border-red-500' : 'border-blue-200 focus:border-blue-500'
            }`}
          />
          {formErrors.firstName && <p className="text-red-500 text-sm mt-1">{formErrors.firstName}</p>}
        </div>
        <div className="mb-5">
          <label className="block text-base font-semibold text-slate-700 mb-3">Last Name *</label>
          <input
            type="text"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            className={`w-full px-4 py-4 rounded-xl border-2 text-base focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all bg-white/50 ${
              formErrors.lastName ? 'border-red-400 focus:border-red-500' : 'border-blue-200 focus:border-blue-500'
            }`}
          />
          {formErrors.lastName && <p className="text-red-500 text-sm mt-1">{formErrors.lastName}</p>}
        </div>
        <div className="mb-5">
          <label className="block text-base font-semibold text-slate-700 mb-3">Preferred Date *</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            className={`w-full px-4 py-4 rounded-xl border-2 text-base focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all bg-white/50 ${
              formErrors.date ? 'border-red-400 focus:border-red-500' : 'border-blue-200 focus:border-blue-500'
            }`}
            min={new Date().toISOString().split('T')[0]}
          />
          {formErrors.date && <p className="text-red-500 text-sm mt-1">{formErrors.date}</p>}
        </div>
        <div className="mb-5">
          <label className="block text-base font-semibold text-slate-700 mb-3">Preferred Time *</label>
          <select 
            value={formData.time}
            onChange={(e) => handleInputChange('time', e.target.value)}
            className={`w-full px-4 py-4 rounded-xl border-2 text-base focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all bg-white/50 ${
              formErrors.time ? 'border-red-400 focus:border-red-500' : 'border-blue-200 focus:border-blue-500'
            }`}
          >
            <option value="">Select a time slot</option>
            <option value="8:00 AM - 10:00 AM">8:00 AM - 10:00 AM</option>
            <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM</option>
            <option value="12:00 PM - 2:00 PM">12:00 PM - 2:00 PM</option>
            <option value="2:00 PM - 4:00 PM">2:00 PM - 4:00 PM</option>
            <option value="4:00 PM - 6:00 PM">4:00 PM - 6:00 PM</option>
          </select>
          {formErrors.time && <p className="text-red-500 text-sm mt-1">{formErrors.time}</p>}
        </div>
        <div className="mb-5">
          <label className="block text-base font-semibold text-slate-700 mb-3">Email *</label>
          <input
            type="email"
            placeholder="example@email.com"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`w-full px-4 py-4 rounded-xl border-2 text-base focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all bg-white/50 ${
              formErrors.email ? 'border-red-400 focus:border-red-500' : 'border-blue-200 focus:border-blue-500'
            }`}
          />
          {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
        </div>
        <div className="mb-5">
          <label className="block text-base font-semibold text-slate-700 mb-3">Phone *</label>
          <input
            type="tel"
            placeholder="(555) 123-4567"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className={`w-full px-4 py-4 rounded-xl border-2 text-base focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all bg-white/50 ${
              formErrors.phone ? 'border-red-400 focus:border-red-500' : 'border-blue-200 focus:border-blue-500'
            }`}
          />
          {formErrors.phone && <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>}
        </div>
        <div className="mb-5">
          <label className="block text-base font-semibold text-slate-700 mb-3">Service Addresses</label>
          <div className="grid grid-cols-1 gap-3">
            <div className="px-4 py-3 rounded-xl border-2 border-blue-200 bg-blue-50 text-slate-700 text-base">
              <strong>From:</strong> {originAddress}
            </div>
            <div className="px-4 py-3 rounded-xl border-2 border-blue-200 bg-blue-50 text-slate-700 text-base">
              <strong>To:</strong> {destinationAddress}
            </div>
          </div>
          <p className="text-sm text-slate-500 mt-1">These addresses were provided when calculating your quote</p>
        </div>
        <button className="w-full px-8 py-4 text-lg font-semibold rounded-2xl bg-gradient-to-r from-blue-500 to-sky-500 text-white shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 hover:-translate-y-1 transition-all duration-300 mt-6" onClick={proceedToPayment}>
          Schedule Service
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
            if (key === 'travelFee') {
              return (
                <div key={key} className="flex justify-between py-3 border-b border-blue-200/50 text-base">
                  <span className="text-slate-700">Travel Fee</span>
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
            Optimized pricing
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

      <div className="mt-8">
        <h3 className="text-xl font-bold text-slate-800 mb-3">Service Locations</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-base font-semibold text-slate-700 mb-2">Initial Address</label>
            <input
              ref={originInputRef}
              type="text"
              value={originAddress}
              onChange={(e) => setOriginAddress(e.target.value)}
              placeholder="Start address"
              className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 text-base focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all bg-white/50"
            />
          </div>
          <div>
            <label className="block text-base font-semibold text-slate-700 mb-2">Final Address</label>
            <input
              ref={destinationInputRef}
              type="text"
              value={destinationAddress}
              onChange={(e) => setDestinationAddress(e.target.value)}
              placeholder="End address"
              className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 text-base focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all bg-white/50"
            />
          </div>
        </div>
        <div className="mt-3 text-sm text-slate-600">
          {distanceMeters ? (
            <div className="flex items-center gap-4">
              <span>Distance: {(distanceMeters / 1609.34).toFixed(1)} mi</span>
              <span>Travel Fee: ${travelFee}</span>
            </div>
          ) : (
            <span>Select both addresses to calculate distance and travel fee</span>
          )}
        </div>
        <div ref={mapContainerRef} className="mt-4 h-60 w-full rounded-2xl border-2 border-blue-200"></div>
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
