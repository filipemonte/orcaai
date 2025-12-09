<template>
  <div class="p-3 mb-2 bg-white shadow rounded flex items-center justify-between">
    <div>
      <div class="font-semibold">{{ service.name }}</div>
      <div class="text-sm text-gray-600">{{ service.unit }} — R$ {{ service.price.toFixed(2) }}</div>
    </div>

    <div class="flex items-center gap-2">
      <button
        class="px-3 py-1 bg-blue-600 text-white rounded"
        @click="$emit('add', service)"
        type="button"
      >
        Adicionar
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  service: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
/* Pequeno ajuste visual se quiser */
</style>
