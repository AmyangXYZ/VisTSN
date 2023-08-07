import { ref, onMounted } from 'vue';

export function useLog() {
    const logData = ref<string[]>([]);

    onMounted(async () => {
        try {
            const response = await fetch('../../example/json_format/log.json');
            logData.value = await response.json();
        } 
        catch (error) {
            console.error('Error fetching data:', error);
        }
    });

    return { logData };
}