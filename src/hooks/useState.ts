import { ref } from 'vue'

export const State = ref<any>({
  topo: {
    sw00: {
      type: 'sw',
      links: {
        p2: 'es08',
        p4: 'sw01',
        p5: 'sw07'
      },
      pos: [0, 400]
    },
    sw01: {
      type: 'sw',
      links: {
        p2: 'es09',
        p4: 'sw02',
        p5: 'sw00'
      },
      pos: [200, 400]
    },
    sw02: {
      type: 'sw',
      links: {
        p2: 'es10',
        p4: 'sw03',
        p5: 'sw01'
      },
      pos: [400, 400]
    },
    sw03: {
      type: 'sw',
      links: {
        p2: 'es11',
        p4: 'sw04',
        p5: 'sw02'
      },
      pos: [600, 400]
    },
    sw04: {
      type: 'sw',
      links: {
        p2: 'es12',
        p4: 'sw05',
        p5: 'sw03'
      },
      pos: [0, 700]
    },
    sw05: {
      type: 'sw',
      links: {
        p2: 'es13',
        p4: 'sw06',
        p5: 'sw04'
      },
      pos: [200, 700]
    },
    sw06: {
      type: 'sw',
      links: {
        p2: 'es14',
        p4: 'sw07',
        p5: 'sw05'
      },
      pos: [400, 700]
    },
    sw07: {
      type: 'sw',
      links: {
        p2: 'es15',
        p4: 'sw00',
        p5: 'sw06'
      },
      pos: [600, 700]
    },
    es08: {
      type: 'end-station',
      links: {
        p2: 'sw00'
      },
      pos: [0, 100]
    },
    es09: {
      type: 'end-station',
      links: {
        p2: 'sw01'
      },
      pos: [200, 100]
    },
    es10: {
      type: 'end-station',
      links: {
        p2: 'sw02'
      },
      pos: [400, 100]
    },
    es11: {
      type: 'end-station',
      links: {
        p2: 'sw03'
      },
      pos: [600, 100]
    },
    es12: {
      type: 'end-station',
      links: {
        p2: 'sw04'
      },
      pos: [0, 1000]
    },
    es13: {
      type: 'end-station',
      links: {
        p2: 'sw05'
      },
      pos: [200, 1000]
    },
    es14: {
      type: 'end-station',
      links: {
        p2: 'sw06'
      },
      pos: [400, 1000]
    },
    es15: {
      type: 'end-station',
      links: {
        p2: 'sw07'
      },
      pos: [600, 1000]
    }
  }
})
