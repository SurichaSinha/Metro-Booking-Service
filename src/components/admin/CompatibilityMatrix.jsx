import React, { useState, useMemo } from 'react';
import Card from '../ui/Card';

const versions = ['1.0', '1.1', '1.2', '2.0', '2.1', '2.2', '3.0'];

const compatibilityRules = {
  '1.0-1.1': 'direct',
  '1.0-1.2': 'intermediate',
  '1.0-2.0': 'blocked',
  '1.0-2.1': 'blocked',
  '1.0-2.2': 'blocked',
  '1.0-3.0': 'blocked',
  '1.1-1.2': 'direct',
  '1.1-2.0': 'intermediate',
  '1.1-2.1': 'blocked',
  '1.1-2.2': 'blocked',
  '1.1-3.0': 'blocked',
  '1.2-2.0': 'direct',
  '1.2-2.1': 'intermediate',
  '1.2-2.2': 'blocked',
  '1.2-3.0': 'blocked',
  '2.0-2.1': 'direct',
  '2.0-2.2': 'intermediate',
  '2.0-3.0': 'blocked',
  '2.1-2.2': 'direct',
  '2.1-3.0': 'intermediate',
  '2.2-3.0': 'direct',
};

const statusInfo = {
  direct: {
    color: 'bg-green-500',
    label: 'Direct Upgrade',
    description: 'Can upgrade directly without any intermediate steps',
  },
  intermediate: {
    color: 'bg-amber-500',
    label: 'Requires Intermediate',
    description: 'Requires upgrading to an intermediate version first',
  },
  blocked: {
    color: 'bg-red-500',
    label: 'Blocked',
    description: 'Direct upgrade path not available. Requires multiple steps.',
  },
  same: {
    color: 'bg-gray-300',
    label: 'Same Version',
    description: 'Source and target are the same version',
  },
  downgrade: {
    color: 'bg-gray-200',
    label: 'Downgrade',
    description: 'Downgrade not supported',
  },
};

function getCompatibility(source, target) {
  if (source === target) return 'same';
  
  const sourceNum = parseFloat(source);
  const targetNum = parseFloat(target);
  
  if (targetNum < sourceNum) return 'downgrade';
  
  const key = `${source}-${target}`;
  return compatibilityRules[key] || 'blocked';
}

function getRestrictionReason(source, target) {
  const status = getCompatibility(source, target);
  
  if (status === 'same') return 'Same version - no upgrade needed';
  if (status === 'downgrade') return 'Downgrade not supported';
  if (status === 'direct') return 'Direct upgrade available';
  if (status === 'intermediate') {
    const sourceNum = parseFloat(source);
    const targetNum = parseFloat(target);
    const intermediate = versions.find(v => {
      const num = parseFloat(v);
      return num > sourceNum && num < targetNum;
    });
    return `Requires upgrade to ${intermediate} first`;
  }
  return 'Multiple upgrade steps required';
}

function MatrixCell({ source, target, isTopRow = false }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const status = getCompatibility(source, target);
  const info = statusInfo[status];
  const reason = getRestrictionReason(source, target);

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        className={`
          w-full h-10 ${info.color} rounded
          flex items-center justify-center cursor-help
          transition-transform hover:scale-110
        `}
        aria-label={`${source} to ${target}: ${info.label}`}
      >
        {status === 'direct' && (
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
        {status === 'intermediate' && (
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        )}
        {status === 'blocked' && (
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </div>

      {showTooltip && (
        <div 
          className={`absolute z-50 left-1/2 -translate-x-1/2 w-48 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg
            ${isTopRow ? 'top-full mt-2' : 'bottom-full mb-2'}`}
        >
          <p className="font-medium mb-1">{info.label}</p>
          <p className="text-gray-300">{reason}</p>
          <div 
            className={`absolute left-1/2 -translate-x-1/2 border-4 border-transparent 
              ${isTopRow ? 'bottom-full border-b-gray-900' : 'top-full border-t-gray-900'}`} 
          />
        </div>
      )}
    </div>
  );
}

export default function CompatibilityMatrix() {
  const [hoveredRow, setHoveredRow] = useState(null);
  const [hoveredCol, setHoveredCol] = useState(null);

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="font-semibold text-gray-900 mb-2">Version Compatibility Matrix</h3>
        <p className="text-sm text-gray-500 mb-6">
          This matrix shows the upgrade compatibility between different metro system versions.
          Hover over a cell to see details about the upgrade path.
        </p>

        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <div
              className="grid gap-1"
              style={{
                gridTemplateColumns: `80px repeat(${versions.length}, 1fr)`,
              }}
            >
              <div className="h-10" />
              {versions.map(v => (
                <div
                  key={v}
                  className={`
                    h-10 flex items-center justify-center font-medium text-sm
                    ${hoveredCol === v ? 'bg-blue-50 text-metro-blue' : 'text-gray-600'}
                  `}
                  onMouseEnter={() => setHoveredCol(v)}
                  onMouseLeave={() => setHoveredCol(null)}
                >
                  v{v}
                </div>
              ))}

              {versions.map((source, rowIndex) => (
                <React.Fragment key={`row-${source}`}>
                  <div
                    className={`
                      h-10 flex items-center justify-center font-medium text-sm
                      ${hoveredRow === source ? 'bg-blue-50 text-metro-blue' : 'text-gray-600'}
                    `}
                    onMouseEnter={() => setHoveredRow(source)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    v{source}
                  </div>
                  {versions.map(target => (
                    <div
                      key={`${source}-${target}`}
                      onMouseEnter={() => { setHoveredRow(source); setHoveredCol(target); }}
                      onMouseLeave={() => { setHoveredRow(null); setHoveredCol(null); }}
                    >
                      <MatrixCell source={source} target={target} isTopRow={rowIndex < 2} />
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold text-gray-900 mb-4">Legend</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {Object.entries(statusInfo)
            .filter(([key]) => !['same', 'downgrade'].includes(key))
            .map(([key, info]) => (
              <div key={key} className="flex items-start gap-3">
                <div className={`w-6 h-6 ${info.color} rounded flex-shrink-0`} />
                <div>
                  <p className="font-medium text-gray-900">{info.label}</p>
                  <p className="text-sm text-gray-500">{info.description}</p>
                </div>
              </div>
            ))}
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold text-gray-900 mb-2">Upgrade Guidelines</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Green cells indicate direct upgrades are supported</span>
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
            </svg>
            <span>Amber cells require an intermediate version upgrade first</span>
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Red cells indicate blocked paths requiring multiple upgrade steps</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
