import axios from 'axios';

// 1. Initialize the instance
const apiPrivate = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    timeout: 10000, // 10 seconds timeout
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});









export default apiPrivate;


let refreshInFlight: Promise<void> | null = null;

async function refreshToken(): Promise<void> {

    if (!refreshInFlight) {
        refreshInFlight = apiPrivate.post('/api/user/refresh')
            .then(() => {
            })
            .finally(() => {
                refreshInFlight = null;
            })
    }

    await refreshInFlight;




}


apiPrivate.interceptors.request.use(
    (response) => {

        if (typeof window === 'undefined') {
            const internalUrl = process.env.INTERNAL_API_URL!;

            if (response.url && response.url.includes("localhost:8080")) {
                response.url = response.url.replace(/https?:\/\/localhost:8080/, internalUrl);
            }
            response.baseURL = internalUrl;
        }

        return response;

    },


    async (error) => {

        const status = error.response?.status;
        const original = error?.config;

        if (!original) {
            return Promise.reject(error);
        }

        const url = String(original?.url || '');
        const isRefreshCall = url.includes('api/user/refresh');
        const alreadyRetried = Boolean(original._retry);


        if (alreadyRetried || isRefreshCall || status !== 401) {
            return Promise.reject(error);
        }


        try {
            original._retry = true;
            await refreshToken();
            return apiPrivate(original);

        } catch (err) {
            return Promise.reject(err);
        }


    }

)



