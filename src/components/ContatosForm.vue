<template>
    <div class="contact-form-container">
      <div class="form-wrapper">
        <Card class="contact-card">
          <template #title>
            {{ isEdit ? 'Editar Contato' : 'Novo Contato' }}
          </template>
          
          <template #content>
            <form @submit.prevent="save" class="contact-form">
              <div class="field-group">
                <label for="nome" class="field-label">Nome</label>
                <InputText 
                  id="nome"
                  v-model="contato.nome" 
                  placeholder="Digite o nome completo"
                  class="field-input w-full"
                  required
                />
              </div>
  
              <div class="field-group">
                <label for="email" class="field-label">Email</label>
                <InputText 
                  id="email"
                  v-model="contato.email" 
                  type="email"
                  placeholder="exemplo@email.com"
                  class="field-input w-full"
                  required
                />
              </div>
  
              <div class="field-group">
                <label for="telefone" class="field-label">Telefone</label>
                <InputText 
                  id="telefone"
                  v-model="contato.telefone" 
                  placeholder="(11) 99999-9999"
                  class="field-input w-full"
                  required
                />
              </div>
  
              <div class="button-group">
                <Button 
                  type="button" 
                  label="Cancelar"
                  severity="secondary"
                  outlined
                  @click="router.push('/contatos')"
                  class="cancel-btn"
                />
                
                <Button 
                  type="submit" 
                  :label="isEdit ? 'Atualizar' : 'Salvar'"
                  class="save-btn"
                  :loading="loading"
                />
              </div>
            </form>
          </template>
        </Card>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import api from '../services/api'
  import Card from 'primevue/card'
  import InputText from 'primevue/inputtext'
  import Button from 'primevue/button'
  
  const route = useRoute()
  const router = useRouter()
  const contato = ref({ nome: '', email: '', telefone: '', usuarioId:  localStorage.getItem('userId')})
  const loading = ref(false)
  
  const isEdit = route.params.id != null
  
  const save = async () => {
    try {
      loading.value = true
      
      if (isEdit) {
        await api.put(`/v1/contatos/${route.params.id}`, contato.value)
      } else {
        await api.post('/v1/contatos', contato.value)
      }
      
      router.push('/contatos')
    } catch (error) {
      console.error('Erro ao salvar contato:', error)
    } finally {
      loading.value = false
    }
  }
  
  onMounted(async () => {
    if (isEdit) {
      try {
        const response = await api.get(`/v1/contatos/${route.params.id}`)
        contato.value = response.data
      } catch (error) {
        console.error('Erro ao carregar contato:', error)
      }
    }
  })
  </script>
  
  <style scoped>
  .contact-form-container {
    padding: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
  }
  
  .form-wrapper {
    width: 100%;
    max-width: 500px;
  }
  
  
  .card-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 0;
  }
  
  .header-icon {
    font-size: 1.2rem;
  }
  
  .card-header h2 {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
  }
  
  .contact-form {
    padding: 0;
  }
  
  .field-group {
    margin-bottom: 1rem;
  }
  
  .field-label {
    display: block;
    font-weight: 500;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }
  
  .field-input {
    width: 100%;
    /* Mantém estilos padrão do PrimeVue InputText */
  }
  
  .button-group {
    display: flex;
    gap: 0.75rem;
    margin-top: 1.5rem;
  }
  
  .cancel-btn,
  .save-btn {
    flex: 1;
    /* Mantém estilos padrão dos botões PrimeVue */
  }
  
  @media (max-width: 640px) {
    .contact-form-container {
      padding: 1rem;
    }
    
    .button-group {
      flex-direction: column;
    }
    
    .cancel-btn,
    .save-btn {
      flex: none;
    }
  }
  </style>