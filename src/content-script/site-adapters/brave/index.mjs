import { waitForElementToExistAndSelect } from '../../../utils'
import { config } from '../index.mjs'

export default {
  init: async (hostname, userConfig) => {
    const selector = userConfig.insertAtTop
      ? config.Brave.resultsContainerQuery[0]
      : config.Brave.sidebarContainerQuery[0]
    await waitForElementToExistAndSelect(selector, 5)
    return true
  },
}
