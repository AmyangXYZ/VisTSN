import { ref, onMounted, watch } from 'vue';
import * as echarts from 'echarts';
import { Axis, EChartsOption } from 'node_modules/echarts/index';

export function useSync() {

    const syncData = ref<Array<[string, number, string]>>([]);

    const chartRef = ref<HTMLElement | null>(null);
    let chart: echarts.Echarts | null = null;

    onMounted(async () => {
        try {
            const response = await fetch('../../example/json_format/sync.json');
            syncData.value = await response.json();
            displaySyncData();
        }
        catch (error: any) {
            console.error('Error fetching sync data:', error);
        }
    })

    const displaySyncData = () => {
        const xAxisData: string[] = [];
        const seriesData: number[] = [];
        const nodes = Object.keys(syncData.value);
        nodes.forEach((node) => {
            const nodeData = syncData.value[node];
            xAxisData.push(node);
            seriesData.push(nodeData.offset);
        });

        const options: echarts.EChartsOption = {
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            grid: {
                top: 80,
                bottom: 30
            },
            xAxis: {
                type: 'value',
                position: 'top',
                splitLine: {
                    lineStyle: {
                        type: 'dashed'
                    }
                }
            },
            yAxis: {
                type: 'category',
                axisLine: { show: false },
                axisLabel: { show: false },
                axisTick: { show: false },
                splitLine: { show: false },
                data: xAxisData
            },
            series: {
                name: 'Offset:',
                type: 'bar',
                stack: 'Total',
                label: {
                    show: true,
                    position: 'right',
                    formatter: '{b}'
                },
                data: seriesData.map((offset) => {
                    return { value: offset, label: { position: 'right' } };
                }),
            }
        };
        
        if (chart) {
            chart.setOption(options);
        }
    };

    onMounted(() => {
        // Initialize chart after data is fetched and set up
        chart = echarts.init(chartRef.value!);
    
        // Resize the chart with change in window size
        window.addEventListener('resize', () => {
          chart!.resize();
        });
      });

    return { chartRef };
}