import { ref, onMounted, watch } from 'vue';
import * as echarts from 'echarts';

export function useSync() {

    const syncData = ref<Array<{ [key: string]: { is_sync: boolean, offset: number, type: string } }>>([]);

    const chartRef = ref<HTMLElement | null>(null);
    let chart: echarts.Echarts | null = null;

    const socket = ref<WebSocket | null>(null);

    onMounted(async () => {
        try {
            // Open the WebSocket connection
            socket.value = new WebSocket('ws://localhost:4399');

            socket.value.onopen = () => {
                console.log('WebSocket connection established.');
            };

            socket.value.onmessage = (event: any) => {
                // Parse the WebSocket message data
                const jsonData = JSON.parse(event.data)['clock'];

                // Reset bandwidthData on every message received from the WebSocket
                syncData.value.push(jsonData);

                // Call displayData to update the chart
                displayData();
            };

            socket.value.onerror = (error: any) => {
                console.error('WebSocket error:', error);
            };

            socket.value.onclose = () => {
                console.log('WebSocket connection closed');
            };
        }
        catch (error: any) {
            console.error('Error fetching sync data:', error);
        }
    })

    const displayData = () => {
        const xAxisData: string[] = [];
        const seriesData: number[] = [];
        const currentNodes = Object.keys(syncData.value[syncData.value.length - 1]);
        currentNodes.forEach((node) => {
            const nodeData = syncData.value[syncData.value.length - 1][node];
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