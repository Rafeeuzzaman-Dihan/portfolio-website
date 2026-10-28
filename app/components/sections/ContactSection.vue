<template>
  <div class="relative overflow-hidden py-20 sm:py-28">
    <BackgroundsBlueprintBackground />

    <div class="section-container relative">
      <SectionTitle text="Contact" />

      <!-- Both panels stretch to the same height on desktop; on phones they stack. -->
      <div class="mt-12 grid items-stretch gap-6 lg:mt-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)] lg:gap-8">
        <ContactCommsPanel />
        <ContactComposer />
      </div>
    </div>
  </div>
</template>
