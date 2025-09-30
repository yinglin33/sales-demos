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
    // Simulate AI detection - generate random items based on typical moving inventory
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

    // Randomly select 4-8 items per photo uploaded
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
        const variance = 0.85 + Math.random() * 0.3; // ±15% price variance
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

    // Simulate AI analysis (2.5 seconds)
    setTimeout(() => {
      const items = generateDetectedItems();
      const baseFee = 150 + Math.round(Math.random() * 100); // $150-$250 base moving fee
      const itemsTotal = items.reduce((sum, item) => sum + item.total, 0);
      const total = baseFee + itemsTotal;

      // Add base fee as an item
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
      <div className="demo-container">
        <div className="success-message">
          <div className="success-icon">✓</div>
          <h2>Move Scheduled!</h2>
          <p>Your move has been scheduled and payment processed successfully.</p>
          <p>Our team will arrive on your scheduled date ready to move all detected items.</p>
          <button className="btn-primary" onClick={resetDemo}>
            Create Another Quote
          </button>
        </div>
      </div>
    );
  }

  if (step === 'payment') {
    return (
      <div className="demo-container">
        <h2 className="demo-title">Payment Details</h2>
        <div className="quote-summary">
          <h3>Moving Quote Summary</h3>
          {detectedItems.slice(0, 5).map((item, idx) => (
            <div key={idx} className="quote-line">
              <span>{item.name} {item.quantity > 1 ? `x${item.quantity}` : ''}</span>
              <span>${item.total}</span>
            </div>
          ))}
          {detectedItems.length > 5 && (
            <div className="quote-line" style={{ fontStyle: 'italic', color: '#78909C' }}>
              <span>+ {detectedItems.length - 5} more items</span>
              <span></span>
            </div>
          )}
          <div className="quote-line">
            <span>Total Amount</span>
            <span>${totalQuote}</span>
          </div>
        </div>
        <div style={{ marginTop: '16px', padding: '16px', background: '#F5F5F5', borderRadius: '12px' }}>
          <p style={{ textAlign: 'center', color: '#546E7A', fontSize: '14px' }}>
            💳 Payment processing demo
          </p>
        </div>
        <button className="btn-primary" onClick={completePayment}>
          Process Payment (Demo)
        </button>
      </div>
    );
  }

  if (step === 'schedule') {
    return (
      <div className="demo-container">
        <h2 className="demo-title">Schedule Your Service</h2>
        <div className="form-group">
          <label>Preferred Date</label>
          <input
            type="date"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '2px solid #E0E0E0',
              fontSize: '16px',
            }}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
        <div className="form-group">
          <label>Preferred Time</label>
          <select
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '2px solid #E0E0E0',
              fontSize: '16px',
            }}
          >
            <option>8:00 AM - 10:00 AM</option>
            <option>10:00 AM - 12:00 PM</option>
            <option>12:00 PM - 2:00 PM</option>
            <option>2:00 PM - 4:00 PM</option>
            <option>4:00 PM - 6:00 PM</option>
          </select>
        </div>
        <div className="form-group">
          <label>Contact Phone</label>
          <input
            type="tel"
            placeholder="(555) 123-4567"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '2px solid #E0E0E0',
              fontSize: '16px',
            }}
          />
        </div>
        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            placeholder="your@email.com"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '2px solid #E0E0E0',
              fontSize: '16px',
            }}
          />
        </div>
        <button className="btn-primary" onClick={proceedToPayment}>
          Proceed to Payment
        </button>
      </div>
    );
  }

  if (step === 'analyzing') {
    return (
      <div className="demo-container">
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div
            style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 24px',
              border: '4px solid #E3F2FD',
              borderTop: '4px solid #0277BD',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          ></div>
          <h2 style={{ fontSize: '28px', color: '#0277BD', marginBottom: '16px' }}>
            Analyzing Your Photos...
          </h2>
          <p style={{ fontSize: '16px', color: '#546E7A' }}>
            Our AI is detecting furniture and calculating your moving quote
          </p>
        </div>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  if (step === 'quote') {
    return (
      <div className="demo-container">
        <h2 className="demo-title">Your Moving Quote</h2>

        <div style={{ marginBottom: '16px' }}>
          <p style={{ color: '#546E7A', textAlign: 'center', fontSize: '14px' }}>
            AI detected {detectedItems.length - 1} item types from {images.length} photo{images.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="quote-summary">
          <h3>Detected Items</h3>
          {detectedItems.map((item, idx) => (
            <div key={idx} className="quote-line">
              <span>{item.name} {item.quantity > 1 ? `x${item.quantity}` : ''}</span>
              <span>${item.total}</span>
            </div>
          ))}
          <div className="quote-line">
            <span>Total Moving Cost</span>
            <span>${totalQuote}</span>
          </div>
        </div>

        <div style={{ textAlign: 'center', color: '#546E7A', marginTop: '12px', fontSize: '14px' }}>
          <p>✓ AI-powered item detection</p>
          <p>✓ Professional moving service</p>
        </div>

        <button className="btn-primary" onClick={scheduleService}>
          Schedule Move
        </button>
        <button
          style={{
            width: '100%',
            padding: '12px',
            marginTop: '12px',
            background: 'transparent',
            border: '2px solid #4FC3F7',
            borderRadius: '12px',
            color: '#0277BD',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
          onClick={() => setStep('upload')}
        >
          Upload Different Photos
        </button>
      </div>
    );
  }

  return (
    <div className="demo-container">
      <h2 className="demo-title">Upload Photos of Your Space</h2>

      <div
        className={`upload-area ${dragOver ? 'dragover' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <div className="upload-icon">📸</div>
        <h3>Drop your photos here</h3>
        <p>or click to browse</p>
        <p style={{ marginTop: '16px', fontSize: '12px' }}>
          Upload photos of each room for the most accurate quote
        </p>
        <input
          id="file-input"
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>

      {images.length > 0 && (
        <>
          <div style={{ marginTop: '24px', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', color: '#0277BD' }}>
              {images.length} Photo{images.length !== 1 ? 's' : ''} Uploaded
            </h3>
          </div>
          <div className="image-preview">
            {images.map((image) => (
              <div key={image.id} className="preview-item">
                <img src={image.url} alt={image.name} />
                <button className="remove-image" onClick={() => removeImage(image.id)}>
                  ×
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      <button
        className="btn-primary"
        onClick={analyzePhotos}
        disabled={images.length === 0}
        style={{
          opacity: images.length === 0 ? 0.5 : 1,
          cursor: images.length === 0 ? 'not-allowed' : 'pointer',
          marginTop: '32px',
        }}
      >
        {images.length === 0 ? 'Upload Photos to Continue' : `Analyze ${images.length} Photo${images.length !== 1 ? 's' : ''} & Get Quote`}
      </button>
    </div>
  );
}

export default PhotoQuoteDemo;