<template>
  <div class="home">
    <!-- ===================== HERO ===================== -->
    <section id="top" class="hero" ref="heroRoot">
      <div class="hero__bg" aria-hidden="true">
        <span class="orb orb--green" ref="orb1"></span>
        <span class="orb orb--purple" ref="orb2"></span>
        <span class="hero__grid"></span>
      </div>

      <div class="hero__inner">
        <div class="hero__copy">
          <p class="hero__eyebrow" ref="eyebrow">
            <span class="hero__dot"></span> Works with no signal, in the field
          </p>

          <h1 class="hero__headline">
            <span class="line"><span class="line__inner">The weather meter</span></span>
            <span class="line"><span class="line__inner">you <em class="pb-gradient">build yourself</em>.</span></span>
          </h1>

          <p class="hero__intro" ref="intro">
            DIYKestrel is an open-source handheld weather meter in a 3D-printed
            case. Pair it over Bluetooth and read temperature, pressure, humidity
            and altitude anywhere - no cell service, no cloud, a fraction of the
            cost of a commercial unit.
          </p>

          <div class="hero__cta" ref="cta">
            <a href="#readings" class="pb-btn pb-btn--primary" @click="scrollTo($event, '#readings')">
              Connect device
              <span class="pb-btn__arrow" aria-hidden="true">&#8594;</span>
            </a>
            <a href="#build" class="pb-btn pb-btn--ghost" @click="scrollTo($event, '#build')">
              Build your own
            </a>
          </div>

          <ul class="hero__hints" ref="hintsEl" aria-hidden="true">
            <li v-for="hint in heroHints" :key="hint">{{ hint }}</li>
          </ul>
        </div>

        <!-- Device + live readings visual -->
        <div class="hero__visual" ref="visual">
          <div class="device pb-card">
            <div class="device__top">
              <img src="/brand-logo.png" alt="" class="device__logo" />
              <span class="pb-badge pb-badge--live">
                <span class="pb-badge__dot"></span> Live
              </span>
            </div>
            <div class="device__readout">
              <span class="device__value">68&deg;<small>F</small></span>
              <span class="device__unit">Ambient temperature, live</span>
            </div>
            <div class="device__mini">
              <div v-for="m in miniStats" :key="m.label" class="device__stat">
                <span class="device__statval">{{ m.value }}<small>{{ m.unit }}</small></span>
                <span class="device__statlabel">{{ m.label }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===================== LIVE READINGS ===================== -->
    <MotionSection
      anchor="readings"
      eyebrow="Live dashboard"
      title="Glanceable readings, straight from the field"
      subtitle="Pair your Kestrel over Bluetooth and watch the numbers update in real time. The connection is direct - your phone never needs a signal."
    >
      <ReadingsDashboard />
    </MotionSection>

    <!-- ===================== HOW IT WORKS ===================== -->
    <MotionSection
      anchor="how"
      eyebrow="How it works"
      title="Sensors to screen, no middleman"
      subtitle="A simple, rugged chain: printed enclosure, off-the-shelf sensors, and a direct Bluetooth link to the app in your pocket."
    >
      <div class="grid grid--3" ref="howGrid">
        <article v-for="(step, i) in howSteps" :key="step.title" class="pb-card step" :style="{ '--pb-accent': step.accent }">
          <span class="step__num">0{{ i + 1 }}</span>
          <h3 class="step__title">{{ step.title }}</h3>
          <p class="step__body">{{ step.body }}</p>
        </article>
      </div>
    </MotionSection>

    <!-- ===================== WHAT IT MEASURES ===================== -->
    <MotionSection
      anchor="measure"
      eyebrow="What it measures"
      title="Four readings that matter outdoors"
      subtitle="Calibrated environmental sensors give you the core atmospheric picture before a hunt, climb, paddle or print."
    >
      <div class="grid grid--4" ref="measureGrid">
        <article v-for="m in measures" :key="m.title" class="pb-card measure" :style="{ '--pb-accent': m.accent }">
          <span class="measure__icon" aria-hidden="true">{{ m.icon }}</span>
          <h3 class="measure__title">{{ m.title }}</h3>
          <p class="measure__body">{{ m.body }}</p>
        </article>
      </div>
    </MotionSection>

    <!-- ===================== WORKS OFFLINE ===================== -->
    <MotionSection
      anchor="offline"
      eyebrow="Built for the backcountry"
      title="Works offline. On purpose."
      subtitle="DIYKestrel is offline-first by design. Install it once and the whole app - readings, build guide and all - runs with zero bars."
    >
      <div class="grid grid--4" ref="offlineGrid">
        <article v-for="o in offlineFeatures" :key="o.title" class="pb-card offline" :style="{ '--pb-accent': o.accent }">
          <span class="offline__icon" aria-hidden="true">{{ o.icon }}</span>
          <h3 class="offline__title">{{ o.title }}</h3>
          <p class="offline__body">{{ o.body }}</p>
        </article>
      </div>
    </MotionSection>

    <!-- ===================== BUILD YOUR OWN ===================== -->
    <MotionSection
      anchor="build"
      eyebrow="Build your own"
      title="A weekend build, a fraction of the cost"
      subtitle="Print the enclosure, wire up a handful of common parts, flash the firmware, and you have your own handheld weather meter."
    >
      <div class="build">
        <article class="pb-card build__bom">
          <h3 class="build__heading">Bill of materials</h3>
          <ul class="build__list">
            <li v-for="part in bom" :key="part.name">
              <span class="build__part">{{ part.name }}</span>
              <span class="build__cost">{{ part.cost }}</span>
            </li>
          </ul>
          <div class="build__total">
            <span>Approx. total</span>
            <span class="build__totalval">~$60</span>
          </div>
          <p class="build__note">
            Compare to $300+ for a commercial handheld unit.
          </p>
        </article>

        <article class="pb-card build__files pb-card--purple">
          <h3 class="build__heading">Print &amp; build files</h3>
          <p class="build__filesintro">
            Everything you need is open and downloadable - STLs for the enclosure,
            a wiring diagram, and the device firmware.
          </p>
          <div class="build__links">
            <a v-for="link in buildLinks" :key="link.label" :href="link.href" class="build__link" target="_blank" rel="noopener">
              <span class="build__linkicon" aria-hidden="true">{{ link.icon }}</span>
              <span>
                <span class="build__linklabel">{{ link.label }}</span>
                <span class="build__linksub">{{ link.sub }}</span>
              </span>
              <span class="pb-btn__arrow build__linkarrow" aria-hidden="true">&#8594;</span>
            </a>
          </div>
        </article>
      </div>
    </MotionSection>

    <!-- ===================== OPEN SOURCE ===================== -->
    <MotionSection
      anchor="open-source"
      eyebrow="Open source"
      title="Yours to fork, flash and improve"
      subtitle="Hardware design, firmware and this app are all open. Build it, mod it, and send a pull request."
      narrow
    >
      <div class="oss" ref="ossBlock">
        <div class="oss__badges">
          <span class="pb-badge pb-badge--oss"><span class="pb-badge__dot"></span> Open source</span>
          <span class="pb-badge pb-badge--live"><span class="pb-badge__dot"></span> Live</span>
          <span class="pb-badge pb-badge--progress"><span class="pb-badge__dot"></span> In progress</span>
        </div>
        <p class="oss__text">
          Released under a permissive license. No accounts, no telemetry, no cloud -
          just a handheld weather meter you fully own.
        </p>
        <div class="oss__cta">
          <a :href="repoUrl" class="pb-btn pb-btn--primary" target="_blank" rel="noopener">
            View the repo
            <span class="pb-btn__arrow" aria-hidden="true">&#8594;</span>
          </a>
          <a href="#readings" class="pb-btn pb-btn--ghost" @click="scrollTo($event, '#readings')">
            Try the dashboard
          </a>
        </div>
      </div>
    </MotionSection>

    <!-- ===================== FOOTER ===================== -->
    <footer class="footer">
      <div class="footer__inner">
        <div class="footer__brand">
          <img src="/brand-logo.png" alt="Paintbrush Outdoors" class="footer__logo" />
          <div>
            <p class="footer__name">DIY<span class="pb-gradient">Kestrel</span></p>
            <p class="footer__tag">Build. Explore. Create.</p>
          </div>
        </div>
        <p class="footer__copy">
          Engineered from the bottom of the lake to the top of the mountain.
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup>
  import { onMounted, ref } from 'vue'
  import MotionSection from '@/components/MotionSection.vue'
  import ReadingsDashboard from '@/components/ReadingsDashboard.vue'
  import { useScrollReveal } from '@/composables/useScrollReveal'

  const repoUrl = 'https://github.com/'

  const heroHints = ['No signal needed', 'Bluetooth direct', '3D-printed case', 'Open source']

  const miniStats = [
    { label: 'Pressure', value: '29.9', unit: 'inHg' },
    { label: 'Humidity', value: '41', unit: '%' },
    { label: 'Altitude', value: '512', unit: 'ft' },
  ]

  const howSteps = [
    {
      title: 'Printed + sensed',
      body: 'A 3D-printed enclosure houses a microcontroller and environmental sensors that sample the air around you.',
      accent: '#3ddc97',
    },
    {
      title: 'Streamed over BLE',
      body: 'The device advertises readings over Bluetooth Low Energy - a direct, local link with no router or signal required.',
      accent: '#5ab0ff',
    },
    {
      title: 'Read in the app',
      body: 'This installable app pairs with the device and shows big, glanceable numbers, even fully offline.',
      accent: '#7c5cff',
    },
  ]

  const measures = [
    { title: 'Temperature', icon: '\u{1F321}', body: 'Ambient air temperature in degrees Fahrenheit.', accent: '#3ddc97' },
    { title: 'Pressure', icon: '\u{1F4C9}', body: 'Barometric pressure in inHg for weather trends.', accent: '#5ab0ff' },
    { title: 'Humidity', icon: '\u{1F4A7}', body: 'Relative humidity as a percentage of saturation.', accent: '#7c5cff' },
    { title: 'Altitude', icon: '\u26F0', body: 'Estimated elevation in feet from pressure.', accent: '#ffb454' },
  ]

  const offlineFeatures = [
    { title: 'No signal required', icon: '\u{1F4F6}', body: 'Readings come over Bluetooth, not the internet. Use it deep in the backcountry.', accent: '#3ddc97' },
    { title: 'Installs as an app', icon: '\u2B07', body: 'Add it to your home screen. It launches and runs like a native app.', accent: '#5ab0ff' },
    { title: 'No cloud, no accounts', icon: '\u{1F512}', body: 'Your data stays on your device. No telemetry, no sign-up, no tracking.', accent: '#7c5cff' },
    { title: 'Cached & ready', icon: '\u26A1', body: 'A service worker precaches the whole app so it loads instantly with zero bars.', accent: '#ffb454' },
  ]

  const bom = [
    { name: 'Arduino Nano 33 BLE Sense Rev2 (BLE + onboard temp / pressure / humidity)', cost: '~$40' },
    { name: 'Custom PCB', cost: '~$5' },
    { name: 'LiPo battery', cost: '~$8' },
    { name: 'USB charge controller module (marked 03962a)', cost: '~$2' },
    { name: 'On/off switch + wiring', cost: '~$3' },
    { name: '3D printed enclosure (filament)', cost: '~$2' },
  ]

  const buildLinks = [
    { label: 'STL print files', sub: 'Enclosure + clip', href: repoUrl, icon: '\u{1F5A8}' },
    { label: 'Wiring diagram', sub: 'Sensor pinout', href: repoUrl, icon: '\u{1F50C}' },
    { label: 'Firmware', sub: 'Flash the device', href: repoUrl, icon: '\u{1F4BE}' },
  ]

  // ---- Motion ----
  const { reduced, timeline, gsap, revealStagger } = useScrollReveal()

  const heroRoot = ref(null)
  const eyebrow = ref(null)
  const intro = ref(null)
  const cta = ref(null)
  const hintsEl = ref(null)
  const visual = ref(null)
  const orb1 = ref(null)
  const orb2 = ref(null)

  const howGrid = ref(null)
  const measureGrid = ref(null)
  const offlineGrid = ref(null)
  const ossBlock = ref(null)

  function scrollTo (e, sel) {
    const target = document.querySelector(sel)
    if (!target) return
    e.preventDefault()
    target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
  }

  onMounted(() => {
    // Staggered card reveals
    revealStagger(howGrid.value, '.pb-card')
    revealStagger(measureGrid.value, '.pb-card')
    revealStagger(offlineGrid.value, '.pb-card')
    revealStagger(ossBlock.value, '> *')

    if (reduced) return

    const lines = heroRoot.value.querySelectorAll('.line__inner')
    const tl = timeline({ defaults: { ease: 'power3.out' } })

    tl.from(eyebrow.value, { opacity: 0, y: 18, duration: 0.6 })
      .from(lines, { yPercent: 110, opacity: 0, duration: 0.9, stagger: 0.12 }, '-=0.2')
      .from(intro.value, { opacity: 0, y: 22, duration: 0.7 }, '-=0.4')
      .from(cta.value.children, { opacity: 0, y: 18, duration: 0.6, stagger: 0.1 }, '-=0.4')
      .from(hintsEl.value.children, { opacity: 0, y: 14, duration: 0.5, stagger: 0.06 }, '-=0.3')
      .from(visual.value, { opacity: 0, y: 40, duration: 0.9 }, '-=0.7')

    gsap.to(orb1.value, { y: 40, x: 30, duration: 9, ease: 'sine.inOut', repeat: -1, yoyo: true })
    gsap.to(orb2.value, { y: -50, x: -25, duration: 11, ease: 'sine.inOut', repeat: -1, yoyo: true })
  })
</script>

<style scoped>
  .home {
    width: 100%;
    overflow-x: hidden;
  }

  /* ---------- Hero ---------- */
  .hero {
    position: relative;
    min-height: 100svh;
    display: flex;
    align-items: center;
    overflow: hidden;
    padding: 8rem 1.25rem 4rem;
  }

  .hero__bg {
    position: absolute;
    inset: 0;
    z-index: 0;
  }

  .orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(70px);
    will-change: transform;
  }

  .orb--green {
    width: 40vw;
    height: 40vw;
    max-width: 560px;
    max-height: 560px;
    top: -8%;
    left: -6%;
    background: radial-gradient(circle at 30% 30%, #3ddc97, transparent 70%);
    opacity: 0.45;
  }

  .orb--purple {
    width: 34vw;
    height: 34vw;
    max-width: 480px;
    max-height: 480px;
    bottom: -10%;
    right: -4%;
    background: radial-gradient(circle at 70% 70%, #7c5cff, transparent 70%);
    opacity: 0.4;
  }

  .hero__grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
    background-size: 64px 64px;
    mask-image: radial-gradient(ellipse 80% 60% at 50% 40%, #000 30%, transparent 75%);
    -webkit-mask-image: radial-gradient(ellipse 80% 60% at 50% 40%, #000 30%, transparent 75%);
  }

  .hero__inner {
    position: relative;
    z-index: 1;
    max-width: 1180px;
    margin: 0 auto;
    width: 100%;
    display: grid;
    grid-template-columns: 1.1fr 0.9fr;
    gap: 3rem;
    align-items: center;
  }

  .hero__eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    font-family: 'Space Grotesk', system-ui, sans-serif;
    font-size: 0.82rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #c9c9d6;
    margin: 0 0 1.5rem;
    padding: 0.5rem 0.9rem;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(6px);
  }

  .hero__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #3ddc97;
    box-shadow: 0 0 12px #3ddc97;
  }

  .hero__headline {
    font-family: 'Space Grotesk', system-ui, sans-serif;
    font-weight: 700;
    font-size: clamp(2.6rem, 7vw, 5.2rem);
    line-height: 0.98;
    letter-spacing: -0.03em;
    margin: 0;
    color: #f7f7fb;
  }

  .line {
    display: block;
    overflow: hidden;
    padding-bottom: 0.06em;
  }

  .line__inner {
    display: block;
  }

  .hero__headline em {
    font-style: normal;
  }

  .hero__intro {
    margin: 1.75rem 0 0;
    max-width: 540px;
    font-size: clamp(1.05rem, 2.2vw, 1.25rem);
    line-height: 1.6;
    color: #b3b3c0;
  }

  .hero__cta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.9rem;
    margin-top: 2.25rem;
  }

  .hero__hints {
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 0.75rem;
    padding: 0;
    margin: 2.5rem 0 0;
  }

  .hero__hints li {
    font-size: 0.78rem;
    letter-spacing: 0.04em;
    color: #7d7d8c;
    padding: 0.3rem 0.7rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 999px;
  }

  /* Device visual */
  .hero__visual {
    display: flex;
    justify-content: center;
  }

  .device {
    width: 100%;
    max-width: 360px;
    --pb-accent: #3ddc97;
  }

  .device__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
  }

  .device__logo {
    height: 38px;
    width: auto;
  }

  .device__readout {
    display: flex;
    flex-direction: column;
    margin-bottom: 1.5rem;
  }

  .device__value {
    font-family: 'Space Grotesk', system-ui, sans-serif;
    font-weight: 700;
    font-size: 3.4rem;
    line-height: 1;
    letter-spacing: -0.03em;
    color: #f4f4f8;
  }

  .device__value small {
    font-size: 1.4rem;
    color: #3ddc97;
    margin-left: 2px;
  }

  .device__unit {
    margin-top: 0.4rem;
    font-size: 0.8rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #8a8a99;
  }

  .device__mini {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.6rem;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    padding-top: 1.1rem;
  }

  .device__stat {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .device__statval {
    font-family: 'Space Grotesk', system-ui, sans-serif;
    font-weight: 600;
    font-size: 1.25rem;
    color: #f4f4f8;
  }

  .device__statval small {
    font-size: 0.7rem;
    color: #3ddc97;
    margin-left: 2px;
  }

  .device__statlabel {
    font-size: 0.68rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #8a8a99;
  }

  /* ---------- Grids ---------- */
  .grid {
    display: grid;
    gap: 1.1rem;
  }

  .grid--3 {
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  }

  .grid--4 {
    grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  }

  /* Steps */
  .step__num {
    font-family: 'Space Grotesk', system-ui, sans-serif;
    font-weight: 700;
    font-size: 0.9rem;
    color: var(--pb-accent, #3ddc97);
    letter-spacing: 0.1em;
  }

  .step__title {
    font-family: 'Space Grotesk', system-ui, sans-serif;
    font-size: 1.35rem;
    margin: 0.6rem 0 0.6rem;
    color: #f4f4f8;
  }

  .step__body {
    margin: 0;
    color: #a7a7b4;
    line-height: 1.6;
  }

  /* Measures */
  .measure__icon {
    font-size: 1.6rem;
  }

  .measure__title {
    font-family: 'Space Grotesk', system-ui, sans-serif;
    font-size: 1.2rem;
    margin: 0.8rem 0 0.5rem;
    color: #f4f4f8;
  }

  .measure__body {
    margin: 0;
    font-size: 0.92rem;
    color: #a7a7b4;
    line-height: 1.55;
  }

  /* Offline */
  .offline__icon {
    font-size: 1.5rem;
  }

  .offline__title {
    font-family: 'Space Grotesk', system-ui, sans-serif;
    font-size: 1.15rem;
    margin: 0.8rem 0 0.5rem;
    color: #f4f4f8;
  }

  .offline__body {
    margin: 0;
    font-size: 0.9rem;
    color: #a7a7b4;
    line-height: 1.55;
  }

  /* ---------- Build ---------- */
  .build {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.1rem;
  }

  .build__heading {
    font-family: 'Space Grotesk', system-ui, sans-serif;
    font-size: 1.3rem;
    margin: 0 0 1.2rem;
    color: #f4f4f8;
  }

  .build__list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .build__list li {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.7rem 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .build__part {
    color: #d4d4de;
    font-size: 0.95rem;
  }

  .build__cost {
    color: #3ddc97;
    font-family: 'Space Grotesk', system-ui, sans-serif;
    font-weight: 600;
    white-space: nowrap;
  }

  .build__total {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-top: 1.2rem;
    color: #8a8a99;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-size: 0.8rem;
  }

  .build__totalval {
    font-family: 'Space Grotesk', system-ui, sans-serif;
    font-weight: 700;
    font-size: 1.6rem;
    letter-spacing: -0.02em;
    color: #f4f4f8;
  }

  .build__note {
    margin: 0.9rem 0 0;
    font-size: 0.88rem;
    color: #a7a7b4;
  }

  .build__filesintro {
    margin: 0 0 1.3rem;
    color: #a7a7b4;
    line-height: 1.6;
  }

  .build__links {
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
  }

  .build__link {
    display: flex;
    align-items: center;
    gap: 0.9rem;
    padding: 0.85rem 1rem;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.02);
    text-decoration: none;
    transition: transform 0.25s ease, border-color 0.25s ease, background 0.25s ease;
  }

  .build__link:hover {
    transform: translateY(-3px);
    border-color: rgba(124, 92, 255, 0.6);
    background: rgba(124, 92, 255, 0.08);
  }

  .build__linkicon {
    font-size: 1.3rem;
  }

  .build__linklabel {
    display: block;
    color: #f4f4f8;
    font-weight: 600;
  }

  .build__linksub {
    display: block;
    color: #8a8a99;
    font-size: 0.82rem;
  }

  .build__linkarrow {
    margin-left: auto;
    color: #b89bff;
  }

  /* ---------- Open source ---------- */
  .oss__badges {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
    margin-bottom: 1.5rem;
  }

  .oss__text {
    margin: 0 0 2rem;
    font-size: 1.1rem;
    line-height: 1.6;
    color: #b3b3c0;
  }

  .oss__cta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.9rem;
  }

  /* ---------- Footer ---------- */
  .footer {
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    padding: 2.5rem 1.25rem;
  }

  .footer__inner {
    max-width: 1180px;
    margin: 0 auto;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 1.25rem;
  }

  .footer__brand {
    display: flex;
    align-items: center;
    gap: 0.85rem;
  }

  .footer__logo {
    height: 44px;
    width: auto;
  }

  .footer__name {
    font-family: 'Space Grotesk', system-ui, sans-serif;
    font-weight: 700;
    font-size: 1.2rem;
    margin: 0;
    color: #f4f4f8;
  }

  .footer__tag {
    margin: 0.1rem 0 0;
    font-size: 0.82rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #8a8a99;
  }

  .footer__copy {
    margin: 0;
    color: #8a8a99;
    font-size: 0.9rem;
  }

  /* ---------- Responsive ---------- */
  @media (max-width: 900px) {
    .hero__inner {
      grid-template-columns: 1fr;
      gap: 2.5rem;
    }
    .hero__visual {
      order: -1;
      justify-content: flex-start;
    }
    .build {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 560px) {
    .hero {
      padding-top: 7rem;
    }
  }
</style>
