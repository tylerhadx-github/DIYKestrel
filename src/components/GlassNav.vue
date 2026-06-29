<template>
  <header class="nav" :class="{ 'nav--solid': scrolled }">
    <div class="nav__inner">
      <div class="nav__brand">
        <a
          href="https://paintbrushoutdoors.com"
          class="nav__brandlogo"
          aria-label="Paintbrush Outdoors home"
        >
          <img src="/brand-logo.png" alt="Paintbrush Outdoors" class="nav__logo" />
        </a>
        <a href="#top" class="nav__brandlink" @click="go($event, '#top')">
          <span class="nav__brandtext"><span class="nav__brandaccent">Kestrel</span></span>
        </a>
      </div>

      <nav class="nav__links" aria-label="Sections">
        <a
          v-for="link in links"
          :key="link.id"
          :href="`#${link.id}`"
          @click="go($event, `#${link.id}`)"
        >{{ link.label }}</a>
      </nav>

      <div class="nav__right">
        <span
          class="pb-badge nav__status"
          :class="online ? 'pb-badge--live' : 'pb-badge--progress'"
          :title="online ? 'Connected to network' : 'No network - app still works'"
        >
          <span class="pb-badge__dot"></span>
          {{ online ? 'Offline-ready' : 'Offline' }}
        </span>
        <a href="#readings" class="nav__cta" @click="go($event, '#readings')">
          Connect device
        </a>
      </div>
    </div>
  </header>
</template>

<script setup>
  import { onMounted, onBeforeUnmount, ref } from 'vue'

  const scrolled = ref(false)
  const online = ref(typeof navigator !== 'undefined' ? navigator.onLine : true)

  const links = [
    { id: 'readings', label: 'Readings' },
    { id: 'how', label: 'How it works' },
    { id: 'measure', label: 'What it measures' },
    { id: 'build', label: 'Build your own' },
    { id: 'open-source', label: 'Open source' },
  ]

  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  function onScroll () {
    scrolled.value = window.scrollY > 40
  }

  function setOnline () { online.value = true }
  function setOffline () { online.value = false }

  function go (e, sel) {
    const target = document.querySelector(sel)
    if (!target) return
    e.preventDefault()
    target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
  }

  onMounted(() => {
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('online', setOnline)
    window.addEventListener('offline', setOffline)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('online', setOnline)
    window.removeEventListener('offline', setOffline)
  })
</script>

<style scoped>
  .nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    transition: background 0.3s ease, border-color 0.3s ease, backdrop-filter 0.3s ease;
    border-bottom: 1px solid transparent;
  }

  .nav--solid {
    background: rgba(11, 11, 16, 0.72);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border-bottom-color: rgba(255, 255, 255, 0.08);
  }

  .nav__inner {
    max-width: 1180px;
    margin: 0 auto;
    padding: 0.85rem 1.25rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .nav__brand {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
  }

  .nav__brandlogo,
  .nav__brandlink {
    display: inline-flex;
    align-items: center;
    text-decoration: none;
    color: #f4f4f8;
  }

  .nav__logo {
    height: 40px;
    width: auto;
    object-fit: contain;
    filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.45));
  }

  .nav__brandtext {
    font-family: 'Space Grotesk', system-ui, sans-serif;
    font-weight: 700;
    letter-spacing: -0.01em;
    font-size: 1.1rem;
  }

  .nav__brandaccent {
    color: #3ddc97;
  }

  .nav__links {
    display: flex;
    gap: 1.5rem;
  }

  .nav__links a {
    position: relative;
    text-decoration: none;
    color: #b3b3c0;
    font-size: 0.95rem;
    transition: color 0.25s ease;
  }

  .nav__links a::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -4px;
    width: 0;
    height: 2px;
    border-radius: 2px;
    background: #3ddc97;
    transition: width 0.25s ease;
  }

  .nav__links a:hover {
    color: #fff;
  }

  .nav__links a:hover::after {
    width: 100%;
  }

  .nav__right {
    display: inline-flex;
    align-items: center;
    gap: 0.85rem;
  }

  .nav__status {
    white-space: nowrap;
  }

  .nav__cta {
    display: inline-flex;
    align-items: center;
    padding: 0.55rem 1.15rem;
    border-radius: 999px;
    font-size: 0.9rem;
    font-weight: 600;
    text-decoration: none;
    color: #06130d;
    background: linear-gradient(120deg, #3ddc97, #2bb87c);
    box-shadow: 0 8px 24px rgba(61, 220, 151, 0.3);
    transition: transform 0.25s ease, box-shadow 0.25s ease;
  }

  .nav__cta:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(61, 220, 151, 0.45);
  }

  @media (max-width: 860px) {
    .nav__links {
      display: none;
    }
  }

  @media (max-width: 560px) {
    .nav__status {
      display: none;
    }
    .nav__brandtext {
      font-size: 1rem;
    }
  }
</style>
