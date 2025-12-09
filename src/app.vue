<template>
  <div class="min-h-screen bg-white">
    <AppHeader :currentPage="page" @navigate="page = $event" />
    
    <main class="pt-20 p-6 max-w-4xl mx-auto">
      <Serviços v-if="page === 'servicos'" />
      <Orçamento v-if="page === 'orcamento'" />
    </main>
  </div>
</template>

<script setup>
import { ref } from "vue";
import AppHeader from "./components/AppHeader.vue";
import Serviços from "./pages/Services.vue";
import Orçamento from "./pages/Quote.vue";

const page = ref("orcamento");
</script>
