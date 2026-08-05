<script setup lang="ts">
import profile from '~~/content/profile.json'

const year = new Date().getFullYear()
</script>

<template>
  <footer class="relative border-t border-(--color-border) bg-(--color-bg-elevated)">
    <div class="section-container flex flex-col items-center gap-6 py-10 sm:flex-row sm:justify-between">
      <a
        href="#home"
        class="font-heading text-lg font-bold tracking-tight text-(--color-text) transition-colors hover:text-(--color-primary)"
      >
        <span class="text-(--color-primary)">R</span>D
      </a>

      <ul class="flex items-center gap-3">
        <li v-for="social in profile.socials" :key="social.platform">
          <a
            :href="social.url"
            :target="social.url.startsWith('mailto:') ? undefined : '_blank'"
            :rel="social.url.startsWith('mailto:') ? undefined : 'noopener noreferrer'"
            :aria-label="social.platform"
            class="flex h-10 w-10 items-center justify-center rounded-full border border-(--color-border) text-(--color-text-muted) transition-colors hover:border-(--color-primary) hover:text-(--color-primary)"
          >
            <IconsSocialIcon :name="social.icon" />
          </a>
        </li>
      </ul>
    </div>

    <div class="border-t border-(--color-border)">
      <p class="section-container py-4 text-center text-xs text-(--color-text-muted)">
        &copy; {{ year }} {{ profile.name }}. All rights reserved.
      </p>
    </div>
  </footer>
</template>
