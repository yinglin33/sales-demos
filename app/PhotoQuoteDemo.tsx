'use client'

import React, { useEffect, useRef, useState } from 'react';

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

interface Items {
  bedrooms: number;
  bathrooms: number;
  largeFurniture: number;
  tables: number;
  chairs: number;
}

type ItemKey = keyof Items;

type Step = 'upload' | 'analyzing' | 'quote' | 'schedule' | 'payment' | 'success';

function PhotoQuoteDemo() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [step, setStep] = useState<Step>('upload');
  const [dragOver, setDragOver] = useState<boolean>(false);
  const [detectedItems, setDetectedItems] = useState<DetectedItem[]>([]);
  const [totalQuote, setTotalQuote] = useState<number>(0);
  const [itemCounts, setItemCounts] = useState<Items>({
    bedrooms: 0,
    bathrooms: 0,
    largeFurniture: 0,
    tables: 0,
    chairs: 0,
  });
  const [quoteBreakdown, setQuoteBreakdown] = useState<Record<string, number>>({});
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    date: '',
    time: '',
    phone: '',
    email: ''
  });
  const [originAddress, setOriginAddress] = useState<string>('');
  const [destinationAddress, setDestinationAddress] = useState<string>('');
  const [distanceMeters, setDistanceMeters] = useState<number | null>(null);
  const [travelFee, setTravelFee] = useState<number>(0);
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
        console.log('Google Maps API not loaded, retrying...');
        setTimeout(initializeMaps, 500);
        return;
      }

      // Check if DOM elements are available
      if (!mapContainerRef.current || !originInputRef.current || !destinationInputRef.current) {
        console.log('DOM elements not ready, retrying...');
        setTimeout(initializeMaps, 200);
        return;
      }
      
      console.log('Initializing Google Maps...');
      
      if (!mapRef.current && mapContainerRef.current) {
        mapRef.current = new g.maps.Map(mapContainerRef.current, {
          center: { lat: 37.7749, lng: -122.4194 },
          zoom: 10
        });
        directionsRendererRef.current = new g.maps.DirectionsRenderer();
        directionsRendererRef.current.setMap(mapRef.current);
        console.log('Map initialized successfully');
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
            // Clear error when user selects from autocomplete
            if (formErrors.originAddress) {
              setFormErrors(prev => ({ ...prev, originAddress: '' }));
            }
          }
        });
        console.log('Origin autocomplete initialized');
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
            // Clear error when user selects from autocomplete
            if (formErrors.destinationAddress) {
              setFormErrors(prev => ({ ...prev, destinationAddress: '' }));
            }
          }
        });
        console.log('Destination autocomplete initialized');
      }
    };

    // Start initialization
    initializeMaps();
  }, []);

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

  const useExamplePhoto = (): void => {
    // Create a sample apartment image
    const exampleImage: ImageData = {
      id: 'example-apartment',
      url: '/apartment.jpeg',
      name: 'Example Apartment'
    };
    setImages([exampleImage]);
  };

  const generateDynamicPrice = (basePrice: number, quantity: number): number => {
    const variance = 0.85 + Math.random() * 0.3;
    const quantityDiscount = quantity > 3 ? 0.95 : 1;
    const complexityFactor = 0.95 + Math.random() * 0.1;
    return Math.round(basePrice * variance * quantityDiscount * complexityFactor * quantity);
  };

  const analyzeImagesWithAI = async (): Promise<Items> => {
    try {
      console.log('🤖 Starting AI analysis for', images.length, 'images');
      console.log('📸 Image URLs:', images.map(img => img.url));
      
      // Convert images to base64 for OpenAI API
      const imagePromises = images.map(async (image) => {
        if (image.url.startsWith('data:')) {
          return image.url; // Already base64
        }
        
        try {
          const response = await fetch(image.url);
          const blob = await response.blob();
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } catch (error) {
          console.error('Error converting image to base64:', error);
          return image.url; // Fallback to original URL
        }
      });
      
      const base64Images = await Promise.all(imagePromises);
      console.log('📸 Converted to base64, sending to API...');
      
      const response = await fetch('/api/analyze-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ images: base64Images }),
      });

      console.log('📡 API Response status:', response.status);

      if (!response.ok) {
        throw new Error('Failed to analyze images');
      }

      const data = await response.json();
      console.log('✅ AI Analysis result:', data);
      return data;
    } catch (error) {
      console.error('❌ Error analyzing images:', error);
      // Fallback to default values
      return {
        bedrooms: images.length,
        bathrooms: 0,
        largeFurniture: 0,
        tables: 0,
        chairs: 0,
      };
    }
  };

  const analyzePhotos = async (): Promise<void> => {
    // Validate addresses before proceeding
    if (!originAddress.trim() || !destinationAddress.trim()) {
      alert('Please enter both origin and destination addresses before analyzing photos.');
      return;
    }
    
    setStep('analyzing');
    
    try {
      // Analyze images with AI
      const aiItemCounts = await analyzeImagesWithAI();
      setItemCounts(aiItemCounts);
      
      // Calculate pricing using the same structure as CustomQuoteDemo
      const breakdown: Record<string, number> = {};
      let total = 0;

      const basePrices: Items = {
        bedrooms: 150,
        bathrooms: 100,
        largeFurniture: 80,
        tables: 50,
        chairs: 15,
      };

      // Calculate prices for each category
      (Object.keys(aiItemCounts) as ItemKey[]).forEach((item) => {
        if (aiItemCounts[item] > 0) {
          const price = generateDynamicPrice(basePrices[item], aiItemCounts[item]);
          breakdown[item] = price;
          total += price;
        }
      });

      // Add base service fee
      const baseFee = 50 + Math.round(Math.random() * 30);
      breakdown['serviceFee'] = baseFee;
      total += baseFee;

      // Add travel fee if distance is available
      if (distanceMeters && distanceMeters > 0) {
        const miles = distanceMeters / 1609.34;
        const fee = Math.round(miles * 0.5);
        breakdown['travelFee'] = fee;
        total += fee;
      }

      setQuoteBreakdown(breakdown);
      setTotalQuote(total);
      
      // Convert to old format for backward compatibility
      const items: DetectedItem[] = [];
      Object.keys(breakdown).forEach((key) => {
        if (key === 'serviceFee') {
          items.push({
            name: 'Service Fee',
            quantity: 1,
            pricePerUnit: breakdown[key],
            total: breakdown[key],
          });
        } else if (key === 'travelFee') {
          items.push({
            name: 'Travel Fee',
            quantity: 1,
            pricePerUnit: breakdown[key],
            total: breakdown[key],
          });
        } else {
          const itemKey = key as ItemKey;
          items.push({
            name: key.replace(/([A-Z])/g, ' $1').replace(/^./, (str: string) => str.toUpperCase()),
            quantity: aiItemCounts[itemKey],
            pricePerUnit: Math.round(breakdown[key] / aiItemCounts[itemKey]),
            total: breakdown[key],
          });
        }
      });

      setDetectedItems(items);
      setStep('quote');
    } catch (error) {
      console.error('Error analyzing photos:', error);
      alert('Failed to analyze photos. Please try again.');
      setStep('upload');
    }
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
    // Address is already collected in the address step, so no need to validate here
    
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
    setImages([]);
    setDetectedItems([]);
    setTotalQuote(0);
    setItemCounts({ bedrooms: 0, bathrooms: 0, largeFurniture: 0, tables: 0, chairs: 0 });
    setQuoteBreakdown({});
    setFormData({
      firstName: '',
      lastName: '',
      date: '',
      time: '',
      phone: '',
      email: ''
    });
    setOriginAddress('');
    setDestinationAddress('');
    setDistanceMeters(null);
    setTravelFee(0);
    setFormErrors({});
    setStep('upload');
  };

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

  // removed payment step

  if (step === 'schedule') {
    return (
      <div className="max-w-3xl mx-auto w-full bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-blue-500/10 border border-blue-100/50 animate-scale-in">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent mb-6 text-center">Schedule Your Service</h2>
        <div className="mb-5">
          <label className="block text-base font-semibold text-slate-700 mb-3">First Name *</label>
          <input
            type="text"
            placeholder="Jane"
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
            placeholder="Doe"
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
          <label className="block text-base font-semibold text-slate-700 mb-3">Email *</label>
          <input
            type="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`w-full px-4 py-4 rounded-xl border-2 text-base focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all bg-white/50 ${
              formErrors.email ? 'border-red-400 focus:border-red-500' : 'border-blue-200 focus:border-blue-500'
            }`}
          />
          {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
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
            AI analyzed {images.length} photo{images.length !== 1 ? 's' : ''} and detected your furniture inventory
          </p>
        </div>

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
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str: string) => str.toUpperCase())} x{itemCounts[key as ItemKey]}
                </span>
                <span className="font-semibold text-blue-600">${quoteBreakdown[key]}</span>
            </div>
            );
          })}
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
    <div className="max-w-4xl mx-auto w-full bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-blue-500/10 border border-blue-100/50 animate-scale-in">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent mb-6 text-center">Upload Photos & Enter Addresses</h2>

      {/* Upload Section */}
      <div className="mb-8">
        <div
          className={`border-3 border-dashed rounded-2xl p-12 text-center bg-gradient-to-br from-blue-50 to-sky-50 cursor-pointer transition-all duration-300 mb-4 ${
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
        
        <div className="text-center">
          <div className="text-sm text-slate-500 mb-3">or</div>
          <button
            onClick={useExamplePhoto}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-2 mx-auto"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Use Example Photo
          </button>
          <p className="text-xs text-slate-400 mt-2">Try the demo with a sample apartment image</p>
        </div>
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

      {/* Address Section */}
      <div className="mt-8 pt-8 border-t border-blue-200/50">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent mb-6 text-center">Where Are You Moving?</h3>
        
        <div className="mb-6">
          <p className="text-center text-slate-600 text-base mb-6">
            We need both addresses to calculate accurate moving costs based on distance and location factors.
          </p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-lg font-semibold text-slate-700 mb-3">Initial Address *</label>
              <input
                ref={originInputRef}
                type="text"
                value={originAddress}
                onChange={(e) => setOriginAddress(e.target.value)}
                placeholder="Start address"
                className={`w-full px-4 py-4 rounded-xl border-2 text-base focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all bg-white/50 ${
                  formErrors.originAddress ? 'border-red-400 focus:border-red-500' : 'border-blue-200 focus:border-blue-500'
                }`}
              />
              {formErrors.originAddress && <p className="text-red-500 text-sm mt-2">{formErrors.originAddress}</p>}
            </div>
            
            <div>
              <label className="block text-lg font-semibold text-slate-700 mb-3">Final Address *</label>
              <input
                ref={destinationInputRef}
                type="text"
                value={destinationAddress}
                onChange={(e) => setDestinationAddress(e.target.value)}
                placeholder="End address"
                className={`w-full px-4 py-4 rounded-xl border-2 text-base focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all bg-white/50 ${
                  formErrors.destinationAddress ? 'border-red-400 focus:border-red-500' : 'border-blue-200 focus:border-blue-500'
                }`}
              />
              {formErrors.destinationAddress && <p className="text-red-500 text-sm mt-2">{formErrors.destinationAddress}</p>}
            </div>
          </div>

          <div className="text-sm text-slate-600 mb-4">
            {distanceMeters ? (
              <div className="flex items-center justify-center gap-6">
                <span>Distance: {(distanceMeters / 1609.34).toFixed(1)} mi</span>
                <span>Travel Fee: ${travelFee}</span>
              </div>
            ) : (
              <span className="text-center block">Select both addresses to calculate distance and travel fee</span>
            )}
          </div>
          
          <div ref={mapContainerRef} className="h-60 w-full rounded-2xl border-2 border-blue-200 mb-6"></div>
        </div>
      </div>

      <button
        className="w-full px-8 py-4 text-lg font-semibold rounded-2xl bg-gradient-to-r from-blue-500 to-sky-500 text-white shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 hover:-translate-y-1 transition-all duration-300 mt-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-xl disabled:hover:translate-y-0 disabled:from-gray-400 disabled:to-gray-500"
        onClick={analyzePhotos}
        disabled={images.length === 0}
      >
        {images.length === 0 ? 'Upload Photos to Continue' : `Analyze ${images.length} Photo${images.length !== 1 ? 's' : ''} & Get Quote`}
      </button>
    </div>
  );
}

export default PhotoQuoteDemo;
