import { ref, onMounted, watch } from 'vue';
import * as echarts from 'echarts';
import { createWebSocketConnection } from './useWebSocket';

export function useSync() {

    const syncData = ref<Array<{ [key: string]: { is_sync: boolean, offset: number, type: string } }>>([]);

    const chartRef = ref<HTMLElement | null>(null);
    let chart: echarts.Echarts | null = null;

    onMounted(() => {
        createWebSocketConnection('ws://localhost:4399', handleDataReceived);
    });

    const handleDataReceived = (jsonData: any) => {
        syncData.value.push(jsonData['clock']);
        displayData();
    }

    const displayData = () => {
        const xAxisData: string[] = [];
        const seriesData: any[] = [];
        const currentNodes = Object.keys(syncData.value[syncData.value.length - 1]);
        currentNodes.forEach((node) => {
            const nodeData = syncData.value[syncData.value.length - 1][node];
            xAxisData.push(node);
            seriesData.push({
                offset: nodeData.offset, 
                type: nodeData.type
            });
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
                min: -1200,
                max: 1200,
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
                data: seriesData.map((item) => {
                    const { offset, type } = item;
                    
                    const barColor = getColorByType(type);

                    return {
                        value: offset,
                        label: { position: 'right' },
                        itemStyle: {
                            color: barColor
                        }
                    };
                }),
            },
        };
        
        if (chart) {
            chart.setOption(options);
        }
    };

    function getColorByType(type: string): string {
        if (type === 'GM') {
            return '#72b06a'; // green
        } else if (type === 'BC') {
            return '#3266bf'; // blue
        } else { // Slave
            return '#cc3939'; // red
        }
    }

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