<script setup lang="ts">
import profile from '~~/content/profile.json'

const year = new Date().getFullYear()
const navLinks = useNavLinks()
const city = profile.location.split(',')[0]
</script>

<template>
  <footer class="relative border-t border-(--color-border) bg-(--color-bg-elevated)">
    <div class="section-container border-b border-(--color-border) pt-16 pb-14">
      <TestimonialsCarousel />
    </div>

    <div class="section-container flex flex-col items-center gap-7 py-10 md:flex-row md:justify-between">
      <a
        href="#home"
        class="font-heading text-[1.4rem] leading-none font-bold tracking-[-0.02em] text-(--color-text)"
      >
        <span class="text-(--color-primary)">R</span>D
      </a>

      <ul class="flex flex-wrap items-center justify-center gap-x-[26px] gap-y-2">
        <li v-for="link in navLinks" :key="link.href">
          <a
            :href="link.href"
            class="nav-link relative py-1 text-sm text-(--color-text-muted) transition-colors hover:text-(--color-text) focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-(--color-primary-light)"
          >
            {{ link.label }}
          </a>
        </li>
      </ul>

      <ul class="flex items-center gap-2.5">
        <li v-for="social in profile.socials" :key="social.platform">
          <ContactSocialTile :social="social" :size="40" />
        </li>
      </ul>
    </div>

    <div class="border-t border-(--color-border)">
      <div class="section-container flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-[18px]">
        <p class="text-[0.8rem] text-(--color-text-muted)">
          &copy; {{ year }} {{ profile.name }}. All rights reserved.
        </p>
        <p class="flex items-center gap-2 font-mono text-[11px] tracking-[0.08em] text-(--color-secondary)">
          <span class="size-1.5 bg-(--color-primary)" aria-hidden="true" />Built in {{ city }}
        </p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
/* A blue line draws under a nav link on hover */
.nav-link::after {
  content: '';
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 1px;
  background: var(--color-primary);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s;
}

.nav-link:hover::after,
.nav-link:focus-visible::after {
  transform: scaleX(1);
}

@media (prefers-reduced-motion: reduce) {
  .nav-link::after { transition: none; }
}
</style>
