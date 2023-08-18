import { ref, onMounted, watch } from 'vue';
import * as echarts from 'echarts';
import { createWebSocketConnection } from './useWebSocket';

export function useDrawGCL() {
  const gclData = ref<Array<[number, number, number]>>([]);
  const gclCycleMax = ref<number>(0);

  const linkData = ref<string>('');
  const priorityData = ref<string>('');

  const chartRef = ref<HTMLElement | null>(null);
  let chart: any = null;

  onMounted(async () => {
    try {
      createWebSocketConnection('ws://localhost:4399', handleDataReceived);

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

  const handleDataReceived = (jsonData: any) => {
    gclData.value = jsonData['schedule']['(0, 8)']; // data for (0, 8) only
    gclCycleMax.value = jsonData['schedule']['cycle']; // e.g. 100,000
    displayData(); // Call displayData to update the chart
  }

  const cycleInterval = 10000;

  const displayData = () => {
    const newGCLData = gclData.value;
    const xAxisData = newGCLData.map(([_, start, end]: [number, number, number]) => {
      return start;
    });
    // Set up chart options
    const options: echarts.EChartsOption = {
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
        //data: Array.from({ length: newGCLData.length }, (_, i) => newGCLData[i][1]), // Use the start time as x-axis data
        splitArea: {
          show: false
        },
        axisLabel: {
          interval: 0,
          align: 'left',
          margin: 10,
        },
        axisTick: {
          interval: cycleInterval
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
          { min: 0 },
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
  };

  onMounted(() => {
    // Initialize chart after data is fetched and set up
    chart = echarts.init(chartRef.value!);

    // Resize the chart with change in window size
    window.addEventListener('resize', () => {
      chart.resize();
    });
  });

  return { linkData, priorityData, chartRef };
}
