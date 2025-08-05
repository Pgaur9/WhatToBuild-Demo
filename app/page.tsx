import React from 'react'
import Hero from '@/components/sections/hero/default'


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

       
    </div>
  )
}

export default page
