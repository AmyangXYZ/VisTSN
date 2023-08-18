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
      pos: [50, 191.66]
    },
    sw01: {
      type: 'sw',
      links: {
        p2: 'es09',
        p4: 'sw02',
        p5: 'sw00'
      },
      pos: [195, 191.66]
    },
    sw02: {
      type: 'sw',
      links: {
        p2: 'es10',
        p4: 'sw03',
        p5: 'sw01'
      },
      pos: [340, 191.66]
    },
    sw03: {
      type: 'sw',
      links: {
        p2: 'es11',
        p4: 'sw04',
        p5: 'sw02'
      },
      pos: [485, 191.66]
    },
    sw04: {
      type: 'sw',
      links: {
        p2: 'es12',
        p4: 'sw05',
        p5: 'sw03'
      },
      pos: [50, 308.33]
    },
    sw05: {
      type: 'sw',
      links: {
        p2: 'es13',
        p4: 'sw06',
        p5: 'sw04'
      },
      pos: [195, 308.33]
    },
    sw06: {
      type: 'sw',
      links: {
        p2: 'es14',
        p4: 'sw07',
        p5: 'sw05'
      },
      pos: [340, 308.33]
    },
    sw07: {
      type: 'sw',
      links: {
        p2: 'es15',
        p4: 'sw00',
        p5: 'sw06'
      },
      pos: [485, 308.33]
    },
    es08: {
      type: 'end-station',
      links: {
        p2: 'sw00'
      },
      pos: [50, 75]
    },
    es09: {
      type: 'end-station',
      links: {
        p2: 'sw01'
      },
      pos: [195, 75]
    },
    es10: {
      type: 'end-station',
      links: {
        p2: 'sw02'
      },
      pos: [340, 75]
    },
    es11: {
      type: 'end-station',
      links: {
        p2: 'sw03'
      },
      pos: [485, 75]
    },
    es12: {
      type: 'end-station',
      links: {
        p2: 'sw04'
      },
      pos: [50, 425]
    },
    es13: {
      type: 'end-station',
      links: {
        p2: 'sw05'
      },
      pos: [195, 425]
    },
    es14: {
      type: 'end-station',
      links: {
        p2: 'sw06'
      },
      pos: [340, 425]
    },
    es15: {
      type: 'end-station',
      links: {
        p2: 'sw07'
      },
      pos: [485, 425]
    }
  }
})
