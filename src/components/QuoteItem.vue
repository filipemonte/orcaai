<template>
  <div class="p-3 mb-2 bg-white shadow rounded flex items-center justify-between gap-4">
    <div class="flex-1">
      <div class="font-medium">{{ item.name }}</div>
      <div class="text-sm text-gray-600">{{ item.unit }} — R$ {{ item.price.toFixed(2) }}</div>
    </div>

    <div class="flex items-center gap-2">
      <input
        type="number"
        min="0"
        class="w-20 border p-1 rounded text-right"
        v-model.number="localQty"
        @change="emitUpdate"
      />
      <div class="w-32 text-right">
        R$ <span class="font-semibold">{{ (localQty * item.price).toFixed(2) }}</span>
      </div>

      <button
        class="text-red-600 px-2 py-1"
        @click="$emit('remove', item.id)"
        type="button"
        title="Remover item"
      >
        Remover
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})
const emit = defineEmits(['update', 'remove'])

const localQty = ref(props.item.qty || 0)

// Keep localQty in sync if parent changes it
watch(() => props.item.qty, (v) => {
  localQty.value = v
})

function emitUpdate() {
  const qty = Number(localQty.value) || 0
  emit('update', { id: props.item.id, qty })
}
</script>

<style scoped>
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
