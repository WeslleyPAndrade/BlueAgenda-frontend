<template>
    <div class="register-container">
      <div class="register-card">
        <div class="register-header">
          <h2>Criar Conta</h2>
          <p>Cadastre-se para começar</p>
        </div>
        
        <form @submit.prevent="handleRegister" class="register-form">
          <div class="field">
            <label for="username">Usuário</label>
            <InputText
              id="username"
              v-model="usuario.username"
              type="text"
              placeholder="Digite seu usuário"
              :class="{ 'p-invalid': usernameError }"
              fluid
            />
            <small v-if="usernameError" class="p-error">{{ usernameError }}</small>
          </div>
  
          <div class="field">
            <label for="password">Senha</label>
            <Password
              id="password"
              v-model="usuario.password"
              placeholder="Digite sua senha"
              :feedback="true"
              :class="{ 'p-invalid': passwordError }"
              fluid
              toggleMask
            />
            <small v-if="passwordError" class="p-error">{{ passwordError }}</small>
          </div>
  
          <div class="field">
            <label for="confirmPassword">Confirmar senha</label>
            <Password
              id="confirmPassword"
              v-model="confirmPassword"
              placeholder="Digite novamente sua senha"
              :feedback="false"
              :class="{ 'p-invalid': confirmPasswordError }"
              fluid
              toggleMask
            />
            <small v-if="confirmPasswordError" class="p-error">{{ confirmPasswordError }}</small>
          </div>
  
          <div class="field">
            <label for="role">Perfil</label>
            <Dropdown
              id="role"
              v-model="usuario.role"
              :options="roleOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Selecione o perfil"
              :class="{ 'p-invalid': roleError }"
              fluid
            />
            <small v-if="roleError" class="p-error">{{ roleError }}</small>
          </div>
  
          <Button
            type="submit"
            label="Criar Conta"
            :loading="loading"
            fluid
            class="register-button"
          />
        </form>
  
        <div class="register-footer">
          <Divider />
          <p>Já tem uma conta? <a href="#" @click.prevent="goToLogin">Faça login</a></p>
        </div>
      </div>
  
      <Toast />
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useToast } from 'primevue/usetoast'
  import api from '../services/api'
  import InputText from 'primevue/inputtext'
  import Password from 'primevue/password'
  import Button from 'primevue/button'
  import Dropdown from 'primevue/dropdown'
  import Divider from 'primevue/divider'
  import Toast from 'primevue/toast'
  
  const router = useRouter()
  const toast = useToast()
  
  // Navigation functions
  const goToLogin = () => router.push('/login')
  
  // Role options
  const roleOptions = ref([
    { label: 'Usuário', value: 'usuario' },
    { label: 'Administrador', value: 'admin' },
    { label: 'Moderador', value: 'moderador' }
  ])
  
  // Reactive data
  const usuario = ref({
    username: '',
    password: '',
    role: 'usuario' // Valor padrão
  })
  
  const confirmPassword = ref('')
  const loading = ref(false)
  
  // Error states
  const usernameError = ref('')
  const passwordError = ref('')
  const confirmPasswordError = ref('')
  const roleError = ref('')
  
  // Validation functions
  const validateUsername = () => {
    if (!usuario.value.username.trim()) {
      usernameError.value = 'Usuário é obrigatório'
      return false
    }
    if (usuario.value.username.trim().length < 3) {
      usernameError.value = 'Usuário deve ter pelo menos 3 caracteres'
      return false
    }
    if (!/^[a-zA-Z0-9_]+$/.test(usuario.value.username.trim())) {
      usernameError.value = 'Usuário deve conter apenas letras, números e underscore'
      return false
    }
    usernameError.value = ''
    return true
  }
  
  const validatePassword = () => {
    if (!usuario.value.password) {
      passwordError.value = 'Senha é obrigatória'
      return false
    }
    if (usuario.value.password.length < 6) {
      passwordError.value = 'Senha deve ter pelo menos 6 caracteres'
      return false
    }
    passwordError.value = ''
    return true
  }
  
  const validateConfirmPassword = () => {
    if (!confirmPassword.value) {
      confirmPasswordError.value = 'Confirmação de senha é obrigatória'
      return false
    }
    if (confirmPassword.value !== usuario.value.password) {
      confirmPasswordError.value = 'Senhas não coincidem'
      return false
    }
    confirmPasswordError.value = ''
    return true
  }
  
  const validateRole = () => {
    if (!usuario.value.role) {
      roleError.value = 'Perfil é obrigatório'
      return false
    }
    roleError.value = ''
    return true
  }
  
  const validateForm = () => {
    const isUsernameValid = validateUsername()
    const isPasswordValid = validatePassword()
    const isConfirmPasswordValid = validateConfirmPassword()
    const isRoleValid = validateRole()
    
    return isUsernameValid && isPasswordValid && isConfirmPasswordValid && isRoleValid
  }
  
  // Handle register
  const handleRegister = async () => {
    if (!validateForm()) return
    
    loading.value = true
    
    try {
      await api.post('/usuario', {
        username: usuario.value.username.trim(),
        password: usuario.value.password,
        role: usuario.value.role
      })
      
      toast.add({
        severity: 'success',
        summary: 'Cadastro realizado',
        detail: 'Usuário cadastrado com sucesso! Faça login para continuar.',
        life: 4000
      })
      
      // Aguardar um pouco para mostrar a mensagem antes de redirecionar
      setTimeout(() => {
        router.push('/login')
      }, 2000)
      
    } catch (error) {
      console.error('Erro no cadastro:', error)
      
      let errorMessage = 'Erro ao cadastrar usuário. Tente novamente.'
      
      if (error.response?.status === 409) {
        errorMessage = 'Nome de usuário já está em uso'
      } else if (error.response?.status === 400) {
        errorMessage = 'Dados inválidos. Verifique as informações'
      } else if (error.response?.status >= 500) {
        errorMessage = 'Erro interno do servidor. Tente novamente mais tarde.'
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão.'
      }
      
      toast.add({
        severity: 'error',
        summary: 'Erro no cadastro',
        detail: errorMessage,
        life: 5000
      })
      
    } finally {
      loading.value = false
    }
  }
  </script>
  
  <style scoped>
  .register-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 1rem;
  }
  
  .register-card {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
  }
  
  .register-header {
    text-align: center;
    margin-bottom: 2rem;
  }
  
  .register-header h2 {
    color: #2c3e50;
    margin-bottom: 0.5rem;
    font-size: 1.8rem;
    font-weight: 600;
  }
  
  .register-header p {
    color: #7f8c8d;
    margin: 0;
  }
  
  .register-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .field label {
    font-weight: 500;
    color: #2c3e50;
    font-size: 0.9rem;
  }
  
  .register-button {
    margin-top: 1rem;
    height: 3rem;
    font-weight: 600;
  }
  
  .register-footer {
    margin-top: 2rem;
    text-align: center;
  }
  
  .register-footer a {
    color: #667eea;
    text-decoration: none;
    font-weight: 500;
  }
  
  .register-footer a:hover {
    text-decoration: underline;
  }
  
  .register-footer p {
    margin: 1rem 0 0 0;
    color: #7f8c8d;
    font-size: 0.9rem;
  }
  
  .p-error {
    color: #e74c3c;
    font-size: 0.8rem;
  }
  
  /* Responsive */
  @media (max-width: 480px) {
    .register-card {
      padding: 1.5rem;
      margin: 1rem;
    }
    
    .register-header h2 {
      font-size: 1.5rem;
    }
  }
  </style>