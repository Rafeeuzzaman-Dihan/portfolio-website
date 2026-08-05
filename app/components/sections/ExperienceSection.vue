<script setup lang="ts">
import experience from '~~/content/experience.json'
</script>

<template>
  <div class="relative py-20 sm:py-24">
    <div class="section-container">
      <h2 class="font-heading text-3xl font-bold text-(--color-text) sm:text-4xl">
        Experience
      </h2>
      <p class="mt-2 max-w-2xl text-(--color-text-muted)">
        Where I've worked and what I've built along the way.
      </p>

      <div class="mt-12 flex flex-col">
        <TimelineEntry
          v-for="(entry, index) in experience"
          :key="`${entry.company}-${entry.startDate}`"
          :entry="entry"
          :is-last="index === experience.length - 1"
        />
      </div>
    </div>
  </div>
</template>
