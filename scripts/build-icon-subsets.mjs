// Builds the offline icon subsets in app/assets/icons from the @iconify-json packages.
// Run with `yarn icons` after adding an icon to content/expertise.json or content/skills.json.
import { readFileSync, writeFileSync } from 'node:fs'
import { getIcons } from '@iconify/utils'

const load = name => JSON.parse(readFileSync(new URL(`../node_modules/@iconify-json/${name}/icons.json`, import.meta.url)))
const logos = load('logos')
const solar = load('solar')
const simple = load('simple-icons')

const LOGOS = [
  'php', 'javascript', 'typescript-icon', 'html-5', 'css-3',
  'vue', 'nuxt-icon', 'tailwindcss-icon',
  'nodejs-icon', 'laravel', 'nestjs',
  'mysql-icon', 'postgresql', 'mongodb-icon', 'redis',
  'docker-icon', 'cloudflare-icon', 'github-actions',
  'git-icon', 'postman-icon', 'swagger', 'phpstorm', 'visual-studio-code', 'claude-icon'
]
const SOLAR = ['monitor-smartphone-bold-duotone', 'server-square-bold-duotone', 'database-bold-duotone', 'rocket-2-bold-duotone', 'code-square-bold-duotone']

const logoSubset = getIcons(logos, LOGOS, true)
// Paint a mark in one colour, including paths that ask for currentColor.
const withFill = (icon, fill) => ({ ...icon, body: `<g fill="${fill}">${icon.body.replaceAll('currentColor', fill)}</g>` })

// Dark-background variants: the stock marks are near-black and vanish on the site background.
logoSubset.icons['aws-dark'] = { ...logos.icons.aws, body: logos.icons.aws.body.replaceAll('#252f3e', '#ffffff') }
logoSubset.icons['vercel-dark'] = withFill(logos.icons['vercel-icon'], '#ffffff')
logoSubset.icons['github-dark'] = { ...withFill(simple.icons.github, '#ffffff'), width: 24, height: 24 }
// Hostinger only exists as a single-colour mark; paint it in its brand purple.
logoSubset.icons.hostinger = { ...withFill(simple.icons.hostinger, '#673de6'), width: 24, height: 24 }

writeFileSync(new URL('../app/assets/icons/logos-subset.json', import.meta.url), JSON.stringify(logoSubset))
writeFileSync(new URL('../app/assets/icons/solar-subset.json', import.meta.url), JSON.stringify(getIcons(solar, SOLAR, true)))
console.log(`logos: ${Object.keys(logoSubset.icons).length}, solar: ${SOLAR.length}`)
