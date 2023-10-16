import React from 'react'
import { toast } from 'react-hot-toast'

import { ErrorIcon, Toast } from 'junoblocks'

const createAlertPricingServiceIsDown = () => {
  let hasRenderedAlert
  let timeout

  const renderAlert = () => {
    toast.custom((t) => (
      <Toast
        icon={<ErrorIcon color="error" />}
        title="Oops, sorry! Our pricing service is temporarily down"
        onClose={() => toast.dismiss(t.id)}
      />
    ))
  }

  return () => {
    if (hasRenderedAlert) {
      clearTimeout(timeout)
      timeout = setTimeout(renderAlert, 60 * 1000)
      return
    }

    hasRenderedAlert = true
    renderAlert()
  }
}

export const pricingServiceIsDownAlert = createAlertPricingServiceIsDown()
