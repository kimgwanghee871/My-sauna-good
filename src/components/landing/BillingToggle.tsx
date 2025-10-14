'use client'

interface BillingToggleProps {
  value: 'monthly' | 'annual'
  onChange: (value: 'monthly' | 'annual') => void
  labels: {
    monthly: string
    annual: string
  }
}

export function BillingToggle({ value, onChange, labels }: BillingToggleProps) {
  const isAnnual = value === 'annual'
  
  return (
    <div className="flex items-center justify-center space-x-4 mb-8">
      <span className={`text-sm ${!isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
        {labels.monthly}
      </span>
      <button
        onClick={() => onChange(isAnnual ? 'monthly' : 'annual')}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          isAnnual ? 'bg-blue-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isAnnual ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      <span className={`text-sm ${isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
        {labels.annual}
      </span>
    </div>
  )
}