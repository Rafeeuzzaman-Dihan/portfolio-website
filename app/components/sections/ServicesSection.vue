<script setup lang="ts">
import services from '~~/content/services.json'

const { services: items, cta } = services

const pad = (n: number) => String(n).padStart(2, '0')
const counter = (index: number) => `${pad(index + 1)} / ${pad(items.length)}`
</script>

<template>
  <!-- overflow-clip, not overflow-hidden: hidden would stop the "How I work" window from sticking. -->
  <div class="relative overflow-clip py-20 sm:py-24">
    <BackgroundsDotGridBackground />

    <div class="section-container relative">
      <SectionTitle text="Services" />

      <div class="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:mt-14 lg:grid-cols-3">
        <ServicesServiceCard
          v-for="(service, index) in items"
          :key="service.id"
          :service="service as any"
          :counter="counter(index)"
        />

        <article class="flex min-w-0 flex-col justify-center gap-4 border border-dashed border-(--color-border) px-[26px] py-8">
          <h3 class="font-heading text-[1.6rem] leading-[1.1] font-bold tracking-[-0.03em] text-(--color-text)">
            {{ cta.title }}
          </h3>
          <p class="text-[0.95rem] text-(--color-text-muted)">
            {{ cta.text }}
          </p>
          <a
            href="#contact"
            class="cta-btn group relative isolate inline-flex items-center gap-3 self-start overflow-hidden border border-(--color-primary) py-2.5 pr-5 pl-3 font-heading text-[0.95rem] font-semibold text-(--color-text) transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-(--color-primary-light)"
          >
            <span class="grid size-7 place-items-center rounded-md border border-(--color-secondary) bg-(--color-bg-elevated) font-mono text-[13px] font-semibold shadow-[0_3px_0_var(--color-secondary)] transition-[translate,box-shadow] duration-150 group-hover:translate-y-[3px] group-hover:shadow-[0_0_0_var(--color-secondary)]">{{ cta.key }}</span>
            {{ cta.button }}
          </a>
        </article>
      </div>

      <ServicesHowIWork class="mt-28 lg:mt-32" />
    </div>
  </div>
</template>

<style scoped>
/* The button floods with blue from the left on hover, like the Case study button. */
.cta-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: var(--color-primary);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.35s ease;
}

.cta-btn:hover::before,
.cta-btn:focus-visible::before {
  transform: scaleX(1);
}
</style>
