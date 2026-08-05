<script setup lang="ts">
defineProps<{
  name: string
}>()
</script>

<template>
  <svg
    v-if="name === 'github'"
    viewBox="0 0 24 24"
    fill="currentColor"
    class="h-5 w-5"
    aria-hidden="true"
  >
    <path
      d="M12 .5C5.73.5.5 5.73.5 12c0 5.1 3.29 9.42 7.86 10.95.57.1.78-.25.78-.55v-1.94c-3.2.7-3.88-1.36-3.88-1.36-.52-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a10.98 10.98 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.64 1.59.24 2.76.12 3.05.74.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .3.2.66.79.55A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z"
    />
  </svg>
  <svg
    v-else-if="name === 'linkedin'"
    viewBox="0 0 24 24"
    fill="currentColor"
    class="h-5 w-5"
    aria-hidden="true"
  >
    <path
      d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.45-2.14 2.94v5.66H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45Z"
    />
  </svg>
  <svg
    v-else-if="name === 'twitter'"
    viewBox="0 0 24 24"
    fill="currentColor"
    class="h-5 w-5"
    aria-hidden="true"
  >
    <path
      d="M18.9 2H22l-7.5 8.57L23 22h-6.9l-5.4-6.63L4.5 22H1.4l8.02-9.17L1 2h7.06l4.88 6.06L18.9 2Zm-1.21 18.2h1.71L7.4 3.7H5.56l12.13 16.5Z"
    />
  </svg>
  <svg
    v-else
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="h-5 w-5"
    aria-hidden="true"
  >
    <path d="M3 6h18v12H3z" />
    <path d="m3 6 9 7 9-7" />
  </svg>
</template>
