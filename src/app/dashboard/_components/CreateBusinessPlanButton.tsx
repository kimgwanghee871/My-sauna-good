'use client'

import { useRouter } from 'next/navigation'
import { Button } from '../../../components/ui/Button'

export default function CreateBusinessPlanButton() {
  const router = useRouter()

  const handleCreatePlan = () => {
    // Navigate to template selection page
    router.push('/generate/template')
  }

  return (
    <Button
      onClick={handleCreatePlan}
      variant="primary"
      size="md"
      className="mt-4"
    >
      새 사업계획서 생성
    </Button>
  )
}