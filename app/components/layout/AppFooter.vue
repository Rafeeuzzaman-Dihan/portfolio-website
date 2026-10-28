<script setup lang="ts">
import profile from '~~/content/profile.json'

const year = new Date().getFullYear()
const navLinks = useNavLinks()
</script>

<template>
  <footer class="band band-elevated band-seam" data-bg="grain" data-tone="dark">
    <div class="section-container border-b border-(--color-border) pt-16 pb-14">
      <TestimonialsCarousel />
    </div>

    <div class="section-container flex flex-col items-center gap-7 py-10 md:flex-row md:justify-between">
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
      <p class="section-container pt-[18px] pb-[calc(6rem+env(safe-area-inset-bottom))] text-center md:pb-[18px] text-[0.8rem] text-(--color-text-muted)">
        &copy; {{ year }} {{ profile.name }}. All rights reserved.
      </p>
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
