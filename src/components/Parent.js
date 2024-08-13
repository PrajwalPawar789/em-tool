import React from 'react'
import EmailValidation from './emvalidation'
import EmailValidationExcel from './EmailValidationExcel'

const Parent = () => {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-r from-blue-100 to-purple-200'>
      <div className='flex flex-wrap gap-8'>
        <EmailValidation />
        <EmailValidationExcel />
      </div>
    </div>
  )
}

export default Parent
