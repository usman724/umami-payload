import React from 'react'
import Image from 'next/image'

export const Logo = () => {
  return (
    <div className="custom-logo">
      <Image
        src="/logo.png"
        alt="Hivefinty"
        width={120}
        height={120}
        style={{ width: 'auto', height: '120px' }}
        priority
      />
    </div>
  )
}
