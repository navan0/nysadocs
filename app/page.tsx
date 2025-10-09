import { Suspense } from "react"
import HandbookPage from "@/components/handbook/HandbookPage"

export default function Page() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-gray-500">Loading...</div>}>
      <HandbookPage />
    </Suspense>
  )
}
