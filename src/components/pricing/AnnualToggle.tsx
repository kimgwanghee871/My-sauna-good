'use client'

interface AnnualToggleProps {
  isAnnual: boolean
  onToggle: (isAnnual: boolean) => void
  discountMonths: number
}

export default function AnnualToggle({ 
  isAnnual, 
  onToggle, 
  discountMonths 
}: AnnualToggleProps) {
  return (
    <div className="flex justify-center mb-8">
      <div className="bg-gray-100 rounded-lg p-1 flex items-center">
        <button
          onClick={() => onToggle(false)}
          className={`
            px-4 py-2 rounded-md font-medium text-sm transition-colors
            ${!isAnnual 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
            }
          `}
        >
          월간 결제
        </button>
        
        <button
          onClick={() => onToggle(true)}
          className={`
            px-4 py-2 rounded-md font-medium text-sm transition-colors relative
            ${isAnnual 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
            }
          `}
        >
          연간 결제
          {discountMonths > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              {discountMonths}개월 무료
            </span>
          )}
        </button>
      </div>
    </div>
  )
}