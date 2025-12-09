<template>
  <div class="grid gap-3 md:grid-cols-2">
    <div v-for="s in services" :key="s.id" class="p-4 bg-gradient-to-r from-gray-50 to-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md transition-all">
      <div class="flex justify-between items-start">
        <div>
          <div class="font-semibold text-gray-800 text-lg">{{ s.name }}</div>
          <div class="text-sm text-gray-500 mt-1">{{ s.unit }}</div>
        </div>
        <div class="text-right">
          <div class="text-xs text-gray-500 mb-1">Preço</div>
          <div class="text-xl font-bold text-blue-600">R$ {{ s.price.toFixed(2) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import services from "../data/services.json";
</script>

