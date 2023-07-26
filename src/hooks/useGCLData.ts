import { ref, onMounted, watch } from 'vue';
import * as echarts from 'echarts';

export function useGCLData() {
  const gclData = ref<Array<[number, number, number]>>([]);
  const gclCycleMax = ref<number>(0);

  const linkData = ref<string>('');
  const priorityData = ref<string>('');

  const chartRef = ref<HTMLElement | null>(null);
  let chart: any = null;

  onMounted(async () => {
    try {
      const gResponse = await fetch('../../example/json_format/gcl.json');
      const gData = await gResponse.json();
      gclData.value = gData['(0, 8)']; // data for (0, 8) only
      gclCycleMax.value = gData['cycle']; // e.g. 100,000

      linkData.value = '(0, 8)';

      const pResponse = await fetch('../../example/json_format/prio2q.json');
      const pData = await pResponse.json();
      priorityData.value = pData['(0, 8)'] // data for (0, 8) only
        .map(([prio, q]: number[]) => `${prio}:${q}`)
        .join(', ');
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  });

  // Inside the watch callback
  watch(
    gclData,
    (newGCLData: any) => {
      const xAxisData = newGCLData.map(([_, start, end]: [number, number, number]) => {
        return start;
      });
      // Set up chart options
      const options: echarts.EChartOption = {
        tooltip: {
          position: 'top'
        },
        legend: {
          show: false
        },
        grid: {
          height: '50%',
          top: '10%'
        },
        xAxis: {
          type: 'category',
          max: gclCycleMax.value / 10000, // divide is to properly space the intervals
          splitArea: {
            show: false
          },
          axisLabel: {
            interval: 0,
            align: 'left',
            margin: 10
          }
        },
        yAxis: {
          type: 'category',
          data: ['Q0', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7'],
          splitArea: {
            show: true
          }
        },
        visualMap: {
          type: 'piecewise',
          min: 1,
          max: 1,
          calculable: true,
          orient: 'horizontal',
          left: 'center',
          bottom: '15%',
          pieces: [
            {min: 0},
          ]
        },
        series: [
          {
            name: 'Interval',
            type: 'heatmap',
            data: newGCLData.map(([q, start, end]: [number, number, number]) => {
              // For each interval, directly use the start and end points
              return [start.toString(), q, end - start];
            }),
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            label: {
              show: false
            },
            itemStyle: {
              color: 'orange',
            }
          }
        ]
      };

      // Render the chart if it's already initialized
      if (chart) {
        chart.setOption(options);
      }
    },
    { immediate: true }
  );

  onMounted(() => {
    // Initialize chart after data is fetched and set up
    chart = echarts.init(chartRef.value!);

    // Resize the chart with change in window size
    window.addEventListener('resize', () => {
      chart.resize();
    });
  });

  return { gclData, linkData, priorityData, chartRef };
}
