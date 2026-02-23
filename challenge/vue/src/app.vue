<script setup lang="ts">
import { ref } from 'vue';
import CreateUserForm from './create-user-form.vue';

const userWasCreated = ref(false);
</script>

<template>
  <CreateUserForm
    v-if="!userWasCreated"
    @create-successful="userWasCreated = true"
  />

  <p v-else>User was successfully created!</p>
</template>
