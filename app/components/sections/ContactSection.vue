<script setup lang="ts">
import { Icon } from '@iconify/vue/offline'
import profile from '~~/content/profile.json'

const { copied, copy } = useClipboard()
</script>

<template>
  <div class="relative overflow-hidden py-20 sm:py-28">
    <BackgroundsBlueprintBackground />

    <div class="section-container relative flex flex-col items-center gap-8 text-center">
      <div class="flex flex-col gap-4">
        <h2 class="font-heading text-3xl font-bold text-(--color-text) sm:text-4xl md:text-5xl">
          Let's build something together
        </h2>
        <p class="mx-auto max-w-xl text-(--color-text-muted) sm:text-lg">
          Have a project in mind, or just want to talk shop? My inbox is open — I usually reply within a day or two.
        </p>
      </div>

      <div class="flex flex-wrap items-center justify-center gap-3">
        <a
          :href="`mailto:${profile.email}`"
          class="font-heading text-2xl font-semibold text-(--color-primary) transition-colors hover:text-(--color-primary-light) sm:text-3xl"
        >
          {{ profile.email }}
        </a>

        <div class="relative">
          <button
            type="button"
            class="flex h-10 w-10 items-center justify-center rounded-full border border-(--color-border) text-(--color-text-muted) transition-colors hover:border-(--color-primary) hover:text-(--color-primary)"
            :aria-label="copied ? 'Email copied' : 'Copy email address'"
            @click="copy(profile.email)"
          >
            <Icon :icon="copied ? 'lucide:check' : 'lucide:copy'" class="h-4 w-4" />
          </button>

          <span
            class="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border border-(--color-border) bg-(--color-bg-elevated) px-2 py-1 text-xs text-(--color-primary) transition-all duration-200"
            :class="copied ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'"
          >
            Copied!
          </span>
        </div>
      </div>

      <ul class="mt-4 flex items-center gap-4">
        <li v-for="social in profile.socials" :key="social.platform">
          <a
            :href="social.url"
            :target="social.url.startsWith('mailto:') ? undefined : '_blank'"
            :rel="social.url.startsWith('mailto:') ? undefined : 'noopener noreferrer'"
            :aria-label="social.platform"
            class="flex h-12 w-12 items-center justify-center rounded-full border border-(--color-border) text-(--color-text-muted) transition-all duration-300 hover:-translate-y-1 hover:border-(--color-primary) hover:text-(--color-primary)"
          >
            <IconsSocialIcon :name="social.icon" />
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>
