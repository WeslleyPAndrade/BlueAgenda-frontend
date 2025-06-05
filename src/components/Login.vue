<template>
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h2>Entrar</h2>
          <p>Faça login em sua conta</p>
        </div>
        
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="field">
            <label for="username">Usuário</label>
            <InputText
              id="username"
              v-model="username"
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
              v-model="password"
              placeholder="Digite sua senha"
              :feedback="false"
              :class="{ 'p-invalid': passwordError }"
              fluid
              toggleMask
            />
            <small v-if="passwordError" class="p-error">{{ passwordError }}</small>
          </div>
  
          <div class="field-checkbox">
            <Checkbox
              id="remember"
              v-model="rememberMe"
              :binary="true"
            />
            <label for="remember">Lembrar de mim</label>
          </div>
  
          <Button
            type="submit"
            label="Entrar"
            :loading="loading"
            fluid
            class="login-button"
          />
        </form>
  
        <div class="login-footer">
          <a href="#" @click.prevent="forgotPassword">Esqueceu sua senha?</a>
          <Divider />
          <p>Não tem uma conta? <a href="#" @click.prevent="register">Cadastre-se</a></p>
        </div>
      </div>
  
      <Toast />
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useToast } from 'primevue/usetoast'
  import { useAuthStore } from '../store/auth'
  import InputText from 'primevue/inputtext'
  import Password from 'primevue/password'
  import Button from 'primevue/button'
  import Checkbox from 'primevue/checkbox'
  import Divider from 'primevue/divider'
  import Toast from 'primevue/toast'
  
  const router = useRouter()
  const toast = useToast()
  const authStore = useAuthStore()
  
  // Navigation functions
  const register = () => router.push('/register')
  const forgotPassword = () => router.push('/forgot-password')
  
  // Reactive data
  const username = ref('')
  const password = ref('')
  const rememberMe = ref(false)
  const loading = ref(false)
  const usernameError = ref('')
  const passwordError = ref('')
  
  // Validation
  const validateForm = () => {
    usernameError.value = ''
    passwordError.value = ''
    
    let isValid = true
    
    if (!username.value) {
      usernameError.value = 'Usuário é obrigatório'
      isValid = false
    } else if (username.value.length < 3) {
      usernameError.value = 'Usuário deve ter pelo menos 3 caracteres'
      isValid = false
    }
    
    if (!password.value) {
      passwordError.value = 'Senha é obrigatória'
      isValid = false
    } else if (password.value.length < 6) {
      passwordError.value = 'Senha deve ter pelo menos 6 caracteres'
      isValid = false
    }
    
    return isValid
  }
  
  // Handle login
  const handleLogin = async () => {
    if (!validateForm()) return
    
    loading.value = true
    
    try {
      const loginData = {
        username: username.value,
        password: password.value,
        rememberMe: rememberMe.value
      }
      
      await authStore.login(loginData)
      
      toast.add({
        severity: 'success',
        summary: 'Login realizado',
        detail: 'Bem-vindo de volta!',
        life: 3000
      })
      
      // O redirecionamento já é feito no store
      
    } catch (error) {
      console.error('Erro no login:', error)
      
      let errorMessage = 'Erro ao fazer login. Tente novamente.'
      
      if (error.response?.status === 401) {
        errorMessage = 'Usuário ou senha incorretos'
      } else if (error.response?.status >= 500) {
        errorMessage = 'Erro interno do servidor. Tente novamente mais tarde.'
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão.'
      }
      
      toast.add({
        severity: 'error',
        summary: 'Erro no login',
        detail: errorMessage,
        life: 5000
      })
      
    } finally {
      loading.value = false
    }
  }
  </script>
  
  <style scoped>
  .login-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 1rem;
  }
  
  .login-card {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
  }
  
  .login-header {
    text-align: center;
    margin-bottom: 2rem;
  }
  
  .login-header h2 {
    color: #2c3e50;
    margin-bottom: 0.5rem;
    font-size: 1.8rem;
    font-weight: 600;
  }
  
  .login-header p {
    color: #7f8c8d;
    margin: 0;
  }
  
  .login-form {
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
  
  .field-checkbox {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .field-checkbox label {
    font-size: 0.9rem;
    color: #555;
  }
  
  .login-button {
    margin-top: 1rem;
    height: 3rem;
    font-weight: 600;
  }
  
  .login-footer {
    margin-top: 2rem;
    text-align: center;
  }
  
  .login-footer a {
    color: #667eea;
    text-decoration: none;
    font-weight: 500;
  }
  
  .login-footer a:hover {
    text-decoration: underline;
  }
  
  .login-footer p {
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
    .login-card {
      padding: 1.5rem;
      margin: 1rem;
    }
    
    .login-header h2 {
      font-size: 1.5rem;
    }
  }
  </style>