import React from 'react'
import Hero from '@/components/sections/hero/default'


const page = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <Hero
        title="What to Build?"
        description="Analyze GitHub repositories with comprehensive insights, generate README files, and visualize project architecture."
        badge={false}
        buttons={[
          {
            href: "/analyze",
            text: "Analyze Repository",
            variant: "default"
          },
          {
            href: "/readme",
            text: "Generate README",
            variant: "outline"
          }
        ]} 
      />

       
    </div>
  )
}

export default page
