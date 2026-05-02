<script setup lang="ts">
import { ref } from 'vue'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const errore = ref('')
const loading = ref(false)

const router = useRouter()

const login = async () => {
  errore.value = ''
  loading.value = true
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value)
    router.push('/area-riservata')
  } catch (err: any) {
    errore.value = 'Login fallito. Verifica email e password.'
    console.error(err)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
    <div class="w-full max-w-sm bg-white shadow-xl rounded-2xl p-8">
      <h2 class="text-2xl font-bold text-center text-gray-800 mb-6">Accesso area riservata</h2>
      
      <form @submit.prevent="login" class="space-y-6">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
          <input 
            v-model="email" 
            id="email"
            type="email" 
            class="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition" 
            required 
          />
        </div>
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
          <input 
            v-model="password" 
            id="password"
            type="password" 
            class="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition" 
            required 
          />
        </div>
        
        <div v-if="errore" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded-lg text-sm">
          {{ errore }}
        </div>

        <div>
          <button 
            :disabled="loading" 
            class="w-full bg-indigo-600 text-white px-4 py-3 rounded-lg font-bold hover:bg-indigo-700 transition duration-300 disabled:bg-indigo-400"
          >
            {{ loading ? 'Accesso in corso...' : 'Entra' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
