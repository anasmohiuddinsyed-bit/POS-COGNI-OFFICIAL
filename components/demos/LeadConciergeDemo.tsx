'use client';

import { useState, useCallback, useImperativeHandle, forwardRef, useEffect, useRef } from 'react';

type Message = {
  role: 'user' | 'agent';
  content: string;
  timestamp: string;
  isAuto?: boolean;
  type: 'sms' | 'email';
};

type Qualification = {
  intent: 'Buyer' | 'Seller' | 'Renter' | 'Other' | '';
  timeline: string;
  budget: string;
  location: string;
  preApproval: string;
  leadScore: 'Hot' | 'Warm' | 'Cold' | 'Spam' | '';
  nextAction: string;
};

export type DemoActions = {
  triggerSMSLead: (message?: string) => void;
  triggerFollowUp: () => void;
  triggerCRMPush: () => void;
};

const PROPERTIES = [
  {
    address: '123 Main Street',
    beds: 3,
    baths: 2,
    sqft: 1850,
    price: 725000,
    image: '/pos-house1.png',
  },
  {
    address: '456 Oak Avenue',
    beds: 4,
    baths: 3,
    sqft: 2450,
    price: 895000,
    image: '/pos-house2.png',
  },
  {
    address: '789 Pine Drive',
    beds: 2,
    baths: 2,
    sqft: 1650,
    price: 625000,
    image: '/pos-house3.png',
  },
  {
    address: '321 Elm Court',
    beds: 5,
    baths: 4,
    sqft: 3200,
    price: 1250000,
    image: '/pos-house4.png',
  },
];

