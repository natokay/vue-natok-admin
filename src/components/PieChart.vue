<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>

var echarts = require('echarts')
require('echarts/theme/macarons') // echarts theme
import resize from './mixins/resize'

export default {
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '300px'
    },
    chartData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      chart: null
    }
  },
  watch: {
    chartData: {
      deep: true,
      handler() {
        this.initChart()
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart()
    })
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$el, 'macarons')
      this.setOptions(this.chartData)
    },
    setOptions({ name, data } = {}) {
      this.chart.setOption({
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        title: {
          text: name,
          x: 'left',
          y: 'top',
          textAlign: 'left'
        },
        legend: {
          left: 'center',
          bottom: '0',
          itemWidth: 21,
          itemHeight: 12,
          textStyle: {
            color: 'rgba(25,25,112,.9)',
            fontSize: '12'
          }
        },
        series: [
          {
            name: name,
            type: 'pie',
            roseType: 'radius',
            radius: ['40%', '60%'],
            center: ['50%', '52%'],
            data: data,
            animationEasing: 'cubicInOut',
            animationDuration: 200
          }
        ]
      })
    }
  }
}
</script>
