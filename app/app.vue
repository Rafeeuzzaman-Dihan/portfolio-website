<template>
  <div class="min-h-screen bg-(--color-bg) font-body text-(--color-text)">
    <NuxtRouteAnnouncer />

    <LayoutAppHeader />

    <main>
      <section id="home">
        <SectionsHeroSection />
      </section>

      <section id="expertise" class="relative border-t border-(--color-border)">
        <SectionsExpertiseSection />
      </section>

      <section id="experience" class="relative border-t border-(--color-border)">
        <SectionsExperienceSection />
      </section>

      <section id="projects" class="relative border-t border-(--color-border)">
        <SectionsProjectsSection />
      </section>

      <section id="services" class="relative border-t border-(--color-border)">
        <SectionsServicesSection />
      </section>

      <section
        v-for="placeholder in placeholders"
        :id="placeholder.id"
        :key="placeholder.id"
        class="relative flex min-h-[60vh] scroll-mt-20 items-center border-t border-(--color-border)"
      >
        <div class="section-container">
          <h2 class="font-heading text-2xl font-bold text-(--color-text) sm:text-3xl">
            {{ placeholder.label }}
          </h2>
          <p class="mt-2 text-(--color-text-muted)">
            Content for this section arrives in a later phase.
          </p>
        </div>
      </section>
    </main>

    <LayoutAppFooter />
  </div>
</template>

<script setup lang="ts">
const placeholders = [
  { id: 'contact', label: 'Contact' }
]
</script>
