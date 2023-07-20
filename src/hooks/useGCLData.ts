import { ref, onMounted } from 'vue'

export function useGCLData() {
    const gclData = ref<any>([]);
    const linkData = ref<string>('');
    const priorityData = ref<string>('');

    // fetch from json files
    onMounted(async () => {
        try {
            const gResponse = await fetch('../../example/json_format/gcl.json')
            const gData = await gResponse.json()
            gclData.value = gData['(0, 8)'] // data for (0, 8) only

            linkData.value = '(0, 8)'

            const pResponse = await fetch('../../example/json_format/prio2q.json')
            const pData = await pResponse.json()
            gclData.value = pData['(0, 8)'] // data for (0, 8) only
            
        } catch (error) {
            console.error('Error fetching data:', error)
        }
    })

    return { gclData, linkData, priorityData }
}