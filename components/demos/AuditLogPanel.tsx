'use client';

type LogEntry = {
  timestamp: string;
  type: 'inbound' | 'ai' | 'reply' | 'followup' | 'crm' | 'error';
  message: string;
  data?: any;
};

type AuditLogPanelProps = {
  logs: LogEntry[];
};

export function AuditLogPanel({ logs }: AuditLogPanelProps) {
  const getTypeColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'inbound':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'ai':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'reply':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'followup':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'crm':
        return 'text-indigo-600 bg-indigo-50 border-indigo-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="bg-slate-900 text-white rounded-xl p-4 h-[400px] overflow-y-auto font-mono text-sm">
      <div className="sticky top-0 bg-slate-900 pb-2 mb-2 border-b border-slate-700">
        <h3 className="font-semibold text-blue-400">Audit Log</h3>
      </div>
      <div className="space-y-2">
        {logs.length === 0 ? (
          <div className="text-slate-500 italic">Waiting for activity...</div>
        ) : (
          logs.map((log, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg border-l-4 ${getTypeColor(log.type)} bg-slate-800 border-opacity-50 mb-2`}
            >
              <div className="flex items-start justify-between mb-1">
                <span className="text-xs font-semibold uppercase text-blue-400">
                  {log.type}
                </span>
                <span className="text-xs text-slate-500">{log.timestamp}</span>
              </div>
              <div className="text-slate-200 whitespace-pre-wrap break-words">
                {log.message}
              </div>
              {log.data && (
                <details className="mt-2">
                  <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-300">
                    View payload
                  </summary>
                  <pre className="mt-2 text-xs text-slate-400 overflow-x-auto">
                    {JSON.stringify(log.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

