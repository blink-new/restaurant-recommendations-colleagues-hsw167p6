import { createClient } from '@blinkdotnew/sdk'

export const blink = createClient({
  projectId: 'restaurant-recommendations-colleagues-hsw167p6',
  authRequired: true
})

export default blink