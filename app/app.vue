<template>
  <div class="min-h-screen bg-(--color-bg) font-body text-(--color-text)">
    <NuxtRouteAnnouncer />
    <CustomCursor />

    <LayoutAppHeader />

    <main>
      <section id="home" class="band" data-tone="dark">
        <SectionsHeroSection />
      </section>

      <section id="expertise" class="band band-seam" data-bg="lines" data-tone="light">
        <SectionsExpertiseSection />
      </section>

      <section id="experience" class="band band-seam" data-tone="dark">
        <SectionsExperienceSection />
      </section>

      <section id="projects" class="band band-seam" data-bg="grain" data-tone="light">
        <SectionsProjectsSection />
      </section>

      <section id="services" class="band band-seam" data-bg="lines" data-tone="dark">
        <SectionsServicesSection />
      </section>

      <section id="contact" class="band band-seam" data-tone="light">
        <SectionsContactSection />
      </section>
    </main>

    <LayoutAppFooter />
  </div>
</template>
