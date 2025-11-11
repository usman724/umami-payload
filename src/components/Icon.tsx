import React from 'react'
import Image from 'next/image'

export const Icon = () => {
  return (
    <div className="custom-icon">
      <Image
        src="/logo.png"
        alt="Hivefinty"
        width={25}
        height={25}
        style={{ width: 'auto', height: '25px' }}
        priority
      />
    </div>
  )
}
