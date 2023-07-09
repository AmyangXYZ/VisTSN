<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTopology } from '../hooks/useTopology'

const chartDom = ref(undefined)
const { draw } = useTopology()
onMounted(() => {
  draw(chartDom)
})
</script>

<template>
  <el-card>
    Topology
    <div class="chart" ref="chartDom"></div>
  </el-card>
</template>

<style scoped>
.chart {
  width: 100%;
  height: 493px;
}
</style>
