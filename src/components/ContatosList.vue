<template>
    <div class="contatos-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-info">
            <h1 class="page-title">
              <i class="pi pi-users"></i>
              Contatos
            </h1>
            <p class="page-subtitle">Gerencie seus contatos de forma fácil e organizada</p>
          </div>
          <div class="header-actions">
            <Button 
              label="Novo Contato" 
              icon="pi pi-plus" 
              @click="newContato"
              class="new-contact-btn"
              size="large"
            />
            <Button 
              label="Logout" 
              icon="pi pi-sign-out" 
              @click="confirmLogout"
              class="logout-btn"
              size="large"
              severity="secondary"
              outlined
            />
          </div>
        </div>
      </div>
  
      <!-- Filtros e Busca -->
      <Card class="filters-card">
        <template #content>
          <div class="filters-content">
            <div class="search-container">
              <IconField iconPosition="left">
                <InputIcon class="pi pi-search" />
                <InputText 
                  v-model="searchTerm" 
                  placeholder="Buscar contatos..." 
                  class="search-input"
                  @input="onSearch"
                />
              </IconField>
            </div>
            
            <div class="stats-container">
              <div class="stat-item">
                <i class="pi pi-users stat-icon"></i>
                <div class="stat-content">
                  <span class="stat-number">{{ filteredContatos.length }}</span>
                  <span class="stat-label">Total</span>
                </div>
              </div>
            </div>
          </div>
        </template>
      </Card>
  
      <!-- Loading -->
      <div v-if="loading" class="loading-container">
        <ProgressSpinner />
        <span class="loading-text">Carregando contatos...</span>
      </div>
  
      <!-- Lista de Contatos -->
      <Card v-else-if="filteredContatos.length > 0" class="contatos-card">
        <template #content>
          <DataTable 
            :value="filteredContatos" 
            :paginator="true" 
            :rows="10"
            :rowsPerPageOptions="[5, 10, 20, 50]"
            responsiveLayout="scroll"
            stripedRows
            class="contatos-table"
            :globalFilterFields="['nome', 'email', 'telefone']"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} contatos"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          >
            <Column field="nome" header="Nome" sortable class="nome-column">
              <template #body="slotProps">
                <div class="contact-name">
                  <Avatar 
                    :label="getInitials(slotProps.data.nome)" 
                    class="contact-avatar"
                    size="large"
                    shape="circle"
                  />
                  <div class="name-info">
                    <span class="contact-name-text">{{ slotProps.data.nome }}</span>
                    <span class="contact-id">ID: {{ slotProps.data.id }}</span>
                  </div>
                </div>
              </template>
            </Column>
            
            <Column field="email" header="Email" sortable class="email-column">
              <template #body="slotProps">
                <div class="contact-email">
                  <i class="pi pi-envelope email-icon"></i>
                  <span v-if="slotProps.data.email" class="email-text">
                    {{ slotProps.data.email }}
                  </span>
                  <span v-else class="no-email">Não informado</span>
                </div>
              </template>
            </Column>
            
            <Column field="telefone" header="Telefone" sortable class="telefone-column">
              <template #body="slotProps">
                <div class="contact-phone">
                  <i class="pi pi-phone phone-icon"></i>
                  <span class="phone-text">{{ formatPhone(slotProps.data.telefone) }}</span>
                </div>
              </template>
            </Column>
            
            <Column header="Ações" class="actions-column">
              <template #body="slotProps">
                <div class="action-buttons">
                  <Button
                    icon="pi pi-eye"
                    severity="info"
                    text
                    rounded
                    @click="viewContato(slotProps.data)"
                    v-tooltip="'Visualizar'"
                    class="action-btn view-btn"
                  />
                  <Button
                    icon="pi pi-pencil"
                    severity="warning"
                    text
                    rounded
                    @click="editContato(slotProps.data.id)"
                    v-tooltip="'Editar'"
                    class="action-btn edit-btn"
                  />
                  <Button
                    icon="pi pi-trash"
                    severity="danger"
                    text
                    rounded
                    @click="confirmDelete(slotProps.data)"
                    v-tooltip="'Excluir'"
                    class="action-btn delete-btn"
                  />
                </div>
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>
  
      <!-- Estado Vazio -->
      <Card v-else class="empty-state-card">
        <template #content>
          <div class="empty-state">
            <i class="pi pi-users empty-icon"></i>
            <h3 class="empty-title">Nenhum contato encontrado</h3>
            <p class="empty-message">
              {{ searchTerm ? 'Nenhum contato corresponde à sua pesquisa.' : 'Você ainda não possui contatos cadastrados.' }}
            </p>
            <Button 
              v-if="!searchTerm"
              label="Adicionar Primeiro Contato" 
              icon="pi pi-plus" 
              @click="newContato"
              class="empty-action-btn"
            />
          </div>
        </template>
      </Card>
  
      <!-- Dialog de Confirmação de Exclusão -->
      <Dialog 
        v-model:visible="deleteDialog" 
        :style="{ width: '450px' }" 
        header="Confirmar Exclusão" 
        :modal="true"
        class="delete-dialog"
      >
        <div class="delete-confirmation">
          <i class="pi pi-exclamation-triangle delete-warning-icon"></i>
          <div class="delete-message">
            <p>Tem certeza que deseja excluir o contato?</p>
            <div class="contact-info-delete">
              <strong>{{ contatoToDelete?.nome }}</strong>
              <br>
              <span class="contact-details">{{ contatoToDelete?.email || 'Email não informado' }}</span>
            </div>
            <p class="warning-text">Esta ação não pode ser desfeita.</p>
          </div>
        </div>
        
        <template #footer>
          <Button 
            label="Cancelar" 
            icon="pi pi-times" 
            @click="deleteDialog = false" 
            text 
            class="cancel-btn"
          />
          <Button 
            label="Excluir" 
            icon="pi pi-trash" 
            @click="deleteContato" 
            severity="danger"
            :loading="deleting"
            class="confirm-delete-btn"
          />
        </template>
      </Dialog>
  
      <!-- Dialog de Visualização -->
      <Dialog 
        v-model:visible="viewDialog" 
        :style="{ width: '500px' }" 
        header="Detalhes do Contato" 
        :modal="true"
        class="view-dialog"
      >
        <div v-if="selectedContato" class="contact-details-view">
          <div class="contact-header-view">
            <Avatar 
              :label="getInitials(selectedContato.nome)" 
              size="xlarge"
              shape="circle"
              class="contact-avatar-large"
            />
            <div class="contact-info-view">
              <h3 class="contact-name-large">{{ selectedContato.nome }}</h3>
              <span class="contact-id-view">ID: {{ selectedContato.id }}</span>
            </div>
          </div>
          
          <Divider />
          
          <div class="contact-fields">
            <div class="field-item">
              <label class="field-label">
                <i class="pi pi-envelope field-icon"></i>
                Email
              </label>
              <span class="field-value">
                {{ selectedContato.email || 'Não informado' }}
              </span>
            </div>
            
            <div class="field-item">
              <label class="field-label">
                <i class="pi pi-phone field-icon"></i>
                Telefone
              </label>
              <span class="field-value">
                {{ formatPhone(selectedContato.telefone) }}
              </span>
            </div>
          </div>
        </div>
        
        <template #footer>
          <Button 
            label="Fechar" 
            icon="pi pi-times" 
            @click="viewDialog = false" 
            text 
          />
          <Button 
            label="Editar" 
            icon="pi pi-pencil" 
            @click="editFromView" 
            severity="warning"
          />
        </template>
      </Dialog>

      <!-- Dialog de Confirmação de Logout -->
      <Dialog 
        v-model:visible="logoutDialog" 
        :style="{ width: '400px' }" 
        header="Confirmar Logout" 
        :modal="true"
        class="logout-dialog"
      >
        <div class="logout-confirmation">
          <i class="pi pi-sign-out logout-warning-icon"></i>
          <div class="logout-message">
            <p>Tem certeza que deseja sair da aplicação?</p>
            <p class="logout-info">Você será redirecionado para a tela de login.</p>
          </div>
        </div>
        
        <template #footer>
          <Button 
            label="Cancelar" 
            icon="pi pi-times" 
            @click="logoutDialog = false" 
            text 
            class="cancel-btn"
          />
          <Button 
            label="Sair" 
            icon="pi pi-sign-out" 
            @click="logout" 
            severity="secondary"
            :loading="loggingOut"
            class="confirm-logout-btn"
          />
        </template>
      </Dialog>
  
      <Toast />
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { useToast } from 'primevue/usetoast'
  import api from '../services/api'
  import Button from 'primevue/button'
  import DataTable from 'primevue/datatable'
  import Column from 'primevue/column'
  import Card from 'primevue/card'
  import InputText from 'primevue/inputtext'
  import IconField from 'primevue/iconfield'
  import InputIcon from 'primevue/inputicon'
  import Avatar from 'primevue/avatar'
  import Dialog from 'primevue/dialog'
  import Toast from 'primevue/toast'
  import ProgressSpinner from 'primevue/progressspinner'
  import Divider from 'primevue/divider'
  
  const router = useRouter()
  const toast = useToast()
  
  // Estados
  const contatos = ref([])
  const loading = ref(false)
  const searchTerm = ref('')
  const deleteDialog = ref(false)
  const viewDialog = ref(false)
  const logoutDialog = ref(false)
  const contatoToDelete = ref(null)
  const selectedContato = ref(null)
  const deleting = ref(false)
  const loggingOut = ref(false)
  
  // Computed
  const filteredContatos = computed(() => {
    if (!searchTerm.value) return contatos.value
    
    const term = searchTerm.value.toLowerCase()
    return contatos.value.filter(contato => 
      contato.nome.toLowerCase().includes(term) ||
      (contato.email && contato.email.toLowerCase().includes(term)) ||
      contato.telefone.includes(term)
    )
  })
  
  // Métodos
  const newContato = () => router.push('/contatos/novo')
  
  const editContato = (id) => router.push(`/contatos/editar/${id}`)
  
  const viewContato = (contato) => {
    selectedContato.value = contato
    viewDialog.value = true
  }
  
  const editFromView = () => {
    viewDialog.value = false
    editContato(selectedContato.value.id)
  }
  
  const confirmDelete = (contato) => {
    contatoToDelete.value = contato
    deleteDialog.value = true
  }

  const confirmLogout = () => {
    logoutDialog.value = true
  }

  const logout = async () => {
    loggingOut.value = true

    try {
      // Limpar dados de autenticação (localStorage, sessionStorage, etc.)
      localStorage.removeItem('authToken')
      localStorage.removeItem('userData')
      sessionStorage.clear()

      // Fazer logout na API se necessário
      // await api.post('/v1/auth/logout')

      toast.add({
        severity: 'success',
        summary: 'Logout realizado',
        detail: 'Você foi desconectado com sucesso!',
        life: 2000
      })

      // Aguardar um pouco para mostrar o toast
      setTimeout(() => {
        router.push('/login')
      }, 500)

    } catch (error) {
      console.error('Erro ao fazer logout:', error)
      
      toast.add({
        severity: 'warn',
        summary: 'Aviso',
        detail: 'Erro ao fazer logout, mas você será redirecionado.',
        life: 3000
      })

      // Mesmo com erro, redirecionar para login
      setTimeout(() => {
        router.push('/login')
      }, 1000)

    } finally {
      loggingOut.value = false
      logoutDialog.value = false
    }
  }
  
  const deleteContato = async () => {
    if (!contatoToDelete.value) return
    
    deleting.value = true
    
    try {
      await api.delete(`/v1/contatos/${contatoToDelete.value.id}`)
      
      toast.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Contato excluído com sucesso!',
        life: 3000
      })
      
      await getContatos()
      deleteDialog.value = false
      contatoToDelete.value = null
      
    } catch (error) {
      console.error('Erro ao excluir contato:', error)
      
      toast.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao excluir contato. Tente novamente.',
        life: 4000
      })
    } finally {
      deleting.value = false
    }
  }
  
  const getContatos = async () => {
    loading.value = true
    
    try {
      // TODO: Pegar usuarioId do store de autenticação ou contexto
      const response = await api.get(`/v1/contatos?usuarioId=${localStorage.getItem('userId')}`)
      contatos.value = response.data
      
    } catch (error) {
      console.error('Erro ao carregar contatos:', error)
      
      toast.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao carregar contatos. Tente novamente.',
        life: 4000
      })
    } finally {
      loading.value = false
    }
  }
  
  const onSearch = () => {
    // Debounce pode ser adicionado aqui se necessário
  }
  
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }
  
  const formatPhone = (phone) => {
    if (!phone) return ''
    
    // Remove caracteres não numéricos
    const cleaned = phone.replace(/\D/g, '')
    
    // Formata para (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    } else if (cleaned.length === 10) {
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
    }
    
    return phone
  }
  
  // Lifecycle
  onMounted(getContatos)
  </script>
  
  <style scoped>
  .contatos-container {
    padding: 1.5rem;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  /* Header */
  .page-header {
    margin-bottom: 2rem;
  }
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  .header-info {
    flex: 1;
  }

  .header-actions {
    display: flex;
    gap: 1rem;
    align-items: center;
  }
  
  .page-title {
    color: #2c3e50;
    margin: 0 0 0.5rem 0;
    font-size: 2rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  
  .page-subtitle {
    color: #7f8c8d;
    margin: 0;
    font-size: 1rem;
  }
  
  .new-contact-btn {
    height: 3rem;
    font-weight: 600;
  }

  .logout-btn {
    height: 3rem;
    font-weight: 600;
  }
  
  /* Filtros */
  .filters-card {
    margin-bottom: 1.5rem;
  }
  
  .filters-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }
  
  .search-container {
    flex: 1;
    max-width: 400px;
  }
  
  .search-input {
    width: 100%;
    height: 2.5rem;
  }
  
  .stats-container {
    display: flex;
    gap: 1rem;
  }
  
  .stat-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e9ecef;
  }
  
  .stat-icon {
    font-size: 1.5rem;
    color: #667eea;
  }
  
  .stat-content {
    display: flex;
    flex-direction: column;
  }
  
  .stat-number {
    font-size: 1.25rem;
    font-weight: 600;
    color: #2c3e50;
    line-height: 1;
  }
  
  .stat-label {
    font-size: 0.8rem;
    color: #7f8c8d;
  }
  
  /* Loading */
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 3rem;
  }
  
  .loading-text {
    color: #7f8c8d;
    font-size: 1rem;
  }
  
  /* Tabela */
  .contatos-card {
    margin-bottom: 1rem;
  }
  
  .contatos-table {
    border-radius: 8px;
    overflow: hidden;
  }
  
  /* Colunas */
  .nome-column {
    min-width: 250px;
  }
  
  .email-column {
    min-width: 200px;
  }
  
  .telefone-column {
    min-width: 150px;
  }
  
  .actions-column {
    width: 150px;
  }
  
  /* Contato Nome */
  .contact-name {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  
  .contact-avatar {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    font-weight: 600;
  }
  
  .name-info {
    display: flex;
    flex-direction: column;
  }
  
  .contact-name-text {
    font-weight: 600;
    color: #2c3e50;
    font-size: 0.95rem;
  }
  
  .contact-id {
    font-size: 0.75rem;
    color: #7f8c8d;
  }
  
  /* Email */
  .contact-email {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .email-icon {
    color: #667eea;
  }
  
  .email-text {
    color: #2c3e50;
  }
  
  .no-email {
    color: #7f8c8d;
    font-style: italic;
  }
  
  /* Telefone */
  .contact-phone {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .phone-icon {
    color: #27ae60;
  }
  
  .phone-text {
    color: #2c3e50;
    font-family: 'Courier New', monospace;
  }
  
  /* Ações */
  .action-buttons {
    display: flex;
    gap: 0.25rem;
  }
  
  .action-btn {
    width: 2.5rem;
    height: 2.5rem;
  }
  
  /* Estado Vazio */
  .empty-state-card {
    margin-top: 2rem;
  }
  
  .empty-state {
    text-align: center;
    padding: 3rem 2rem;
  }
  
  .empty-icon {
    font-size: 4rem;
    color: #bdc3c7;
    margin-bottom: 1rem;
  }
  
  .empty-title {
    color: #2c3e50;
    margin-bottom: 0.5rem;
  }
  
  .empty-message {
    color: #7f8c8d;
    margin-bottom: 2rem;
    font-size: 1rem;
  }
  
  .empty-action-btn {
    height: 3rem;
    font-weight: 600;
  }
  
  /* Dialog de Exclusão */
  .delete-confirmation {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .delete-warning-icon {
    font-size: 2rem;
    color: #e74c3c;
    margin-top: 0.25rem;
  }
  
  .delete-message {
    flex: 1;
  }
  
  .contact-info-delete {
    margin: 1rem 0;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 6px;
    border-left: 4px solid #e74c3c;
  }
  
  .contact-details {
    color: #7f8c8d;
    font-size: 0.9rem;
  }
  
  .warning-text {
    color: #e74c3c;
    font-size: 0.9rem;
    font-weight: 500;
    margin-bottom: 0;
  }
  
  .confirm-delete-btn {
    font-weight: 600;
  }

  /* Dialog de Logout */
  .logout-confirmation {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
  }

  .logout-warning-icon {
    font-size: 2rem;
    color: #6c757d;
    margin-top: 0.25rem;
  }

  .logout-message {
    flex: 1;
  }

  .logout-info {
    color: #7f8c8d;
    font-size: 0.9rem;
    margin-bottom: 0;
  }

  .confirm-logout-btn {
    font-weight: 600;
  }
  
  /* Dialog de Visualização */
  .contact-details-view {
    padding: 1rem 0;
  }
  
  .contact-header-view {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }
  
  .contact-avatar-large {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    font-weight: 600;
  }
  
  .contact-info-view {
    flex: 1;
  }
  
  .contact-name-large {
    margin: 0 0 0.25rem 0;
    color: #2c3e50;
    font-size: 1.5rem;
  }
  
  .contact-id-view {
    color: #7f8c8d;
    font-size: 0.9rem;
  }
  
  .contact-fields {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .field-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .field-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    color: #2c3e50;
    font-size: 0.9rem;
  }
  
  .field-icon {
    color: #667eea;
  }
  
  .field-value {
    color: #2c3e50;
    font-size: 1rem;
    padding-left: 1.5rem;
  }
  
  /* Responsivo */
  @media (max-width: 768px) {
    .contatos-container {
      padding: 1rem;
    }
    
    .header-content {
      flex-direction: column;
      align-items: stretch;
    }

    .header-actions {
      justify-content: center;
      flex-wrap: wrap;
    }
    
    .filters-content {
      flex-direction: column;
      align-items: stretch;
    }
    
    .search-container {
      max-width: none;
    }
    
    .stats-container {
      justify-content: center;
    }
    
    .page-title {
      font-size: 1.5rem;
    }
    
    .action-buttons {
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .contact-header-view {
      flex-direction: column;
      text-align: center;
    }
  }
  
  @media (max-width: 480px) {
    .contatos-container {
      padding: 0.5rem;
    }

    .header-actions {
      flex-direction: column;
      gap: 0.75rem;
    }

    .new-contact-btn,
    .logout-btn {
      width: 100%;
    }
    
    .empty-state {
      padding: 2rem 1rem;
    }
    
    .empty-icon {
      font-size: 3rem;
    }
  }
  </style>