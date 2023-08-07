<script setup lang="ts">
  import { useSync } from '@/hooks/useSync'

  const { chartRef } = useSync()
</script>

<template>
  <el-card>
    System Clock
    <!-- <img height="24" src="@/assets/zhiyin-fast.gif"/> -->
    <div class="chart" ref="chartRef"></div>
  </el-card>
</template>

<style scoped>
.chart {
  width: 100%;
  height: 444px;
}
</style>
