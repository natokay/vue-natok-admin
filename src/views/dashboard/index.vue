<template>
  <div class="dashboard-container">
    <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
      <line-chart :chart-data="lineChartStreamData" />
    </el-row>

    <el-row :gutter="16">
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <pie-chart :chart-data="pieChartClientData" />
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <pie-chart :chart-data="pieChartPortData" />
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <pie-chart :chart-data="pieChartProtocolData" />
        </div>
      </el-col>
    </el-row>

  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { state } from '@/api/dashboard'
import LineChart from '@/components/LineChart'
import PieChart from '@/components/PieChart'

export default {
  name: 'Dashboard',
  components: {
    LineChart,
    PieChart
  },
  data() {
    return {
      lineChartStreamData: {
        date: [], input: { name: '流入流量', data: [] }, output: { name: '流出流量', data: [] }
      },
      pieChartClientData: { name: '客户端状态', data: [] },
      pieChartPortData: { name: '端口映射', data: [] },
      pieChartProtocolData: { name: '转发协议', data: [] },
      lineChartRunData: { name: '连接池', data: [] }
    }
  },
  created() {
    this.loadReportData()
  },
  mounted() {
    this.$nextTick(() => { })
  },
  methods: {
    loadReportData() {
      const vm = this
      state().then((response) => {
        const data = response.data
        vm.lineChartStreamData = data.stream
        for (const k in data.client) {
          vm.pieChartClientData.data.push({ name: k, value: data.client[k] })
        }
        for (const k in data.port) {
          vm.pieChartPortData.data.push({ name: k, value: data.port[k] })
        }
        for (const k in data.protocol) {
          vm.pieChartProtocolData.data.push({ name: k, value: data.protocol[k] })
        }
        for (const k in data.run) {
          vm.lineChartRunData.data.push({ name: k, value: data.run[k] })
        }
      })
    }
  },
  computed: {
    ...mapGetters([
      'name'
    ])
  }
}
</script>

<style lang="scss" scoped>
.dashboard-container {
  &-container {
    margin: 30px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
.dashboard-container {
  padding: 32px;
  background-color: rgb(240, 242, 245);
  position: relative;

}
.chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
}
@media (max-width:1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>
