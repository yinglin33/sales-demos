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
    // Add variance: ±15% randomization plus quantity-based adjustments
    const variance = 0.85 + Math.random() * 0.3; // 0.85 to 1.15
    const quantityDiscount = quantity > 3 ? 0.95 : 1; // 5% discount for bulk
    const complexityFactor = 0.95 + Math.random() * 0.1; // Slight complexity variation

    return Math.round(basePrice * variance * quantityDiscount * complexityFactor * quantity);
  };

  const getQuote = (): void => {
    setStep('loading');

    // Simulate AI quote generation (2-3 seconds)
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

      // Generate dynamic prices for each selected item
      (Object.keys(items) as ItemKey[]).forEach((item) => {
        if (items[item] > 0) {
          const price = generateDynamicPrice(basePrices[item], items[item]);
          breakdown[item] = price;
          total += price;
        }
      });

      // Add service fees with variance
      const baseFee = 50;
      const serviceFee = Math.round(baseFee + Math.random() * 30); // $50-$80
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
            Preparing Your Quote...
          </h2>
          <p style={{ fontSize: '16px', color: '#546E7A' }}>
            Our AI is analyzing your selections and calculating the best price
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

  if (step === 'success') {
    return (
      <div className="demo-container">
        <div className="success-message">
          <div className="success-icon">✓</div>
          <h2>Booking Confirmed!</h2>
          <p>Your service has been scheduled and payment processed successfully.</p>
          <p>A confirmation email has been sent to your inbox.</p>
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
          <h3>Order Summary</h3>
          {Object.keys(quoteBreakdown).map((key) => {
            if (key === 'serviceFee') {
              return (
                <div key={key} className="quote-line">
                  <span>Service Fee</span>
                  <span>${quoteBreakdown[key]}</span>
                </div>
              );
            }
            return (
              <div key={key} className="quote-line">
                <span>
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str: string) => str.toUpperCase())} x{items[key as ItemKey]}
                </span>
                <span>${quoteBreakdown[key]}</span>
              </div>
            );
          })}
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
        <button className="btn-primary" onClick={proceedToPayment}>
          Proceed to Payment
        </button>
      </div>
    );
  }

  if (step === 'quote') {
    return (
      <div className="demo-container">
        <h2 className="demo-title">Your AI-Generated Quote</h2>
        <div className="quote-summary">
          <h3>Quote Breakdown</h3>
          {Object.keys(quoteBreakdown).map((key) => {
            if (key === 'serviceFee') {
              return (
                <div key={key} className="quote-line">
                  <span>Service Fee</span>
                  <span>${quoteBreakdown[key]}</span>
                </div>
              );
            }
            return (
              <div key={key} className="quote-line">
                <span>
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str: string) => str.toUpperCase())} x{items[key as ItemKey]}
                </span>
                <span>${quoteBreakdown[key]}</span>
              </div>
            );
          })}
          <div className="quote-line">
            <span>Total Estimated Cost</span>
            <span>${totalQuote}</span>
          </div>
        </div>
        <div style={{ textAlign: 'center', color: '#546E7A', marginTop: '12px', fontSize: '14px' }}>
          <p>✓ AI-optimized pricing</p>
          <p>✓ Professional service guaranteed</p>
        </div>
        <button className="btn-primary" onClick={scheduleService}>
          Schedule Service
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
          onClick={() => setStep('form')}
        >
          Modify Quote
        </button>
      </div>
    );
  }

  return (
    <div className="demo-container">
      <h2 className="demo-title">Configure Your Service</h2>

      <div className="form-group">
        <div className="counter-group">
          <span>🛏️ Bedrooms</span>
          <div className="counter-controls">
            <button className="counter-btn" onClick={() => updateCount('bedrooms', -1)}>
              −
            </button>
            <span className="counter-value">{items.bedrooms}</span>
            <button className="counter-btn" onClick={() => updateCount('bedrooms', 1)}>
              +
            </button>
          </div>
        </div>
      </div>

      <div className="form-group">
        <div className="counter-group">
          <span>🚿 Bathrooms</span>
          <div className="counter-controls">
            <button className="counter-btn" onClick={() => updateCount('bathrooms', -1)}>
              −
            </button>
            <span className="counter-value">{items.bathrooms}</span>
            <button className="counter-btn" onClick={() => updateCount('bathrooms', 1)}>
              +
            </button>
          </div>
        </div>
      </div>

      <div className="form-group">
        <div className="counter-group">
          <span>🛋️ Large Furniture (Sofas, Beds, etc.)</span>
          <div className="counter-controls">
            <button className="counter-btn" onClick={() => updateCount('largeFurniture', -1)}>
              −
            </button>
            <span className="counter-value">{items.largeFurniture}</span>
            <button className="counter-btn" onClick={() => updateCount('largeFurniture', 1)}>
              +
            </button>
          </div>
        </div>
      </div>

      <div className="form-group">
        <div className="counter-group">
          <span>🪑 Tables</span>
          <div className="counter-controls">
            <button className="counter-btn" onClick={() => updateCount('tables', -1)}>
              −
            </button>
            <span className="counter-value">{items.tables}</span>
            <button className="counter-btn" onClick={() => updateCount('tables', 1)}>
              +
            </button>
          </div>
        </div>
      </div>

      <div className="form-group">
        <div className="counter-group">
          <span>💺 Chairs</span>
          <div className="counter-controls">
            <button className="counter-btn" onClick={() => updateCount('chairs', -1)}>
              −
            </button>
            <span className="counter-value">{items.chairs}</span>
            <button className="counter-btn" onClick={() => updateCount('chairs', 1)}>
              +
            </button>
          </div>
        </div>
      </div>

      <button
        className="btn-primary"
        onClick={getQuote}
        disabled={Object.values(items).every(val => val === 0)}
        style={{
          opacity: Object.values(items).every(val => val === 0) ? 0.5 : 1,
          cursor: Object.values(items).every(val => val === 0) ? 'not-allowed' : 'pointer',
        }}
      >
        {Object.values(items).every(val => val === 0) ? 'Select Items to Continue' : 'Get AI Quote'}
      </button>
    </div>
  );
}

export default CustomQuoteDemo;