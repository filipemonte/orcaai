<template>
  <div>
    <div class="space-y-3">
      <div>
        <label class="block mb-2 text-sm font-medium text-gray-700">Selecione o serviço:</label>
        <select v-model="selectedId" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
          <option disabled value="">Escolha um serviço</option>
          <option
            v-for="s in services"
            :key="s.id"
            :value="s.id"
          >
            {{ s.name }}
          </option>
        </select>
      </div>

      <div v-if="selectedService">
        <label class="block mb-2 text-sm font-medium text-gray-700">Quantidade ({{ selectedService.unit }}):</label>
        <input 
          type="number" 
          class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
          v-model.number="qty"
          placeholder="Ex: 10"
        />
      </div>

      <div v-if="selectedService">
        <label class="block mb-2 text-sm font-medium text-gray-700">Dificuldade (ajuste de preço):</label>
        <div class="flex items-center gap-4">
          <input 
            type="range" 
            min="1" 
            max="10" 
            v-model.number="difficulty"
            class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <span class="text-lg font-semibold text-blue-600 w-12 text-center">{{ difficulty }}</span>
        </div>
        <div class="flex justify-between text-xs text-gray-500 mt-1">
          <span>Fácil (1)</span>
          <span>Difícil (10)</span>
        </div>
        <div v-if="difficulty > 1" class="mt-2 text-sm text-blue-600">
          Preço m2 ajustado: R$ {{ adjustedPrice.toFixed(2) }} ({{ difficultyMultiplier }}x)
        </div>
      </div>

      <div v-if="selectedService">
        <label class="block mb-2 text-sm font-medium text-gray-700">Observação (opcional):</label>
        <textarea 
          v-model="observation" 
          class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none" 
          rows="3"
          placeholder="Adicione detalhes ou observações sobre este serviço..."
        ></textarea>
      </div>

      <button
        class="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        @click="addItem"
        :disabled="!selectedService || qty <= 0"
      >
        Adicionar ao Orçamento
      </button>
    </div>

    <div v-if="items.length">
      <hr class="my-6 border-gray-200" />

      <h3 class="text-2xl font-bold mb-3 text-gray-800">Itens do orçamento</h3>

        <div class="space-y-3">
          <div v-for="(item, index) in items" :key="index" class="p-4 bg-gradient-to-r from-gray-50 to-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md transition-shadow">
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <div class="font-semibold text-gray-800 text-lg">{{ item.name }}</div>
                <div class="text-sm text-gray-600 mt-1">
                  {{ item.qty }} {{ services.find(s => s.id === item.id)?.unit }} × R$ {{ item.price.toFixed(2) }} =  
                  <strong class="text-blue-600">R$ {{ (item.qty * item.price).toFixed(2) }}</strong>
                </div>
                <div v-if="item.difficulty > 1" class="text-xs text-gray-500 mt-1">
                  Dificuldade: {{ item.difficulty }}/10 (Base: R$ {{ item.basePrice.toFixed(2) }})
                </div>
                <div v-if="item.observation" class="text-sm text-gray-500 mt-2 italic border-l-2 border-blue-300 pl-3">
                  {{ item.observation }}
                </div>
              </div>
              <button
                @click="removeItem(index)"
                class="ml-4 p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all"
                aria-label="Remover item"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div class="mt-4 p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-lg">
          <div class="flex justify-between items-center">
            <span class="text-lg font-semibold">Total:</span>
            <span class="text-2xl font-bold">R$ {{ total.toFixed(2) }}</span>
          </div>
        </div>

        <button
          class="w-full mt-3 px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
          @click="generatePDF"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Gerar PDF do Orçamento
        </button>
      </div>
    </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { jsPDF } from "jspdf";
import services from "../data/services.json";

const selectedId = ref("");
const qty = ref(0);
const difficulty = ref(1);
const observation = ref("");
const items = ref([]);

const selectedService = computed(() =>
  services.find((s) => s.id === selectedId.value)
);

const difficultyMultiplier = computed(() => {
  return 1 + (difficulty.value / 10);
});

const adjustedPrice = computed(() => {
  if (!selectedService.value) return 0;
  return selectedService.value.price * difficultyMultiplier.value;
});

function addItem() {
  items.value.push({
    id: selectedService.value.id,
    name: selectedService.value.name,
    price: adjustedPrice.value,
    basePrice: selectedService.value.price,
    difficulty: difficulty.value,
    qty: qty.value,
    observation: observation.value
  });

  qty.value = 0;
  difficulty.value = 1;
  observation.value = "";
  selectedId.value = "";
}

function removeItem(index) {
  items.value.splice(index, 1);
}

const total = computed(() =>
  items.value.reduce((acc, i) => acc + i.qty * i.price, 0)
);

function generatePDF() {
  const doc = new jsPDF();
  
  // Título
  doc.setFontSize(20);
  doc.text("Orçamento de Pintura", 20, 20);
  
  // Data
  doc.setFontSize(10);
  const today = new Date().toLocaleDateString('pt-BR');
  doc.text(`Data: ${today}`, 20, 30);
  
  // Linha separadora
  doc.line(20, 35, 190, 35);
  
  // Cabeçalho da tabela
  doc.setFontSize(12);
  doc.text("Serviço", 20, 45);
  doc.text("Qtd", 120, 45);
  doc.text("Preço Unit.", 145, 45);
  doc.text("Subtotal", 175, 45);
  
  // Itens
  let y = 55;
  doc.setFontSize(10);
  
  items.value.forEach((item, index) => {
    // Nome do serviço
    doc.text(item.name, 20, y);
    
    // Quantidade
    doc.text(item.qty.toString(), 120, y);
    
    // Preço unitário
    doc.text(`R$ ${item.price.toFixed(2)}`, 145, y);
    
    // Subtotal
    const subtotal = item.qty * item.price;
    doc.text(`R$ ${subtotal.toFixed(2)}`, 175, y);
    
    y += 7;
    
    // Observação (se existir)
    if (item.observation) {
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(`Obs: ${item.observation}`, 25, y);
      doc.setTextColor(0);
      doc.setFontSize(10);
      y += 7;
    }
    
    // Nova página se necessário
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  });
  
  // Linha antes do total
  y += 5;
  doc.line(20, y, 190, y);
  
  // Total
  y += 10;
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text(`Total: R$ ${total.value.toFixed(2)}`, 145, y);
  
  // Salvar PDF
  doc.save(`orcamento-pintura-${today.replace(/\//g, '-')}.pdf`);
}
</script>
