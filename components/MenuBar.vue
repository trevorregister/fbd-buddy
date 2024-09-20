<template>
  <div class="menu-bar">
    <div class="logo">VectorBuddy</div>
    <div class="menu">
      <button class="menu-button">Forces</button>
    </div>
  </div>
</template>

<script setup lang="ts">
// No setup logic needed for now
</script>

<style scoped>
.menu-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #f0f0f0;
}

.logo {
  font-weight: bold;
}

.menu-button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
}
</style>