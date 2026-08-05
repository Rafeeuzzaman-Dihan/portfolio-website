import { addCollection } from '@iconify/vue/offline'
import lucideSubset from '~/assets/icons/lucide-subset.json'

export default defineNuxtPlugin(() => {
  addCollection(lucideSubset)
})
