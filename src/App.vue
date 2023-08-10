<script setup lang="ts">
import ScheduleTable from './components/ScheduleTable.vue'
import NetworkTopology from './components/NetworkTopology.vue'
import SystemClock from './components/SystemClock.vue'
import NetworkStatistics from './components/NetworkStatistics.vue'
import EventLogs from './components/EventLogs.vue'
</script>

<template>
  <main>
    <el-row :gutter="30">
      <el-col :span="13">
        <ScheduleTable />
        <el-row :gutter="30" style="margin-top: 30px">
          <el-col :span="12">
            <SystemClock />
          </el-col>
          <el-col :span="12">
            <NetworkStatistics />
          </el-col>
        </el-row>
      </el-col>
      <el-col :span="11">
        <NetworkTopology />
        <EventLogs style="margin-top: 30px" />
      </el-col>
    </el-row>
  </main>
</template>

<style scoped></style>
