'use client';

import { useState, useEffect, useRef } from 'react';
import { DemoCard } from './DemoCard';

type BusinessProfile = {
  name: string;
  category: string;
  hours: string;
  rating: number;
  phone: string;
  address: string;
  website?: string;
  reviews?: number;
};

type TranscriptEntry = {
  role: 'user' | 'agent';
  text: string;
  timestamp: string;
};

type CallStatus = 'idle' | 'starting' | 'connecting' | 'connected' | 'ended' | 'error';

export function ReceptionistDemo() {
  const [businessName, setBusinessName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [showLeadInfo, setShowLeadInfo] = useState(false);
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [callDuration, setCallDuration] = useState(0);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Lead capture state - check localStorage in useEffect to avoid hydration errors
  const [showLeadCapture, setShowLeadCapture] = useState(true); // Always start true for SSR
  const [leadEmail, setLeadEmail] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);

  // Check localStorage after component mounts (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasSubmitted = localStorage.getItem('posentia_demo_submitted');
      if (hasSubmitted) {
        setShowLeadCapture(false);
        // Optionally load stored email/phone
        const storedEmail = localStorage.getItem('posentia_demo_email');
        const storedPhone = localStorage.getItem('posentia_demo_phone');
        if (storedEmail) setLeadEmail(storedEmail);
        if (storedPhone) setLeadPhone(storedPhone);
      }
    }
  }, []);

  const lookupBusiness = async () => {
    if (!businessName.trim()) {
      alert('Please enter a business name');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/gbp/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessName }),
      });

      const data = await response.json();

      if (response.ok && data.profile) {
        setBusinessProfile(data.profile);
      } else {
        const mockProfile: BusinessProfile = {
          name: businessName,
          category: 'Service Business',
          hours: 'Mon-Fri 9AM-5PM',
          rating: 4.5,
          phone: '(555) 123-4567',
          address: '123 Main St, City, State',
        };
        setBusinessProfile(mockProfile);
      }
    } catch (error) {
      console.error('Business lookup error:', error);
      const mockProfile: BusinessProfile = {
        name: businessName,
        category: 'Service Business',
        hours: 'Mon-Fri 9AM-5PM',
        rating: 4.5,
        phone: '(555) 123-4567',
        address: '123 Main St, City, State',
      };
      setBusinessProfile(mockProfile);
    } finally {
      setIsLoading(false);
    }
  };

  const startRetellCall = async () => {
    if (!businessProfile) {
      alert('Please lookup a business first');
      return;
    }

    setCallStatus('starting');
    setTranscript([]);
    setCallDuration(0);
    setShowLeadInfo(false);

    try {
      // Get access token from our API
      const response = await fetch('/api/retell/web-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessProfile }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create call');
      }

      // If demo mode, simulate call
      if (data.mock) {
        simulateMockCall();
        return;
      }

      // Using Retell API directly (no SDK needed)
      // The API route creates the call, we'll use demo mode for UI
      // In production, you'd poll the call status or use webhooks for real-time updates
      console.log('Call created via Retell API:', data.call_id);
      simulateMockCall();
      
    } catch (error) {
      console.error('Call initiation error:', error);
      setCallStatus('error');
      alert('Failed to start call. Using demo mode.');
      simulateMockCall();
    }
  };

  const endCall = async () => {
    // End call (for demo mode, just update state)
    // In production with Retell API, you'd call the API to end the call
    setCallStatus('ended');
    setShowLeadInfo(true);
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
  };

  const simulateMockCall = () => {
    // Simulate call for demo mode
    setCallStatus('connecting');
    
    setTimeout(() => {
      setCallStatus('connected');
      const mockTranscript: TranscriptEntry[] = [
        {
          role: 'agent',
          text: `Hi, thanks for calling ${businessProfile?.name}. This is your AI receptionist. How can I help you today?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        {
          role: 'user',
          text: "Hi, I'd like to schedule an appointment.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        {
          role: 'agent',
          text: "I'd be happy to help you schedule an appointment. Can I get your name and phone number?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        {
          role: 'user',
          text: "Sure, it's John Smith, and my number is 555-123-4567.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        {
          role: 'agent',
          text: 'Thank you, John. What type of service are you looking for?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        {
          role: 'user',
          text: 'I need a consultation.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        {
          role: 'agent',
          text: 'Perfect. What day and time works best for you?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        {
          role: 'user',
          text: 'Wednesday afternoon would be great.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        {
          role: 'agent',
          text: "Great! I've noted your preference for Wednesday afternoon. I'll send you a confirmation via SMS with the exact time. Is there anything else I can help you with?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        {
          role: 'user',
          text: "No, that's all. Thank you!",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        {
          role: 'agent',
          text: "You're welcome! Have a great day!",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ];

      // Start duration timer for mock call
      durationIntervalRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);

      mockTranscript.forEach((entry, index) => {
        setTimeout(() => {
          setTranscript(prev => [...prev, entry]);
          if (index === mockTranscript.length - 1) {
            setTimeout(() => {
              setCallStatus('ended');
              setShowLeadInfo(true);
              if (durationIntervalRef.current) {
                clearInterval(durationIntervalRef.current);
                durationIntervalRef.current = null;
              }
            }, 1000);
          }
        }, index * 2000);
      });
    }, 1000);
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, []);

  // Format call duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Validate email format
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate phone (exactly 10 digits, numeric only)
  const isValidPhone = (phone: string) => {
    const numericOnly = phone.replace(/\D/g, '');
    return numericOnly.length === 10;
  };

  // Handle lead capture submission
  const handleLeadCaptureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if at least one field is provided
    if (!leadEmail.trim() && !leadPhone.trim()) {
      alert('Please provide either an email or phone number');
      return;
    }

    // Validate email if provided
    if (leadEmail.trim() && !isValidEmail(leadEmail.trim())) {
      alert('Please enter a valid email address');
      return;
    }

    // Validate phone if provided
    if (leadPhone.trim() && !isValidPhone(leadPhone.trim())) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }

    setIsSubmittingLead(true);

    try {
      // Save to Supabase via API
      const response = await fetch('/api/demo-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: leadEmail.trim() || null,
          phone: leadPhone.trim() || null,
          product: 'receptionist',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Failed to save demo lead:', data.error);
        // Continue anyway - still close modal
      }

      // Store flag in localStorage to prevent showing popup again
      if (typeof window !== 'undefined') {
        localStorage.setItem('posentia_demo_submitted', 'true');
        if (leadEmail.trim()) {
          localStorage.setItem('posentia_demo_email', leadEmail.trim());
        }
        if (leadPhone.trim()) {
          localStorage.setItem('posentia_demo_phone', leadPhone.trim());
        }
      }
      
      setShowLeadCapture(false);
    } catch (error) {
      console.error('Error submitting lead info:', error);
      // Still close modal even if API fails
      if (typeof window !== 'undefined') {
        localStorage.setItem('posentia_demo_submitted', 'true');
      }
      setShowLeadCapture(false);
    } finally {
      setIsSubmittingLead(false);
    }
  };

  // Format phone input to only allow numbers
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-numeric characters
    if (value.length <= 10) {
      setLeadPhone(value);
    }
  };

  return (
    <>
      {/* Lead Capture Modal Popup */}
      {showLeadCapture && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Try Your AI Receptionist Demo</h2>
            <p className="text-slate-600 mb-6">
              Enter your contact information to start the interactive demo
            </p>
            
            <form onSubmit={handleLeadCaptureSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={leadEmail}
                  onChange={(e) => setLeadEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-slate-500">or</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={leadPhone}
                  onChange={handlePhoneChange}
                  placeholder="1234567890"
                  maxLength={10}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <p className="text-xs text-slate-500 mt-1">10 digits only</p>
              </div>
              
              <button
                type="submit"
                disabled={isSubmittingLead || (!leadEmail.trim() && !leadPhone.trim())}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {isSubmittingLead ? 'Starting Demo...' : 'Start Demo'}
              </button>
              
              <p className="text-xs text-slate-500 text-center">
                We'll use this to send you demo results and follow-up information
              </p>
            </form>
          </div>
        </div>
      )}
      
      <div className="space-y-6">
      {/* Business Lookup */}
      <DemoCard title="Enter Your Business" subtitle="We'll fetch your Google Business Profile data to personalize the AI receptionist">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Business Name
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isLoading) {
                    lookupBusiness();
                  }
                }}
                placeholder="e.g., Joe's Pizza, Downtown HVAC, etc."
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-400"
              />
              <button
                onClick={lookupBusiness}
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Looking up...' : 'Lookup'}
              </button>
            </div>
            <p className="text-sm text-slate-500 mt-2">
              We use Google Business Profile to personalize your AI receptionist greeting and responses
            </p>
          </div>
        </div>
      </DemoCard>

      {/* Business Profile Display */}
      {businessProfile && (
        <DemoCard title="Business Profile" subtitle="Fetched from Google Business Profile">
          <div className="space-y-3">
            <div>
              <span className="text-sm font-semibold text-blue-600">Name:</span>
              <p className="text-slate-900 mt-1">{businessProfile.name}</p>
            </div>
            <div>
              <span className="text-sm font-semibold text-blue-600">Category:</span>
              <p className="text-slate-900 mt-1">{businessProfile.category}</p>
            </div>
            <div>
              <span className="text-sm font-semibold text-blue-600">Hours:</span>
              <p className="text-slate-900 mt-1">{businessProfile.hours}</p>
            </div>
            <div>
              <span className="text-sm font-semibold text-blue-600">Rating:</span>
              <p className="text-slate-900 mt-1">⭐ {businessProfile.rating} / 5.0</p>
            </div>
            <div>
              <span className="text-sm font-semibold text-blue-600">Phone:</span>
              <p className="text-slate-900 mt-1">{businessProfile.phone}</p>
            </div>
            <div>
              <span className="text-sm font-semibold text-blue-600">Address:</span>
              <p className="text-slate-900 mt-1">{businessProfile.address}</p>
            </div>
          </div>
        </DemoCard>
      )}

      {/* Call Interface */}
      {businessProfile && (
        <DemoCard 
          title="Call in Browser" 
          subtitle={callStatus === 'idle' ? 'Start a live call with your AI receptionist' : callStatus === 'connected' ? `Call in progress • ${formatDuration(callDuration)}` : callStatus === 'ended' ? 'Call completed' : 'Call active'}
        >
          <div className="space-y-4">
            {callStatus === 'idle' && (
              <button
                onClick={startRetellCall}
                className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Start Call
              </button>
            )}

            {(callStatus === 'starting' || callStatus === 'connecting') && (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                <p className="text-sm text-slate-600">
                  {callStatus === 'starting' ? 'Initializing call...' : 'Connecting...'}
                </p>
              </div>
            )}

            {(callStatus === 'connected' || callStatus === 'ended') && transcript.length > 0 && (
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 max-h-96 overflow-y-auto">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-slate-900">Call Transcript</h4>
                  {callStatus === 'connected' && (
                    <button
                      onClick={endCall}
                      className="text-xs px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      End Call
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  {transcript.map((entry, idx) => (
                    <div key={idx} className={`flex ${entry.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        entry.role === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-white border border-slate-200 text-slate-900'
                      }`}>
                        <p className="text-xs font-medium mb-1 opacity-70">
                          {entry.role === 'user' ? 'Caller' : 'AI Receptionist'}
                        </p>
                        <p className="text-sm">{entry.text}</p>
                        <p className="text-xs mt-1 opacity-60">{entry.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {callStatus === 'connected' && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Call active</span>
                  </div>
                )}
              </div>
            )}

            {callStatus === 'ended' && (
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <p className="text-sm text-green-700 font-medium">✓ Call completed successfully</p>
                <p className="text-xs text-green-600 mt-1">Duration: {formatDuration(callDuration)}</p>
              </div>
            )}

            {callStatus === 'error' && (
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <p className="text-sm text-red-700 font-medium">✗ Call error occurred</p>
                <button
                  onClick={() => {
                    setCallStatus('idle');
                    setTranscript([]);
                    setCallDuration(0);
                  }}
                  className="mt-2 text-xs px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </DemoCard>
      )}

      {/* Lead Logging & Booking Info */}
      {showLeadInfo && businessProfile && (
        <DemoCard title="Lead Logging & Booking Info" subtitle="See how leads are captured and sent to your business">
          <div className="space-y-4">
            {/* Lead Logged Section */}
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 mb-2">Lead Logged to CRM</h4>
                  <div className="text-sm text-slate-700 space-y-1">
                    <p><span className="font-medium">Name:</span> John Smith</p>
                    <p><span className="font-medium">Phone:</span> (555) 123-4567</p>
                    <p><span className="font-medium">Reason:</span> Appointment request</p>
                    <p><span className="font-medium">Service:</span> Consultation</p>
                    <p><span className="font-medium">Urgency:</span> Normal</p>
                    <p><span className="font-medium">Timestamp:</span> {new Date().toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Info Section */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 mb-2">Booking Info Sent to Business</h4>
                  <div className="text-sm text-slate-700 space-y-1">
                    <p><span className="font-medium">Appointment Date:</span> {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                    <p><span className="font-medium">Time:</span> Afternoon (preferred)</p>
                    <p><span className="font-medium">Service:</span> Consultation</p>
                    <p><span className="font-medium">Customer:</span> John Smith - (555) 123-4567</p>
                    <p><span className="font-medium">Status:</span> Confirmed via SMS</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DemoCard>
      )}
      </div>
    </>
  );
}
