import { ref } from 'vue';

const API_URL = '/api/services';
const isDevelopment = import.meta.env.DEV;

// Mock local storage for development
const STORAGE_KEY = 'services_local';

const getLocalServices = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  // Default services for development
  return [];
};

const saveLocalServices = (services) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(services));
};

export function useServices() {
  const services = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const fetchServices = async () => {
    loading.value = true;
    error.value = null;
    try {
      if (isDevelopment) {
        // Use local storage in development
        const localServices = getLocalServices();
        if (localServices.length === 0) {
          // Load initial data from JSON file
          const response = await fetch('/src/data/services.json');
          if (response.ok) {
            const initialData = await response.json();
            saveLocalServices(initialData);
            services.value = initialData;
          }
        } else {
          services.value = localServices;
        }
      } else {
        // Use API in production
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch services');
        services.value = await response.json();
      }
    } catch (e) {
      error.value = e.message;
      console.error('Error fetching services:', e);
    } finally {
      loading.value = false;
    }
  };

  const addService = async (service) => {
    loading.value = true;
    error.value = null;
    try {
      if (isDevelopment) {
        // Add to local storage in development
        const maxId = services.value.length > 0 
          ? Math.max(...services.value.map(s => s.id)) 
          : 100000;
        const newService = {
          id: maxId + 1,
          name: service.name,
          unit: service.unit,
          price: parseFloat(service.price)
        };
        services.value.push(newService);
        saveLocalServices(services.value);
        return newService;
      } else {
        // Use API in production
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(service)
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to add service');
        }
        const newService = await response.json();
        services.value.push(newService);
        return newService;
      }
    } catch (e) {
      error.value = e.message;
      console.error('Error adding service:', e);
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const updateService = async (id, updates) => {
    loading.value = true;
    error.value = null;
    try {
      if (isDevelopment) {
        // Update local storage in development
        const index = services.value.findIndex(s => s.id === id);
        if (index !== -1) {
          services.value[index] = {
            id: id,
            name: updates.name || services.value[index].name,
            unit: updates.unit || services.value[index].unit,
            price: updates.price !== undefined 
              ? parseFloat(updates.price) 
              : services.value[index].price
          };
          saveLocalServices(services.value);
          return services.value[index];
        }
        throw new Error('Service not found');
      } else {
        // Use API in production
        const response = await fetch(`${API_URL}/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update service');
        }
        const updatedService = await response.json();
        const index = services.value.findIndex(s => s.id === id);
        if (index !== -1) {
          services.value[index] = updatedService;
        }
        return updatedService;
      }
    } catch (e) {
      error.value = e.message;
      console.error('Error updating service:', e);
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const deleteService = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      if (isDevelopment) {
        // Delete from local storage in development
        services.value = services.value.filter(s => s.id !== id);
        saveLocalServices(services.value);
      } else {
        // Use API in production
        const response = await fetch(`${API_URL}/${id}`, {
          method: 'DELETE'
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete service');
        }
        services.value = services.value.filter(s => s.id !== id);
      }
    } catch (e) {
      error.value = e.message;
      console.error('Error deleting service:', e);
      throw e;
    } finally {
      loading.value = false;
    }
  };

  return {
    services,
    loading,
    error,
    fetchServices,
    addService,
    updateService,
    deleteService
  };
}
