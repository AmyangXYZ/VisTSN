import { ref, onMounted, watch } from 'vue';
import * as echarts from 'echarts';

export function useGCLData() {
  const gclData = ref<Array<[number, number, number]>>([]);
  const linkData = ref<string>('');
  const priorityData = ref<string>('');
  const chartRef = ref<HTMLElement | null>(null);
  let chart: any = null;

  onMounted(async () => {
    try {
      const gResponse = await fetch('../../example/json_format/gcl.json');
      const gData = await gResponse.json();
      gclData.value = gData['(0, 8)']; // data for (0, 8) only

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
    (newGCLData) => {
      // Prep data for chart
      const data = newGCLData.map(([q, start, end]: [number, number, number]) => {
        // Calculate interval length and start position
        const length = end - start;
        const intervalStart = start;

        // For each label (Q0 to Q7), show its interval in orange, and the rest of the bar as white
        const value = Array.from({ length: 8 }, (_, i) => {
          return i === q ? [intervalStart, length] : [end, 10000 - length];
        });
    
        return [
          { name: `Q${q}`, value: value },
        ];
      });
    
      // Set up chart options
      const options: echarts.EChartOption = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
        },
        xAxis: {
          type: 'value',
          name: 'Time',
          max: 100000,
          splitLine: {
            show: false,
          },
        },
        yAxis: {
          type: 'category',
          data: ['Q0', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7'],
        },
        series: [
          {
            type: 'bar',
            stack: 'time', // Add stack property to enable stacking
            data: data.flatMap((d) => d), // Flatten the data array
            itemStyle: {
              color: function (params: any) {
                // Set color based on the seriesIndex (bottom layer: 0, top layer: 1)
                return params.seriesIndex === 0 ? 'orange' : 'white';
              },
            },
          },
        ],
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
