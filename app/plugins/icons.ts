import { addCollection } from '@iconify/vue/offline'
import lucideSubset from '~/assets/icons/lucide-subset.json'
import logosSubset from '~/assets/icons/logos-subset.json'
import solarSubset from '~/assets/icons/solar-subset.json'

export default defineNuxtPlugin(() => {
  addCollection(lucideSubset)
  addCollection(logosSubset)
  addCollection(solarSubset)
})
