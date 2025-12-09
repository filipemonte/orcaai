<template>
  <div>
    <!-- Header with Add Button -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800">Serviços</h2>
      <button 
        @click="showAddModal = true"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        + Adicionar Serviço
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="mt-2 text-gray-600">Carregando serviços...</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
      <div class="flex justify-between items-center">
        <div>
          <strong>Erro:</strong> {{ error }}
          <p v-if="error.includes('timeout')" class="text-sm mt-2">
            Parece que o Redis não foi populado. Clique no botão ao lado para popular os dados.
          </p>
        </div>
        <button 
          v-if="error.includes('timeout') || services.length === 0"
          @click="seedDatabase"
          :disabled="seeding"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
        >
          {{ seeding ? 'Populando...' : '🌱 Popular Dados' }}
        </button>
      </div>
    </div>

    <!-- Services Grid -->
    <div v-if="!loading" class="grid gap-3 md:grid-cols-2">
      <div v-for="s in services" :key="s.id" class="p-4 bg-gradient-to-r from-gray-50 to-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md transition-all">
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <div class="font-semibold text-gray-800 text-lg">{{ s.name }}</div>
            <div class="text-sm text-gray-500 mt-1">{{ s.unit }}</div>
          </div>
          <div class="text-right">
            <div class="text-xs text-gray-500 mb-1">Preço</div>
            <div class="text-xl font-bold text-blue-600">R$ {{ s.price.toFixed(2) }}</div>
          </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="flex gap-2 mt-3 pt-3 border-t border-gray-200">
          <button 
            @click="editService(s)"
            class="flex-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            ✏️ Editar
          </button>
          <button 
            @click="confirmDelete(s)"
            class="flex-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
          >
            🗑️ Excluir
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && services.length === 0 && !error" class="text-center py-12">
      <p class="text-gray-500 text-lg">Nenhum serviço cadastrado.</p>
      <p class="text-gray-400 text-sm mt-2">Clique em "Adicionar Serviço" para começar.</p>
      <button 
        @click="seedDatabase"
        :disabled="seeding"
        class="mt-4 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
      >
        {{ seeding ? 'Populando...' : '🌱 Popular Dados Iniciais' }}
      </button>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal || editingService" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h3 class="text-xl font-bold text-gray-800 mb-4">
          {{ editingService ? 'Editar Serviço' : 'Adicionar Serviço' }}
        </h3>
        
        <form @submit.prevent="saveService">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nome do Serviço</label>
              <input 
                v-model="formData.name"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Pintura parede interna"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Unidade</label>
              <input 
                v-model="formData.unit"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: m², unidade, etc."
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
              <input 
                v-model.number="formData.price"
                type="number"
                step="0.01"
                min="0"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: 15.50"
              />
            </div>
          </div>
          
          <div class="flex gap-3 mt-6">
            <button 
              type="button"
              @click="cancelEdit"
              class="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {{ editingService ? 'Salvar' : 'Adicionar' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="deletingService" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h3 class="text-xl font-bold text-gray-800 mb-2">Confirmar Exclusão</h3>
        <p class="text-gray-600 mb-4">
          Tem certeza que deseja excluir o serviço <strong>{{ deletingService.name }}</strong>?
        </p>
        <p class="text-sm text-gray-500 mb-6">Esta ação não pode ser desfeita.</p>
        
        <div class="flex gap-3">
          <button 
            @click="deletingService = null"
            class="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button 
            @click="performDelete"
            class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useServices } from '../composables/useServices';

const { services, loading, error, fetchServices, addService, updateService, deleteService } = useServices();

const showAddModal = ref(false);
const editingService = ref(null);
const deletingService = ref(null);
const seeding = ref(false);
const formData = ref({
  name: '',
  unit: '',
  price: 0
});

onMounted(() => {
  fetchServices();
});

const seedDatabase = async () => {
  seeding.value = true;
  try {
    const response = await fetch('/api/seed', {
      method: 'POST'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to seed database');
    }
    
    const result = await response.json();
    console.log('Seed result:', result);
    alert(`✅ ${result.message}\n${result.count} serviços foram adicionados!`);
    
    // Reload services
    await fetchServices();
  } catch (e) {
    console.error('Error seeding database:', e);
    alert('❌ Erro ao popular banco de dados: ' + e.message);
  } finally {
    seeding.value = false;
  }
};

const editService = (service) => {
  editingService.value = service;
  formData.value = {
    name: service.name,
    unit: service.unit,
    price: service.price
  };
};

const cancelEdit = () => {
  showAddModal.value = false;
  editingService.value = null;
  formData.value = { name: '', unit: '', price: 0 };
};

const saveService = async () => {
  try {
    if (editingService.value) {
      await updateService(editingService.value.id, formData.value);
    } else {
      await addService(formData.value);
    }
    cancelEdit();
  } catch (e) {
    alert('Erro ao salvar serviço: ' + e.message);
  }
};

const confirmDelete = (service) => {
  deletingService.value = service;
};

const performDelete = async () => {
  try {
    await deleteService(deletingService.value.id);
    deletingService.value = null;
  } catch (e) {
    alert('Erro ao excluir serviço: ' + e.message);
  }
};
</script>

