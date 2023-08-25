import { State } from './useState'
import * as echarts from 'echarts'

//import floor from '@/assets/floorplan.svg'
import sw from '@/assets/sw.png'
import es from '@/assets/es.png'
import zhiyin from '@/assets/zhiyin.png'

export function useTopology() {
  const draw = async function (chartDom: any) {
    const topo = State.value.topo;

    const chart = echarts.init(chartDom.value);
    const option: any = {
      geo: {
        map: 'blank', // Use the 'blank' map
        roam: true,
        regions: [],
        center: [300, 520],
        itemStyle: {
          color: 'white', // Set the background color to white
        },
      },
      backgroundColor: 'white',
      series: [
        {
          type: 'scatter',
          coordinateSystem: 'geo',
          symbolSize: 60,
          label: { show: true, fontSize: 16, position: 'top', formatter: (item: any) => item.name },
          data: [],
          markLine: {
            data: [],
            symbolSize: 7,
            lineStyle: { width: 0.5, color: 'black', type: 'solid' },
          },
        },
        {
          type: 'lines',
          effect: {
            show: true,
            period: 1,
            delay: () => {
              return Math.random() * 2000;
            },
            // symbol: 'image://' + zhiyin,
            symbolSize: 10,
            trailLength: 0,
            loop: true,
          },
          data: [],
          lineStyle: { width: 0, color: 'grey' },
        },
      ],
    };

    echarts.registerMap('blank', { svg: '<svg></svg>' }); // Register a blank map

    for (const v in topo) {
      option.series[0].data.push({
        name: v,
        symbol: 'image://' + `${topo[v].type == 'sw' ? sw : es}`,
        value: topo[v].pos,
      });
      for (const port in topo[v].links) {
        const u = topo[v].links[port];
        // link
        option.series[0].markLine.data.push([{ coord: topo[v].pos }, { coord: topo[u].pos }]);
        // packcet
        option.series[1].data.push([{ coord: topo[v].pos }, { coord: topo[u].pos }]);
      }
    }
    chart.setOption(option);
  };
  return { draw };
}
