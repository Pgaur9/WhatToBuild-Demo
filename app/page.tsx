import React from 'react'
import Hero from '@/components/sections/hero/default'
import { BentoCrad } from '@/components/Hero/BentoCrad'

const page = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <Hero
        title="What to Build?"
        description="Enter a concept to discover and analyze relevant open-source projects."
        badge={false}
        buttons={[{
          href: "/search",
          text: "Search Projects",
          variant: "default"
        }]}
      />

      <div className=" px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-container mx-auto">
          <BentoCrad />
        </div>
      </div>
      
      {/* Add spacing and continue background */}
      
    </div>
  )
}

export default page
