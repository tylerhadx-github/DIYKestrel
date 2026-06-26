<template>
  <section :id="anchor" class="motion-section" ref="root">
    <div class="motion-section__inner" :class="{ narrow }">
      <header v-if="eyebrow || title" class="motion-section__head" ref="head">
        <span v-if="eyebrow" class="motion-section__eyebrow">{{ eyebrow }}</span>
        <h2 v-if="title" class="motion-section__title">{{ title }}</h2>
        <p v-if="subtitle" class="motion-section__subtitle">{{ subtitle }}</p>
      </header>
      <slot />
    </div>
  </section>
</template>

<script setup>
  import { onMounted, ref } from 'vue'
  import { useScrollReveal } from '@/composables/useScrollReveal'

  defineProps({
    anchor: { type: String, default: undefined },
    eyebrow: { type: String, default: '' },
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    narrow: { type: Boolean, default: false },
  })

  const root = ref(null)
  const head = ref(null)
  const { revealOne } = useScrollReveal()

  onMounted(() => {
    if (head.value) revealOne(head.value, { y: 32 })
  })
</script>

<style scoped>
  .motion-section {
    position: relative;
    padding: clamp(4rem, 9vw, 8rem) 1.25rem;
  }

  .motion-section__inner {
    max-width: 1180px;
    margin: 0 auto;
  }

  .motion-section__inner.narrow {
    max-width: 760px;
  }

  .motion-section__head {
    margin-bottom: clamp(2rem, 5vw, 3.5rem);
  }

  .motion-section__eyebrow {
    display: inline-block;
    font-family: 'Space Grotesk', system-ui, sans-serif;
    font-weight: 700;
    font-size: 0.8rem;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #3ddc97;
    margin-bottom: 0.85rem;
  }

  .motion-section__title {
    font-family: 'Space Grotesk', system-ui, sans-serif;
    font-weight: 700;
    font-size: clamp(2rem, 5vw, 3.25rem);
    line-height: 1.05;
    letter-spacing: -0.02em;
    margin: 0;
    color: #f4f4f8;
  }

  .motion-section__subtitle {
    margin: 1rem 0 0;
    max-width: 620px;
    font-size: clamp(1rem, 2vw, 1.15rem);
    line-height: 1.6;
    color: #a7a7b4;
  }
</style>
