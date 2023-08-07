<script setup lang="ts">
  import { useLog } from '@/hooks/useLog';

  const { logData } = useLog();
</script>

<template>
  <el-card>
    Logs 
    <!-- <img height="24" src="@/assets/zhiyin-fast.gif"/> -->
    <div class="chart">
      <div v-for="line in logData" :key="line">{{ line }}</div>
    </div>
  </el-card>
</template>

<style scoped>
.chart {
  width: 100%;
  height: 330px;
}
</style>
