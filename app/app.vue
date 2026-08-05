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

      <section id="contact" class="relative border-t border-(--color-border)">
        <SectionsContactSection />
      </section>
    </main>

    <LayoutAppFooter />
  </div>
</template>
