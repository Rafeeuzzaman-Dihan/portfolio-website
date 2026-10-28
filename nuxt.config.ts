import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint'],
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'Rafeeuzzaman Dihan | Software Engineer',
      meta: [
        { name: 'description', content: 'Software engineer in Dhaka building SaaS products, e-commerce stores, business software, MVPs and websites. See my work and get in touch on WhatsApp or email.' },
        { name: 'theme-color', content: '#0a0e14' },
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: 'Rafeeuzzaman Dihan | Software Engineer' },
        { property: 'og:description', content: 'SaaS products, e-commerce stores, business software, MVPs and websites, built by a software engineer in Dhaka.' },
        { name: 'twitter:card', content: 'summary' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Rajdhani:wght@600;700&display=swap'
        }
      ]
    }
  },
  vite: {
    plugins: [tailwindcss()]
  }
})
