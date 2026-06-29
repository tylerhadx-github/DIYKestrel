<template>
  <div class="dash">
    <!-- Connection control bar -->
    <div class="dash__bar">
      <div class="dash__state">
        <span
          class="pb-badge"
          :class="statusBadgeClass"
        >
          <span class="pb-badge__dot"></span>
          {{ statusLabel }}
        </span>
        <span class="dash__hint">{{ statusHint }}</span>
      </div>

      <div class="dash__actions">
        <button
          v-if="!isConnected"
          class="pb-btn pb-btn--primary dash__connect"
          :disabled="connecting || !bluetoothSupported"
          @click="connectToDevice"
        >
          {{ connecting ? 'Connecting...' : 'Connect device' }}
          <span class="pb-btn__arrow" aria-hidden="true">&#8594;</span>
        </button>

        <button
          v-if="!isConnected && (error || !bluetoothSupported)"
          class="pb-btn dash__locate"
          :disabled="locating"
          @click="useLocationWeather"
        >
          {{ locating ? 'Locating...' : 'Use my location' }}
        </button>
      </div>
    </div>

    <!-- Unsupported / error notices -->
    <p v-if="!bluetoothSupported" class="dash__notice dash__notice--warn">
      This browser doesn't support Web Bluetooth. The readings stream needs a
      Chromium-based browser (Chrome, Edge, or Android). Everything else on this
      page still works fully offline.
    </p>
    <p v-else-if="error" class="dash__notice dash__notice--error">{{ error }}</p>
    <p v-if="locationError" class="dash__notice dash__notice--error">{{ locationError }}</p>
    <p v-else-if="hasLocationData" class="dash__notice dash__notice--info">
      Showing nearest weather data for your location (Open-Meteo), not your
      device.<span v-if="lastUpdatedLabel"> Updated {{ lastUpdatedLabel }}.</span>
    </p>

    <!-- Live readings grid -->
    <div class="dash__grid" :class="{ 'dash__grid--idle': !isConnected && !hasLocationData }">
      <article
        v-for="card in cards"
        :key="card.key"
        class="pb-card reading"
        :style="{ '--pb-accent': card.accent }"
      >
        <header class="reading__head">
          <span class="reading__icon" aria-hidden="true">{{ card.icon }}</span>
          <span class="reading__label">{{ card.label }}</span>
        </header>
        <div class="reading__value">
          <span class="reading__number">{{ displayValue(card.value) }}</span>
          <span class="reading__unit">{{ card.unit }}</span>
        </div>
        <p class="reading__sub">{{ card.sub }}</p>
      </article>
    </div>
  </div>
</template>

<script>
const POLL_MS = 5 * 60 * 1000;

