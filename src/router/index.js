import { createRouter, createWebHistory } from 'vue-router'
import Login from '../components/Login.vue'
import Register from '../components/Register.vue'
import ContatosList from '../components/ContatosList.vue'
import ContatoForm from '../components/ContatosForm.vue'
import { useAuthStore } from '../store/auth'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  {
    path: '/contatos',
    component: ContatosList,
    meta: { requiresAuth: true },
  },
  {
    path: '/contatos/novo',
    component: ContatoForm,
    meta: { requiresAuth: true },
  },
  {
    path: '/contatos/editar/:id',
    component: ContatoForm,
    meta: { requiresAuth: true },
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.token) {
    next('/login')
  } else {
    next()
  }
})

export default router