const PhoneFrame = ({ children, title, id, qualification, isTyping }: { 
  children: React.ReactNode; 
  title: string; 
  id: string;
  qualification: Qualification;
  isTyping: boolean;
}) => (
  <div id={id} className="relative w-full max-w-sm mx-auto">
    <div className="relative bg-slate-900 rounded-[3rem] p-2 sm:p-3 shadow-2xl">
      <div className="bg-white rounded-[2.5rem] overflow-hidden relative h-[600px] sm:h-[700px] flex flex-col">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-20" />
        
        {/* Status Bar */}
        <div className="absolute top-2 left-0 right-0 px-6 flex justify-between items-center text-white/90 text-[10px] font-medium z-10">
          <span>9:41</span>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
            <div className="w-4 h-2 border border-white/60 rounded-sm">
              <div className="w-3 h-1.5 bg-white/90 rounded-sm m-0.5" />
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 pt-12 pb-4 px-6 flex items-center gap-3 border-b border-blue-800/20">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-white font-bold text-lg">SM</span>
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold text-sm">Sarah Martinez</h3>
            <p className="text-blue-100 text-xs">
              {qualification.leadScore ? `${qualification.leadScore} Lead • ` : ''}
              {isTyping ? 'POSENTIA is typing...' : 'Online'}
            </p>
          </div>
        </div>

        {children}

        {/* Home Indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-900 rounded-full" />
      </div>
    </div>
  </div>
);

export const LeadConciergeDemo = forwardRef<DemoActions>((props, ref) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesRef = useRef<Message[]>([]);
  const [qualification, setQualification] = useState<Qualification>({
    intent: '',
    timeline: '',
    budget: '',
    location: '',
    preApproval: '',
    leadScore: '',
    nextAction: '',
  });
  const [showListing, setShowListing] = useState(true); // Keep property cards visible
  const [currentSMSInput, setCurrentSMSInput] = useState('');
  const [currentEmailInput, setCurrentEmailInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [crmStatus, setCrmStatus] = useState<'idle' | 'sent'>('idle');
  const [followUpScheduled, setFollowUpScheduled] = useState(false);
  const [selectedPropertyIndex, setSelectedPropertyIndex] = useState(0);
  const [awaitingPropertySelection, setAwaitingPropertySelection] = useState(false);
  const [customPropertyRequirements, setCustomPropertyRequirements] = useState<string>('');
  const [startedFromPropertyCard, setStartedFromPropertyCard] = useState(false);
  const [conversationState, setConversationState] = useState<'initial' | 'property-selected' | 'asking-financing' | 'scheduling' | 'need-financing-help' | 'collecting-info' | 'booking-call' | 'other-property' | 'other-details' | 'completed'>('initial');
  
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

  // Keep messagesRef in sync with messages state
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Simulate initial lead message - when property card is clicked
  const simulateInitialLead = useCallback((type: 'sms' | 'email' = 'sms') => {
    const property = PROPERTIES[selectedPropertyIndex];
    const initialMessage: Message = {
      role: 'user',
      content: type === 'sms' 
        ? `Hi, I saw your listing for ${property.address} and I'm interested...`
        : `Hi,\n\nI saw your listing for ${property.address} and I'm very interested. Could you tell me more about the property?\n\nThanks!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type,
    };
    
    setMessages(prev => prev.filter(m => m.type !== type).concat([initialMessage]));
    setStartedFromPropertyCard(true);
    setConversationState('property-selected');
    
    // Auto-reply with property info and financing question
    setIsTyping(true);
    
    setTimeout(() => {
      const propertyInfo = type === 'sms'
        ? `Great choice! ${property.address}:\n\n• ${property.beds} bed, ${property.baths} bath\n• ${property.sqft.toLocaleString()} sqft\n• $${property.price.toLocaleString()}\n\nAre you pre-approved for financing, or do you need help with that?`
        : `Great choice! ${property.address}:\n\n• ${property.beds} bed, ${property.baths} bath\n• ${property.sqft.toLocaleString()} sqft\n• $${property.price.toLocaleString()}\n\nAre you pre-approved for financing, or do you need help with that?\n\nBest regards,\nSarah Martinez`;

      const autoReply: Message = {
        role: 'agent',
        content: propertyInfo,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAuto: true,
        type,
      };
      setMessages(prev => [...prev, autoReply]);
      
      setConversationState('asking-financing');
      setQualification(prev => ({
        ...prev,
        leadScore: 'Hot',
        nextAction: 'Qualify financing',
      }));
      setCrmStatus('sent');
      setIsTyping(false);
    }, 1000);
  }, [selectedPropertyIndex]);

  const handleSendMessage = useCallback(async (content: string, type: 'sms' | 'email' = 'sms') => {
    const trimmedContent = content.trim();
    if (!trimmedContent) return;

    const userMessage: Message = {
      role: 'user',
      content: trimmedContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type,
    };

    // Check if this is first message BEFORE adding it
    const currentMessages = messagesRef.current;
    const conversationMessagesBefore = currentMessages.filter(m => m.type === type);
    const isActuallyFirstMessage = conversationMessagesBefore.length === 0;

    // Add user message to state and update ref immediately
    setMessages(prev => {
      const updated = [...prev, userMessage];
      messagesRef.current = updated; // Update ref immediately
      return updated;
    });
    // Don't hide property cards - keep them visible so users can ask about other properties
    // setShowListing(false);
    
    // Reset startedFromPropertyCard flag when user types directly (first message without property context)
    if (isActuallyFirstMessage && !startedFromPropertyCard) {
      // This is a fresh start, ensure we're not in property card mode
      setStartedFromPropertyCard(false);
      setCustomPropertyRequirements('');
      setAwaitingPropertySelection(false);
    }
    
    // Clear the appropriate input immediately
    if (type === 'sms') {
      setCurrentSMSInput('');
    } else {
      setCurrentEmailInput('');
    }

    const lowerContent = trimmedContent.toLowerCase();
    // Use the currentMessages we already defined above
    const conversationMessages = conversationMessagesBefore.concat([userMessage]); // Include the message we just added
    const isFirstMessage = conversationMessages.length === 1; // Just added this message

    // STRUCTURED FLOW: Handle different conversation states
    // State 1: Initial greeting - ask to select property
    if (isFirstMessage && !startedFromPropertyCard && conversationState === 'initial') {
      setIsTyping(true);
      const propertyOptions = PROPERTIES.map((prop, idx) => `${idx + 1}. ${prop.address}`).join('\n');
      const responseMessage: Message = {
        role: 'agent',
        content: type === 'sms'
          ? `Hi! Thanks for reaching out. Which property are you interested in?\n\n${propertyOptions}\n\nOr type "other property" if you're looking for something else.`
          : `Hi!\n\nThanks for reaching out! Which property are you interested in?\n\n${propertyOptions}\n\nOr type "other property" if you're looking for something else.\n\nBest regards,\nSarah Martinez`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAuto: true,
        type,
      };
      setMessages(prev => [...prev, responseMessage]);
      setAwaitingPropertySelection(true);
      setConversationState('initial');
      setIsTyping(false);
      return;
    }

    // Handle property selection (1-4, address, or "other property")
    if (awaitingPropertySelection && conversationState === 'initial') {
      // Check if user selected a property by number (1-4) or address
      const selectedIdx = PROPERTIES.findIndex((prop, idx) => 
        lowerContent === `${idx + 1}` ||
        lowerContent.includes(prop.address.toLowerCase()) ||
        trimmedContent === prop.address
      );
      
      if (selectedIdx >= 0) {
        // Property selected - show info and ask about financing
        setSelectedPropertyIndex(selectedIdx);
        setAwaitingPropertySelection(false);
        setConversationState('property-selected');
        const property = PROPERTIES[selectedIdx];
        
        setIsTyping(true);
        const responseMessage: Message = {
          role: 'agent',
          content: type === 'sms'
            ? `Great choice! ${property.address}:\n\n• ${property.beds} bed, ${property.baths} bath\n• ${property.sqft.toLocaleString()} sqft\n• $${property.price.toLocaleString()}\n\nAre you pre-approved for financing, or do you need help with that?`
            : `Great choice! ${property.address}:\n\n• ${property.beds} bed, ${property.baths} bath\n• ${property.sqft.toLocaleString()} sqft\n• $${property.price.toLocaleString()}\n\nAre you pre-approved for financing, or do you need help with that?\n\nBest regards,\nSarah Martinez`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isAuto: true,
          type,
        };
        setMessages(prev => [...prev, responseMessage]);
        setConversationState('asking-financing');
        setIsTyping(false);
        return;
      } else if (lowerContent.includes('other property') || lowerContent.includes('other')) {
        // User wants other property - start custom flow
        setAwaitingPropertySelection(false);
        setConversationState('other-property');
        setCustomPropertyRequirements('property-type');
        
        setIsTyping(true);
        const responseMessage: Message = {
          role: 'agent',
          content: type === 'sms'
            ? `No problem! What type of property are you looking for: apartment or house?`
            : `No problem! What type of property are you looking for: apartment or house?\n\nBest regards,\nSarah Martinez`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isAuto: true,
          type,
        };
        setMessages(prev => [...prev, responseMessage]);
        setIsTyping(false);
        return;
      } else {
        // Invalid selection - ask again
        setIsTyping(true);
        const propertyOptions = PROPERTIES.map((prop, idx) => `${idx + 1}. ${prop.address}`).join('\n');
        const responseMessage: Message = {
          role: 'agent',
          content: type === 'sms'
            ? `Which property are you interested in?\n\n${propertyOptions}\n\nOr type "other property" if you're looking for something else.`
            : `Which property are you interested in?\n\n${propertyOptions}\n\nOr type "other property" if you're looking for something else.\n\nBest regards,\nSarah Martinez`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isAuto: true,
          type,
        };
        setMessages(prev => [...prev, responseMessage]);
        setIsTyping(false);
        return;
      }
    }

    // Handle financing question (after property selected)
    if (conversationState === 'asking-financing') {
      const lowerContent = trimmedContent.toLowerCase();
      const needsHelp = lowerContent.includes('need help') || 
                        lowerContent.includes('need assistance') ||
                        lowerContent.includes('help') && !lowerContent.includes('no help') ||
                        lowerContent.includes('not pre') ||
                        lowerContent.includes('not pre-approved') ||
                        lowerContent.includes('don\'t have') ||
                        lowerContent === 'no';
      
      if (needsHelp) {
        // They need financing help - collect info and book a call
        setConversationState('need-financing-help');
        
        setIsTyping(true);
        const responseMessage: Message = {
          role: 'agent',
          content: type === 'sms'
            ? `No problem! Our team can help you with financing options. What's your budget range? This helps us find the best options for you.`
            : `No problem! Our team can help you with financing options.\n\nWhat's your budget range? This helps us find the best options for you.\n\nBest regards,\nSarah Martinez`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isAuto: true,
          type,
        };
        setMessages(prev => [...prev, responseMessage]);
        setConversationState('collecting-info');
        setIsTyping(false);
        return;
      } else {
        // They're pre-approved or paying upfront - go to scheduling
        setConversationState('scheduling');
        
        setIsTyping(true);
        const responseMessage: Message = {
          role: 'agent',
          content: type === 'sms'
            ? `Perfect! When would you like to schedule a viewing? (e.g., Monday, Tuesday)`
            : `Perfect! When would you like to schedule a viewing? (e.g., Monday, Tuesday)\n\nBest regards,\nSarah Martinez`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isAuto: true,
          type,
        };
        setMessages(prev => [...prev, responseMessage]);
        setIsTyping(false);
        return;
      }
    }

    // Handle collecting info for financing help (budget, timeline, etc.)
    if (conversationState === 'collecting-info') {
      const lowerContent = trimmedContent.toLowerCase();
      
      // Check all previous user messages for budget and timeline to avoid re-asking
      const previousUserMessages = messages.filter(m => m.role === 'user' && m.type === type);
      const previousText = previousUserMessages.map(m => m.content.toLowerCase()).join(' ');
      
      // Improved budget detection - handles $1M+, $900k, 800k, etc.
      const budgetPattern = /\$?(\d+)\s*[Mm]\+|\$?(\d+)\s*[Kk]|\$?(\d+)\s*(thousand|k)/;
      const hasBudgetInMessage = budgetPattern.test(trimmedContent);
      
      // Check if we already have budget from previous messages (check state AND previous messages)
      const alreadyHasBudget = (qualification.budget && qualification.budget.trim() !== '') ||
                                budgetPattern.test(previousText);
      
      // Improved timeline detection
      const hasTimelineInMessage = lowerContent.includes('month') || 
                         lowerContent.includes('week') ||
                         lowerContent.includes('day') ||
                         lowerContent.includes('months') ||
                         lowerContent.includes('weeks') ||
                         lowerContent.includes('days') ||
                         lowerContent.match(/\d+\s*-\s*\d+\s*(month|week|day|months|weeks|days)/i) ||
                         lowerContent.match(/\d+\s*(month|week|day|months|weeks|days)/i) ||
                         lowerContent.includes('soon') ||
                         lowerContent.includes('immediately') ||
                         lowerContent.includes('asap') ||
                         lowerContent.includes('within');
      
      // Check if we already have timeline from previous messages (check state AND previous messages)
      const alreadyHasTimeline = (qualification.timeline && qualification.timeline.trim() !== '') ||
                                  previousText.includes('month') ||
                                  previousText.includes('week') ||
                                  previousText.includes('day') ||
                                  previousText.match(/\d+\s*-\s*\d+\s*(month|week|day|months|weeks|days)/i);
      
      // Extract and store budget if provided in this message (and we don't already have it)
      if (hasBudgetInMessage && !alreadyHasBudget) {
        let budget = '';
        // Match $1M+, $900k, 800k formats
        const mPlusMatch = trimmedContent.match(/\$?(\d+)\s*[Mm]\+/);
        const kMatch = trimmedContent.match(/\$?(\d+)\s*[Kk]/);
        const thousandMatch = trimmedContent.match(/\$?(\d+)\s*(thousand|k)/);
        
        if (mPlusMatch) {
          budget = `$${mPlusMatch[1]}M+`;
        } else if (kMatch) {
          budget = `$${kMatch[1]}k`;
        } else if (thousandMatch) {
          budget = `$${thousandMatch[1]}k`;
        } else {
          budget = trimmedContent;
        }
        
        setQualification(prev => ({
          ...prev,
          budget,
        }));
      }
      
      // Extract timeline if provided in this message (improved extraction)
      if (hasTimelineInMessage && !alreadyHasTimeline) {
        // Try to extract timeline patterns
        let timeline = '';
        
        // Match patterns like "1-3 months", "3-6 months", "6+ months"
        const rangeMatch = trimmedContent.match(/(\d+\s*-\s*\d+|\d+\+)\s*(month|week|day|months|weeks|days)/i);
        if (rangeMatch) {
          timeline = `${rangeMatch[1]} ${rangeMatch[2]}`;
        }
        // Match patterns like "3 months", "30 days", "1 month"
        else {
          const singleMatch = trimmedContent.match(/(\d+)\s*(month|week|day|months|weeks|days)/i);
          if (singleMatch) {
            timeline = `${singleMatch[1]} ${singleMatch[2]}`;
          }
          // Match "within 30 days", "within 1-3 months"
          else if (lowerContent.includes('within')) {
            const withinMatch = trimmedContent.match(/within\s+([^.!?]+)/i);
            timeline = withinMatch ? `Within ${withinMatch[1]}` : trimmedContent;
          }
          // Fallback to full message if it seems timeline-related
          else if (lowerContent.includes('month') || lowerContent.includes('week') || lowerContent.includes('day')) {
            timeline = trimmedContent;
          }
        }
        
        if (timeline) {
          setQualification(prev => ({
            ...prev,
            timeline: timeline.trim(),
          }));
        }
      }
      
      // Determine what we have now (including current message + previous messages)
      // Check ALL messages together to avoid missing what was just said
      const allMessagesText = (previousText + ' ' + lowerContent).toLowerCase();
      const hasBudget = hasBudgetInMessage || alreadyHasBudget || budgetPattern.test(allMessagesText);
      const hasTimeline = hasTimelineInMessage || alreadyHasTimeline || 
                          (allMessagesText.includes('month') || allMessagesText.includes('week') || allMessagesText.includes('day') ||
                           allMessagesText.match(/\d+\s*-\s*\d+\s*(month|week|day|months|weeks|days)/i));
      
      // If we have both budget and timeline, book a call (STOP asking questions)
      if (hasBudget && hasTimeline) {
        // Got enough info, book a call
        setConversationState('booking-call');
        
        setIsTyping(true);
        const responseMessage: Message = {
          role: 'agent',
          content: type === 'sms'
            ? `Perfect! Our financing specialist would love to help you. Can I schedule a quick call? What day and time works best for you?`
            : `Perfect! Our financing specialist would love to help you.\n\nCan I schedule a quick call? What day and time works best for you?\n\nBest regards,\nSarah Martinez`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isAuto: true,
          type,
        };
        setMessages(prev => [...prev, responseMessage]);
        setIsTyping(false);
        return;
      } 
      // Only ask ONE question at a time - ask for what we're missing
      else if (!hasBudget) {
        // Don't have budget - ask for budget (ONLY if we don't have it)
        setIsTyping(true);
        const responseMessage: Message = {
          role: 'agent',
          content: type === 'sms'
            ? `What's your budget range?`
            : `What's your budget range?\n\nBest regards,\nSarah Martinez`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isAuto: true,
          type,
        };
        setMessages(prev => [...prev, responseMessage]);
        setIsTyping(false);
        return;
      } 
      else if (!hasTimeline) {
        // Have budget but not timeline - ask for timeline (ONLY if we don't have it)
        setIsTyping(true);
        const responseMessage: Message = {
          role: 'agent',
          content: type === 'sms'
            ? `Great! What's your timeline? When are you looking to move?`
            : `Great! What's your timeline? When are you looking to move?\n\nBest regards,\nSarah Martinez`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isAuto: true,
          type,
        };
        setMessages(prev => [...prev, responseMessage]);
        setIsTyping(false);
        return;
      }
    }

    // Handle booking call (after collecting financing info)
    if (conversationState === 'booking-call') {
      setConversationState('completed');
      
      setIsTyping(true);
      const responseMessage: Message = {
        role: 'agent',
        content: type === 'sms'
          ? `Excellent! I've scheduled a call with our financing specialist for ${trimmedContent}. You'll receive confirmation details via email. Our team will help you explore all financing options. Thank you!`
          : `Excellent! I've scheduled a call with our financing specialist for ${trimmedContent}.\n\nYou'll receive confirmation details via email. Our team will help you explore all financing options.\n\nThank you!\n\nBest regards,\nSarah Martinez`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAuto: true,
        type,
      };
      setMessages(prev => [...prev, responseMessage]);
      
      // Tag as "Financing Help" in CRM
      setQualification(prev => ({
        ...prev,
        leadScore: 'Hot',
        nextAction: 'Booked - Financing call scheduled',
        preApproval: 'Needs financing help',
      }));
      setCrmStatus('sent');
      setIsTyping(false);
      return;
    }

    // Handle scheduling (after financing answer)
    if (conversationState === 'scheduling') {
      setConversationState('completed');
      
      setIsTyping(true);
      const responseMessage: Message = {
        role: 'agent',
        content: type === 'sms'
          ? `Perfect! I've scheduled a viewing for ${trimmedContent}. We'll send you confirmation details. Thank you!`
          : `Perfect! I've scheduled a viewing for ${trimmedContent}.\n\nWe'll send you confirmation details.\n\nThank you!\n\nBest regards,\nSarah Martinez`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAuto: true,
        type,
      };
      setMessages(prev => [...prev, responseMessage]);
      
      // Tag as "Booked" in CRM
      setQualification(prev => ({
        ...prev,
        leadScore: 'Hot',
        nextAction: 'Booked - Viewing scheduled',
      }));
      setCrmStatus('sent');
      setIsTyping(false);
      return;
    }

    // Other Property Flow: Step 2 - After property type, ask bedrooms
    if (customPropertyRequirements === 'property-type' && conversationState === 'other-property') {
      const propertyType = lowerContent.includes('apartment') ? 'Apartment' : 
                          lowerContent.includes('house') ? 'House' : 'Property';
      
      setIsTyping(true);
      const responseMessage: Message = {
        role: 'agent',
        content: type === 'sms'
          ? `Great! How many bedrooms are you looking for?`
          : `Great! How many bedrooms are you looking for?\n\nBest regards,\nSarah Martinez`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAuto: true,
        type,
      };
      setMessages(prev => [...prev, responseMessage]);
      setCustomPropertyRequirements('bedrooms');
      setQualification(prev => ({
        ...prev,
        location: propertyType,
      }));
      setIsTyping(false);
      return;
    }

    // Other Property Flow: Step 3 - After bedrooms, ask price
    if (customPropertyRequirements === 'bedrooms' && conversationState === 'other-property') {
      setIsTyping(true);
      const responseMessage: Message = {
        role: 'agent',
        content: type === 'sms'
          ? `Perfect! What's your price range?`
          : `Perfect! What's your price range?\n\nBest regards,\nSarah Martinez`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAuto: true,
        type,
      };
      setMessages(prev => [...prev, responseMessage]);
      setCustomPropertyRequirements('price');
      setIsTyping(false);
      return;
    }

    // Other Property Flow: Step 4 - After price, convert to scheduling/booking call
    if (customPropertyRequirements === 'price' && conversationState === 'other-property') {
      setConversationState('booking-call');
      setCustomPropertyRequirements('completed');
      
      setIsTyping(true);
      const responseMessage: Message = {
        role: 'agent',
        content: type === 'sms'
          ? `Perfect! I have all the details I need. Let me find you the perfect property! Can I schedule a quick call with you to discuss your preferences and show you some personalized options? What day works best for you?`
          : `Perfect! I have all the details I need.\n\nLet me find you the perfect property! Can I schedule a quick call with you to discuss your preferences and show you some personalized options? What day works best for you?\n\nBest regards,\nSarah Martinez`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAuto: true,
        type,
      };
      setMessages(prev => [...prev, responseMessage]);
      
      // Extract budget from response
      const priceMatch = trimmedContent.match(/\$?(\d+)[kK]|\$?(\d+)\s*(thousand|k)/);
      const budget = priceMatch ? `$${priceMatch[1] || priceMatch[2]}k` : trimmedContent;
      
      // Update qualification for CRM
      setQualification(prev => ({
        ...prev,
        budget,
        leadScore: 'Warm',
        nextAction: 'Booked - Call scheduled',
      }));
      setCrmStatus('sent');
      setIsTyping(false);
      return;
    }

    // Skip old property selection logic - handled above now
    // Legacy code block removed
    if (false && awaitingPropertySelection && customPropertyRequirements !== 'property-type') {
      // Check if user selected a property from the cards
      const selectedIdx = PROPERTIES.findIndex((prop, idx) => 
        lowerContent.includes(prop.address.toLowerCase()) || 
        lowerContent.includes(`property ${idx + 1}`) ||
        lowerContent === `${idx + 1}` ||
        trimmedContent === prop.address
      );
      
      if (selectedIdx >= 0) {
        setSelectedPropertyIndex(selectedIdx);
        setAwaitingPropertySelection(false);
        // Continue with normal conversation - let it fall through to AI API call
      } else if (lowerContent.includes('different') || lowerContent.includes('other') || lowerContent.includes('something else')) {
        // User wants a different property - switch to qualification flow
        setAwaitingPropertySelection(false);
        setIsTyping(true);
        const responseMessage: Message = {
          role: 'agent',
          content: type === 'sms'
            ? `No problem! What type of property are you looking for: apartment or house?`
            : `No problem! What type of property are you looking for: apartment or house?\n\nBest regards,\nSarah Martinez`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isAuto: true,
          type,
        };
        setMessages(prev => [...prev, responseMessage]);
        setCustomPropertyRequirements('property-type');
        setIsTyping(false);
        return;
      } else {
        // User response doesn't match a property - ask again
        setIsTyping(true);
        const propertyOptions = PROPERTIES.slice(0, 3).map((prop, idx) => `${idx + 1}. ${prop.address}`).join('\n');
        const responseMessage: Message = {
          role: 'agent',
          content: type === 'sms'
            ? `Which property are you interested in?\n\n${propertyOptions}\n\nOr type "different" if you're looking for something else.`
            : `Which property are you interested in?\n\n${propertyOptions}\n\nOr reply with "different" if you're looking for something else.\n\nBest regards,\nSarah Martinez`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isAuto: true,
          type,
        };
        setMessages(prev => [...prev, responseMessage]);
        setIsTyping(false);
        return;
      }
    }

    // If flow is completed, don't respond
    if (conversationState === 'completed' || customPropertyRequirements === 'completed') {
      return; // Flow is done
    }

    // All flows are now structured and handled above
    // If we reach here, it means we didn't match any structured flow
    // This shouldn't happen in normal operation, but handle gracefully
    console.warn('Unexpected conversation state - no handler matched');
    return;
  }, [selectedPropertyIndex, awaitingPropertySelection, customPropertyRequirements, startedFromPropertyCard, conversationState]);

  useImperativeHandle(ref, () => ({
    triggerSMSLead: (message?: string) => {
      setMessages(prev => {
        if (prev.length === 0) {
          simulateInitialLead('sms');
          return prev;
        } else if (message) {
          handleSendMessage(message, 'sms');
          return prev;
        }
        return prev;
      });
    },
    triggerFollowUp: () => {
      handleSendMessage('Budget 700k', 'sms');
    },
    triggerCRMPush: () => {
      setCrmStatus('sent');
    },
  }));

  // Auto-scroll messages
  useEffect(() => {
    const smsContainer = document.getElementById('sms-messages');
    const emailContainer = document.getElementById('email-messages');
    if (smsContainer) smsContainer.scrollTop = smsContainer.scrollHeight;
    if (emailContainer) emailContainer.scrollTop = emailContainer.scrollHeight;
  }, [messages, isTyping]);

  const smsMessages = messages.filter(m => m.type === 'sms');
  const emailMessages = messages.filter(m => m.type === 'email');
  
  const currentProperty = PROPERTIES[selectedPropertyIndex];
  
  // Generate quick replies based on conversation state
  let quickReplies: string[] = [];
  if (conversationState === 'initial' && awaitingPropertySelection) {
    // Show property numbers and "other property" option
    quickReplies = PROPERTIES.slice(0, 4).map((_, idx) => `${idx + 1}`);
    quickReplies.push('Other property');
  } else if (conversationState === 'other-property' && customPropertyRequirements === 'property-type') {
    quickReplies = ['Apartment', 'House'];
  } else if (conversationState === 'other-property' && customPropertyRequirements === 'bedrooms') {
    quickReplies = ['1', '2', '3', '4+'];
  } else if (conversationState === 'asking-financing') {
    quickReplies = ['Yes, pre-approved', 'Need help with financing', 'Paying upfront'];
  } else if (conversationState === 'collecting-info') {
    // Check last agent message to see if asking for timeline or budget
    const lastAgentMessage = messages.filter(m => m.role === 'agent').pop()?.content.toLowerCase() || '';
    if (lastAgentMessage.includes('timeline') || lastAgentMessage.includes('looking to move')) {
      // Asking for timeline
      quickReplies = ['Within 30 days', '1-3 months', '3-6 months', '6+ months'];
    } else {
      // Asking for budget
      quickReplies = ['$500k', '$700k', '$900k', '$1M+'];
    }
  } else if (conversationState === 'booking-call') {
    quickReplies = ['Monday', 'Tuesday', 'Wednesday', 'Thursday'];
  } else if (conversationState === 'scheduling') {
    quickReplies = ['Monday', 'Tuesday', 'Wednesday', 'Thursday'];
  } else if (conversationState === 'completed') {
    quickReplies = [];
  }

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
          product: 'lead_concierge',
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
    <div className="py-8">
      {/* Lead Capture Modal Popup */}
      {showLeadCapture && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Try the Live Demo</h2>
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Property Carousel */}
        {showListing && (
          <div id="demo-inbound" className="mb-8">
            <div className="max-w-md mx-auto">
              {/* Property Card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 sm:p-6 border border-blue-200 relative overflow-hidden">
                {/* Property Image */}
                <div className="bg-slate-200 rounded-xl h-48 mb-4 relative overflow-hidden">
                  <img 
                    src={currentProperty.image} 
                    alt={currentProperty.address}
                    className="w-full h-full object-cover"
                  />
                  {/* Property Counter */}
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold text-slate-700">
                    {selectedPropertyIndex + 1} / {PROPERTIES.length}
                  </div>
                </div>
                
                {/* Property Details */}
                <h4 className="font-bold text-slate-900 text-lg mb-1">{currentProperty.address}</h4>
                <p className="text-slate-600 text-sm mb-2">
                  {currentProperty.beds} bed • {currentProperty.baths} bath • {currentProperty.sqft.toLocaleString()} sqft
                </p>
                <p className="text-blue-600 font-bold text-2xl mb-4">
                  ${currentProperty.price.toLocaleString()}
                </p>

                {/* Navigation Arrows */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setSelectedPropertyIndex((prev) => (prev === 0 ? PROPERTIES.length - 1 : prev - 1))}
                    className="w-10 h-10 rounded-full bg-white hover:bg-slate-100 border border-slate-300 flex items-center justify-center transition-colors"
                    aria-label="Previous property"
                  >
                    <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  {/* Dots Indicator */}
                  <div className="flex gap-2">
                    {PROPERTIES.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedPropertyIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          idx === selectedPropertyIndex ? 'bg-blue-600 w-6' : 'bg-slate-300'
                        }`}
                        aria-label={`Go to property ${idx + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => setSelectedPropertyIndex((prev) => (prev === PROPERTIES.length - 1 ? 0 : prev + 1))}
                    className="w-10 h-10 rounded-full bg-white hover:bg-slate-100 border border-slate-300 flex items-center justify-center transition-colors"
                    aria-label="Next property"
                  >
                    <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => simulateInitialLead('sms')}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-colors"
                  >
                    Send SMS
                  </button>
                  <button
                    onClick={() => simulateInitialLead('email')}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-colors"
                  >
                    Send Email
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-start">
          {/* SMS Phone */}
          <PhoneFrame title="SMS" id="demo-conversation" qualification={qualification} isTyping={isTyping}>
            <div id="sms-messages" className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gradient-to-b from-slate-50 to-white">
              {smsMessages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-slate-400 text-sm">No messages yet</p>
                </div>
              ) : (
                smsMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] ${msg.role === 'user' ? 'flex flex-col items-end' : 'flex flex-col items-start'}`}>
                      {msg.isAuto && (
                        <div className="flex items-center gap-1 mb-1 px-2">
                          <span className="text-[10px] text-slate-500">POSENTIA</span>
                          <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      <div className={`rounded-2xl px-4 py-2.5 ${
                        msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-900 rounded-tl-sm shadow-sm'
                      }`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        <p className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-blue-100' : 'text-slate-400'}`}>
                          {msg.timestamp}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
              {isTyping && smsMessages.length > 0 && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="border-t border-slate-200 bg-white px-4 py-3">
              {smsMessages.length > 0 && smsMessages.length < 10 && (
                <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
                  {quickReplies.map((reply, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(reply, 'sms')}
                      className="flex-shrink-0 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs transition-colors whitespace-nowrap"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex gap-2 items-end">
                <input
                  key="sms-input"
                  type="text"
                  value={currentSMSInput}
                  onChange={(e) => setCurrentSMSInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      const message = currentSMSInput.trim();
                      if (message) {
                        setCurrentSMSInput('');
                        handleSendMessage(message, 'sms');
                      }
                    }
                  }}
                  placeholder={smsMessages.length === 0 ? "Type a message to start..." : "Type a message..."}
                  className="flex-1 px-4 py-2.5 text-sm border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => {
                    const message = currentSMSInput.trim();
                    if (message) {
                      setCurrentSMSInput('');
                      handleSendMessage(message, 'sms');
                    }
                  }}
                  disabled={!currentSMSInput.trim()}
                  className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-full flex items-center justify-center text-white transition-colors flex-shrink-0"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </PhoneFrame>

          {/* Email Phone */}
          <PhoneFrame title="Email" id="demo-email" qualification={qualification} isTyping={isTyping}>
            <div id="email-messages" className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gradient-to-b from-slate-50 to-white">
              {emailMessages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-slate-400 text-sm">No emails yet</p>
                </div>
              ) : (
                emailMessages.map((msg, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-xs font-semibold text-slate-900">
                          {msg.role === 'user' ? 'You' : 'Sarah Martinez'}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {msg.role === 'user' ? 'you@example.com' : 'sarah@realestate.com'}
                        </p>
                      </div>
                      {msg.isAuto && (
                        <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">POSENTIA</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap mb-2">{msg.content}</p>
                    <p className="text-[10px] text-slate-400">{msg.timestamp}</p>
                  </div>
                ))
              )}
              {isTyping && emailMessages.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
                  <p className="text-xs text-slate-500">POSENTIA is composing...</p>
                </div>
              )}
            </div>
            <div className="border-t border-slate-200 bg-white px-4 py-3">
              <textarea
                key="email-input"
                value={currentEmailInput}
                onChange={(e) => setCurrentEmailInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    e.preventDefault();
                    const message = currentEmailInput.trim();
                    if (message) {
                      setCurrentEmailInput('');
                      handleSendMessage(message, 'email');
                    }
                  }
                }}
                placeholder={emailMessages.length === 0 ? "Type an email to start..." : "Type your reply... (Ctrl+Enter to send)"}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder:text-slate-400 resize-none"
              />
              <button
                type="button"
                onClick={() => {
                  const message = currentEmailInput.trim();
                  if (message) {
                    setCurrentEmailInput('');
                    handleSendMessage(message, 'email');
                  }
                }}
                disabled={!currentEmailInput.trim()}
                className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-2 rounded-xl text-sm transition-colors"
              >
                Send Email
              </button>
            </div>
          </PhoneFrame>

          {/* CRM Desktop Window */}
          <div id="demo-crm-preview" className="bg-white rounded-xl border-2 border-slate-300 shadow-2xl overflow-hidden h-[500px] sm:h-[600px] lg:h-[700px] flex flex-col">
            {/* Window Header */}
            <div className="bg-slate-800 px-4 py-2 flex items-center gap-2 border-b border-slate-700">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="flex-1 text-center">
                <span className="text-xs text-slate-300 font-medium">CRM Dashboard</span>
              </div>
            </div>

            {/* CRM Content */}
            <div className="flex-1 overflow-y-auto bg-slate-50">
              {/* Lead Card */}
              <div className="p-6">
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm mb-4">
                  <div className="p-5 border-b border-slate-200">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">Demo Lead</h3>
                        <p className="text-sm text-slate-600">***-***-1234</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        qualification.leadScore === 'Hot' ? 'bg-red-100 text-red-700' :
                        qualification.leadScore === 'Warm' ? 'bg-amber-100 text-amber-700' :
                        qualification.leadScore === 'Cold' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {qualification.leadScore || 'Unscored'}
                      </span>
                    </div>
                    
                    {qualification.intent && (
                      <div className="flex gap-2 flex-wrap">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded font-medium">{qualification.intent}</span>
                        {qualification.budget && <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">{qualification.budget}</span>}
                        <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded">Zillow</span>
                      </div>
                    )}
                  </div>

                  {/* Qualification Section */}
                  <div id="demo-qualification" className="p-5 border-b border-slate-200">
                    <h4 className="text-sm font-bold text-slate-900 mb-3">Qualification Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-slate-500 mb-1">Intent</p>
                        <p className="font-semibold text-slate-900">{qualification.intent || '—'}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 mb-1">Timeline</p>
                        <p className="font-semibold text-slate-900">{qualification.timeline || '—'}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 mb-1">Budget</p>
                        <p className="font-semibold text-slate-900">{qualification.budget || '—'}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 mb-1">Pre-approval</p>
                        <p className="font-semibold text-slate-900">{qualification.preApproval || '—'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Notes Section */}
                  <div className="p-5 border-b border-slate-200">
                    <h4 className="text-sm font-bold text-slate-900 mb-2">AI-Generated Notes</h4>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      AI-qualified lead from Zillow. {qualification.intent && `Intent: ${qualification.intent}.`} {qualification.timeline && `Timeline: ${qualification.timeline}.`} {qualification.budget && `Budget: ${qualification.budget}.`}
                      {messages.length > 0 && ` Conversation history: ${messages.length} messages exchanged.`}
                    </p>
                  </div>

                  {/* Next Action */}
                  {qualification.nextAction && (
                    <div className="p-5 bg-amber-50 border-b border-amber-100">
                      <h4 className="text-sm font-bold text-slate-900 mb-2">Next Best Action</h4>
                      <p className="text-xs text-slate-700 font-semibold">{qualification.nextAction}</p>
                    </div>
                  )}

                  {/* Follow-Up Sequence */}
                  <div id="demo-followup" className="p-5">
                    <h4 className="text-sm font-bold text-slate-900 mb-3">Follow-Up Sequence</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-xs">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center font-semibold ${
                          messages.length > 2 ? 'bg-green-100 text-green-700' : messages.length > 0 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400'
                        }`}>
                          {messages.length > 2 ? '✓' : messages.length > 0 ? '1' : '—'}
                        </div>
                        <div className="flex-1">
                          <p className="text-slate-900 font-medium">Day 0: Initial Reply</p>
                          <p className="text-slate-500 text-[10px]">{messages.length > 0 ? 'Sent' : 'Pending'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center font-semibold ${
                          qualification.timeline ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400'
                        }`}>
                          2
                        </div>
                        <div className="flex-1">
                          <p className="text-slate-900 font-medium">Day 1: Follow-up</p>
                          <p className="text-slate-500 text-[10px]">{followUpScheduled ? 'Scheduled' : 'Will trigger if no response'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center font-semibold bg-slate-100 text-slate-400">
                          3
                        </div>
                        <div className="flex-1">
                          <p className="text-slate-900 font-medium">Day 3: Re-engagement</p>
                          <p className="text-slate-500 text-[10px]">Automated</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center font-semibold bg-slate-100 text-slate-400">
                          4
                        </div>
                        <div className="flex-1">
                          <p className="text-slate-900 font-medium">Day 7: Final touch</p>
                          <p className="text-slate-500 text-[10px]">Automated</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CRM Status */}
                  <div className="p-4 bg-green-50 border-t border-green-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-green-700 font-medium">CRM Status:</span>
                      <span className="text-xs text-green-600 font-semibold">
                        {crmStatus === 'sent' ? '✓ Synced to CRM' : 'Ready to sync'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

LeadConciergeDemo.displayName = 'LeadConciergeDemo';
