<template>
  <header class="fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-50">
    <div class="flex items-center py-4 px-6">
      <!-- Menu Hamburguer -->
      <button
        @click="toggleMenu"
        class="p-2 text-gray-700 hover:text-gray-900 focus:outline-none transition-all"
        aria-label="Menu"
      >
        <svg
          class="w-7 h-7"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            v-if="!isMenuOpen"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
          <path
            v-else
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      <!-- Título da Página -->
      <h1 class="text-3xl font-bold text-gray-800 ml-6">{{ pageTitle }}</h1>
    </div>

    <!-- Overlay -->
    <div
      v-if="isMenuOpen"
      @click="isMenuOpen = false"
      class="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
    ></div>

    <!-- Menu Lateral -->
    <nav
      :class="[
        'fixed top-0 left-0 h-full w-72 bg-white shadow-2xl z-40 transform transition-transform duration-300',
        isMenuOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <div class="pt-24 px-0">
        <h2 class="text-2xl font-bold mb-8 text-gray-800 px-8">GBL Pintura</h2>
        
        <div class="space-y-0">
          <button
            @click="navigate('orcamento')"
            :class="[
              'w-full text-left px-8 py-4 transition-all font-medium',
              currentPage === 'orcamento' 
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' 
                : 'hover:bg-gray-100 text-gray-700'
            ]"
          >
            <div class="flex items-center">
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Orçamento
            </div>
          </button>

          <button
            @click="navigate('servicos')"
            :class="[
              'w-full text-left px-8 py-4 transition-all font-medium',
              currentPage === 'servicos' 
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' 
                : 'hover:bg-gray-100 text-gray-700'
            ]"
          >
            <div class="flex items-center">
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Serviços
            </div>
          </button>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  currentPage: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['navigate']);

const isMenuOpen = ref(false);

const pageTitle = computed(() => {
  return props.currentPage === 'orcamento' ? 'Orçamento' : 'Serviços';
});

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value;
}

function navigate(page) {
  emit('navigate', page);
  isMenuOpen.value = false;
}
</script>
