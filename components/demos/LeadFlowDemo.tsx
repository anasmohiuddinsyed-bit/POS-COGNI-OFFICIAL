'use client';

import { useState, useCallback } from 'react';
import { DemoCard } from './DemoCard';
import { AuditLogPanel } from './AuditLogPanel';

type LogEntry = {
  timestamp: string;
  type: 'inbound' | 'ai' | 'reply' | 'followup' | 'crm' | 'error';
  message: string;
  data?: any;
};

export function LeadFlowDemo() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [apiKey, setApiKey] = useState('');
  const [isSandboxMode, setIsSandboxMode] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'connected' | 'failed'>('idle');
  const [leadData, setLeadData] = useState({
    name: '',
    phone: '',
    message: '',
  });

  const addLog = useCallback((entry: Omit<LogEntry, 'timestamp'>) => {
    setLogs((prev) => [
      ...prev,
      {
        ...entry,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  }, []);

  const redactPhone = (phone: string) => {
    if (phone.length <= 4) return '****';
    return `***-***-${phone.slice(-4)}`;
  };

  const testConnection = async () => {
    if (!apiKey.trim()) {
      addLog({
        type: 'error',
        message: 'Please enter an API key',
      });
      return;
    }

    setConnectionStatus('testing');
    addLog({
      type: 'crm',
      message: 'Testing Follow Up Boss connection...',
    });

    try {
      const response = await fetch('/api/fub/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setConnectionStatus('connected');
        setIsSandboxMode(false);
        addLog({
          type: 'crm',
          message: '✓ Follow Up Boss connection successful',
          data: { connected: true },
        });
      } else {
        setConnectionStatus('failed');
        setIsSandboxMode(true);
        addLog({
          type: 'error',
          message: `Connection failed: ${data.error || 'Unknown error'}. Using sandbox mode.`,
        });
      }
    } catch (error) {
      setConnectionStatus('failed');
      setIsSandboxMode(true);
      addLog({
        type: 'error',
        message: `Connection error: ${error instanceof Error ? error.message : 'Unknown'}. Using sandbox mode.`,
      });
    }
  };

  const simulateSMSLead = async () => {
    if (!leadData.name.trim() || !leadData.phone.trim() || !leadData.message.trim()) {
      addLog({
        type: 'error',
        message: 'Please fill in name, phone, and message',
      });
      return;
    }

    // Add inbound log
    addLog({
      type: 'inbound',
      message: `SMS received from ${redactPhone(leadData.phone)}`,
      data: {
        from: redactPhone(leadData.phone),
        body: leadData.message,
        timestamp: new Date().toISOString(),
      },
    });

    // Simulate AI processing
    setTimeout(() => {
      addLog({
        type: 'ai',
        message: 'AI classifying intent and extracting fields...',
      });

      setTimeout(() => {
        const intent = leadData.message.toLowerCase().includes('buy') ? 'buying' :
                      leadData.message.toLowerCase().includes('sell') ? 'selling' :
                      leadData.message.toLowerCase().includes('rent') ? 'renting' : 'inquiry';

        addLog({
          type: 'ai',
          message: `Intent: ${intent.toUpperCase()}. Extracted: name="${leadData.name}", phone="${redactPhone(leadData.phone)}"`,
          data: {
            intent,
            name: leadData.name,
            phone: redactPhone(leadData.phone),
          },
        });

        // Generate reply
        setTimeout(() => {
          const replyText = `Hi ${leadData.name}! Thanks for reaching out. I'll connect you with an agent right away. Can you share your preferred timeframe?`;
          
          addLog({
            type: 'reply',
            message: `Reply generated and sent`,
            data: {
              to: redactPhone(leadData.phone),
              body: replyText,
            },
          });

          // Follow-up timeline
          setTimeout(() => {
            addLog({
              type: 'followup',
              message: 'Follow-up sequence scheduled: Day 0 (sent), Day 1, Day 3, Day 7',
              data: {
                sequence: ['Day 0: Instant reply (sent)', 'Day 1: Check-in SMS', 'Day 3: Value email', 'Day 7: Final touch'],
              },
            });

            // CRM push
            setTimeout(async () => {
              try {
                const response = await fetch('/api/fub/push-lead', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    apiKey: apiKey || undefined,
                    lead: {
                      name: leadData.name,
                      phone: leadData.phone,
                      message: leadData.message,
                      intent,
                    },
                  }),
                });

                const data = await response.json();

                if (response.ok && data.success) {
                  addLog({
                    type: 'crm',
                    message: `✓ Lead pushed to Follow Up Boss${isSandboxMode ? ' (sandbox mode)' : ''}`,
                    data: {
                      fubId: data.leadId || 'sandbox-123',
                      tags: ['AI-qualified', intent],
                    },
                  });
                } else {
                  addLog({
                    type: 'error',
                    message: `CRM push failed: ${data.error || 'Unknown'}`,
                  });
                }
              } catch (error) {
                addLog({
                  type: 'error',
                  message: `CRM push error: ${error instanceof Error ? error.message : 'Unknown'}`,
                });
              }
            }, 500);
          }, 500);
        }, 500);
      }, 800);
    }, 300);
  };

  const simulateMissedCall = async () => {
    if (!leadData.name.trim() || !leadData.phone.trim()) {
      addLog({
        type: 'error',
        message: 'Please fill in name and phone',
      });
      return;
    }

    addLog({
      type: 'inbound',
      message: `Missed call from ${redactPhone(leadData.phone)}`,
      data: {
        from: redactPhone(leadData.phone),
        type: 'missed_call',
      },
    });

    setTimeout(() => {
      addLog({
        type: 'reply',
        message: 'Auto SMS follow-up triggered for missed call',
        data: {
          to: redactPhone(leadData.phone),
          body: `Hi ${leadData.name}, we missed your call. How can we help? Reply to this message.`,
        },
      });
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Connect Follow Up Boss */}
      <DemoCard title="Connect Follow Up Boss" subtitle="Enter your API key to enable live integration (optional)">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Follow Up Boss API Key
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter API key (optional for demo)"
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-400"
              />
              <button
                onClick={testConnection}
                disabled={connectionStatus === 'testing'}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {connectionStatus === 'testing' ? 'Testing...' : 'Test Connection'}
              </button>
            </div>
            {connectionStatus === 'connected' && (
              <p className="text-sm text-green-600 mt-2">✓ Connected to Follow Up Boss</p>
            )}
            {connectionStatus === 'failed' && (
              <p className="text-sm text-amber-600 mt-2">Using sandbox mode</p>
            )}
            {isSandboxMode && connectionStatus === 'idle' && (
              <p className="text-sm text-slate-500 mt-2">Demo will run in sandbox mode without API key</p>
            )}
          </div>
        </div>
      </DemoCard>

      {/* Input Panel */}
      <DemoCard title="Simulate Inbound Lead">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Lead Name
            </label>
            <input
              type="text"
              value={leadData.name}
              onChange={(e) => setLeadData({ ...leadData, name: e.target.value })}
              placeholder="John Smith"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={leadData.phone}
              onChange={(e) => setLeadData({ ...leadData, phone: e.target.value })}
              placeholder="(555) 123-4567"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Message
            </label>
            <textarea
              value={leadData.message}
              onChange={(e) => setLeadData({ ...leadData, message: e.target.value })}
              placeholder="Hi, I'm looking to buy a home in downtown..."
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-400"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={simulateSMSLead}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Simulate SMS Lead
            </button>
            <button
              onClick={simulateMissedCall}
              className="flex-1 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors"
            >
              Simulate Missed Call → SMS Follow-up
            </button>
          </div>
        </div>
      </DemoCard>

      {/* Audit Log */}
      <DemoCard title="Real-Time Audit Log" subtitle="Watch the end-to-end pipeline in action">
        <AuditLogPanel logs={logs} />
      </DemoCard>

      {/* Follow Up Boss View Preview */}
      {logs.some(log => log.type === 'crm' && log.message.includes('pushed')) && (
        <DemoCard title="Follow Up Boss View (Preview)" subtitle="This is what appears in your CRM">
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="mb-3">
              <h4 className="font-semibold text-slate-900">{leadData.name || 'Lead Name'}</h4>
              <p className="text-sm text-slate-600">{redactPhone(leadData.phone)}</p>
            </div>
            <div className="flex gap-2 mb-3">
              <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">AI-qualified</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">buying</span>
            </div>
            <div className="text-sm text-slate-700">
              <p className="mb-2"><strong className="text-blue-600">Source:</strong> SMS Lead</p>
              <p className="mb-2"><strong className="text-blue-600">Intent:</strong> Buying</p>
              <p className="mb-2"><strong className="text-blue-600">Follow-up:</strong> Day 0 (sent), Day 1, Day 3, Day 7</p>
              <p><strong className="text-blue-600">Notes:</strong> Instant AI reply sent. Lead interested in downtown properties.</p>
            </div>
          </div>
        </DemoCard>
      )}
    </div>
  );
}