export default {
  name: 'ReadingsDashboard',
  data() {
    return {
      isConnected: false,
      connecting: false,
      temperatureC: null,
      temperatureF: null,
      pressureK: null,
      pressureH: null,
      humidity: null,
      altitudeM: null,
      altitudeF: null,
      error: null,
      source: null,
      locating: false,
      locationError: null,
      lastUpdated: null,
      coords: null,
      pollTimer: null,
    };
  },
  computed: {
    bluetoothSupported() {
      return typeof navigator !== 'undefined' && !!navigator.bluetooth;
    },
    hasLocationData() {
      return this.source === 'location';
    },
    lastUpdatedLabel() {
      if (!this.lastUpdated) return '';
      return new Date(this.lastUpdated).toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
      });
    },
    statusLabel() {
      if (this.isConnected) return 'Live';
      if (this.connecting) return 'Connecting';
      if (this.locating) return 'Locating';
      if (this.hasLocationData) return 'Nearest data';
      if (this.error) return 'Error';
      return 'Standby';
    },
    statusBadgeClass() {
      if (this.isConnected) return 'pb-badge--live';
      if (this.hasLocationData) return 'pb-badge--live';
      if (this.error) return 'pb-badge--error';
      return 'pb-badge--progress';
    },
    statusHint() {
      if (this.isConnected) return 'Streaming over Bluetooth - no signal needed';
      if (this.connecting) return 'Pairing with your Kestrel...';
      if (this.locating) return 'Finding the nearest weather data...';
      if (this.hasLocationData) return 'Showing nearest weather data for your location';
      return 'Pair your Kestrel to see live readings';
    },
    cards() {
      return [
        {
          key: 'temperature',
          label: 'Temperature',
          icon: '\u{1F321}',
          unit: '\u00B0F',
          value: this.temperatureF,
          accent: '#3ddc97',
          sub: 'Ambient air temperature',
        },
        {
          key: 'pressure',
          label: 'Pressure',
          icon: '\u{1F4C9}',
          unit: 'inHg',
          value: this.pressureH,
          accent: '#5ab0ff',
          sub: 'Barometric pressure',
        },
        {
          key: 'humidity',
          label: 'Humidity',
          icon: '\u{1F4A7}',
          unit: '%',
          value: this.humidity,
          accent: '#7c5cff',
          sub: 'Relative humidity',
        },
        {
          key: 'altitude',
          label: 'Altitude',
          icon: '\u26F0',
          unit: 'ft',
          value: this.altitudeF,
          accent: '#ffb454',
          sub: 'Estimated elevation',
        },
      ];
    },
    pressureInHg() {
      return (this.pressureK * 0.2953).toFixed(2);
    },
    altitudeFeet() {
      return (this.altitudeM * 3.28084).toFixed(2);
    },
  },
  methods: {
    displayValue(value) {
      return value === null || value === undefined ? '--' : value;
    },
    async connectToDevice() {
      this.error = null;
      this.connecting = true;
      try {
        this.device = await navigator.bluetooth.requestDevice({
          filters: [{ name: 'haddix diy kestrel' }],
          optionalServices: ['00007171-0000-1000-8000-00805f9b34fb'],
        });

        this.server = await this.device.gatt.connect();

        const service = await this.server.getPrimaryService(
          '00007171-0000-1000-8000-00805f9b34fb'
        );

        await this.readAllCharacteristics(service);
        this.isConnected = true;
        this.source = 'device';
        this.locationError = null;
        this.stopLocationPolling();
      } catch (error) {
        console.error('Failed to connect or read from the device:', error);
        this.error = 'Failed to connect or read from the device.';
      } finally {
        this.connecting = false;
      }
    },
    async useLocationWeather() {
      this.locationError = null;
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        this.locationError = 'Location services are not available in this browser.';
        return;
      }
      this.locating = true;
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0,
          });
        });
        this.coords = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };
        await this.fetchLocationWeather();
        this.source = 'location';
        this.error = null;
        this.startLocationPolling();
      } catch (error) {
        console.error('Failed to load location weather:', error);
        if (error && error.code === 1) {
          this.locationError = 'Location permission denied. Allow location access to see nearest weather data.';
        } else if (error && (error.code === 2 || error.code === 3)) {
          this.locationError = 'Could not determine your location. Try again with a clearer signal.';
        } else {
          this.locationError = 'Could not load nearest weather data. Please try again.';
        }
      } finally {
        this.locating = false;
      }
    },
    async fetchLocationWeather() {
      if (!this.coords) return;
      const { lat, lon } = this.coords;
      const url =
        'https://api.open-meteo.com/v1/forecast' +
        `?latitude=${lat}&longitude=${lon}` +
        '&current=temperature_2m,relative_humidity_2m,surface_pressure' +
        '&temperature_unit=fahrenheit&timezone=auto';

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Open-Meteo request failed: ${response.status}`);
      }
      const data = await response.json();
      const current = data.current || {};

      if (typeof current.temperature_2m === 'number') {
        this.temperatureF = current.temperature_2m.toFixed(2);
      }
      if (typeof current.relative_humidity_2m === 'number') {
        this.humidity = current.relative_humidity_2m.toFixed(2);
      }
      if (typeof current.surface_pressure === 'number') {
        this.pressureH = (current.surface_pressure * 0.02953).toFixed(2);
      }
      if (typeof data.elevation === 'number') {
        this.altitudeF = (data.elevation * 3.28084).toFixed(2);
      }
      this.lastUpdated = Date.now();
    },
    startLocationPolling() {
      this.stopLocationPolling();
      this.pollTimer = setInterval(() => {
        this.fetchLocationWeather().catch((error) => {
          console.error('Failed to refresh location weather:', error);
        });
      }, POLL_MS);
    },
    stopLocationPolling() {
      if (this.pollTimer) {
        clearInterval(this.pollTimer);
        this.pollTimer = null;
      }
    },
    async readAllCharacteristics(service) {
      try {
        await this.readCharacteristic(service, '10009876-0000-1000-8000-00805f9b34fb', 'temperatureC');
        await this.readCharacteristic(service, '20009876-0000-1000-8000-00805f9b34fb', 'temperatureF');
        await this.readCharacteristic(service, '30009876-0000-1000-8000-00805f9b34fb', 'pressureK');
        await this.readCharacteristic(service, '40009876-0000-1000-8000-00805f9b34fb', 'pressureH');
        await this.readCharacteristic(service, '50009876-0000-1000-8000-00805f9b34fb', 'humidity');
        await this.readCharacteristic(service, '60009876-0000-1000-8000-00805f9b34fb', 'altitudeF');
        await this.readCharacteristic(service, '70009876-0000-1000-8000-00805f9b34fb', 'altitudeM');
      } catch (error) {
        console.error('Error reading characteristics:', error);
        this.error = 'Error reading characteristics.';
      }
    },
    async readCharacteristic(service, uuid, property) {
      try {
        const characteristic = await service.getCharacteristic(uuid);
        const value = await characteristic.readValue();
        this[property] = this.parseValue(value, property);

        characteristic.startNotifications();
        characteristic.addEventListener('characteristicvaluechanged', (event) => {
          this[property] = this.parseValue(event.target.value, property);
        });
      } catch (error) {
        console.error(`Failed to read ${property}:`, error);
        // Optionally handle the error, retry, or perform recovery actions
        setTimeout(() => {
          this.readCharacteristic(service, uuid, property);
        }, 1000); // Retry after 5 seconds
      }
    },
    parseValue(value, property) {
      let parsedValue;
      switch (property) {
        case 'temperatureC':
        case 'temperatureF':
        case 'pressureK':
        case 'pressureH':
          parsedValue = value.getFloat32(0, true).toFixed(2);
          break;
        case 'humidity':
          parsedValue = value.getFloat32(0, true).toFixed(2);
          break;
        case 'altitudeM':
        case 'altitudeF':
          parsedValue = value.getFloat32(0, true).toFixed(2);
          break;
        default:
          parsedValue = 'N/A';
      }
      return parsedValue;
    },
  },
  beforeUnmount() {
    this.stopLocationPolling();
  },
};
</script>

<style scoped>
  .dash {
    width: 100%;
  }

  .dash__bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.75rem;
  }

  .dash__state {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .dash__hint {
    color: #a7a7b4;
    font-size: 0.95rem;
  }

  .dash__actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.6rem;
  }

  .dash__connect {
    border: none;
  }

  .dash__connect:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    transform: none;
  }

  .dash__locate {
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.22);
    color: #d6d6e0;
  }

  .dash__locate:hover:not(:disabled) {
    border-color: rgba(255, 255, 255, 0.4);
    color: #f4f4f8;
  }

  .dash__locate:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    transform: none;
  }

  .dash__notice {
    margin: 0 0 1.5rem;
    padding: 0.9rem 1.1rem;
    border-radius: 14px;
    font-size: 0.95rem;
    line-height: 1.5;
    border: 1px solid transparent;
  }

  .dash__notice--warn {
    color: #ffb454;
    background: rgba(255, 180, 84, 0.1);
    border-color: rgba(255, 180, 84, 0.3);
  }

  .dash__notice--error {
    color: #ff5d73;
    background: rgba(255, 93, 115, 0.1);
    border-color: rgba(255, 93, 115, 0.3);
  }

  .dash__notice--info {
    color: #5ab0ff;
    background: rgba(90, 176, 255, 0.1);
    border-color: rgba(90, 176, 255, 0.3);
  }

  .dash__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1.1rem;
  }

  .dash__grid--idle {
    opacity: 0.75;
  }

  .reading {
    padding: 1.5rem 1.5rem 1.35rem;
  }

  .reading__head {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    margin-bottom: 1.1rem;
  }

  .reading__icon {
    font-size: 1.2rem;
    line-height: 1;
  }

  .reading__label {
    font-family: 'Space Grotesk', system-ui, sans-serif;
    font-size: 0.78rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #8a8a99;
  }

  .reading__value {
    display: flex;
    align-items: baseline;
    gap: 0.4rem;
  }

  .reading__number {
    font-family: 'Space Grotesk', system-ui, sans-serif;
    font-weight: 700;
    font-size: clamp(2.4rem, 6vw, 3.4rem);
    line-height: 1;
    letter-spacing: -0.03em;
    color: #f4f4f8;
    font-variant-numeric: tabular-nums;
  }

  .reading__unit {
    font-family: 'Space Grotesk', system-ui, sans-serif;
    font-weight: 600;
    font-size: 1.1rem;
    color: var(--pb-accent, #3ddc97);
  }

  .reading__sub {
    margin: 0.7rem 0 0;
    font-size: 0.85rem;
    color: #8a8a99;
  }
</style>
