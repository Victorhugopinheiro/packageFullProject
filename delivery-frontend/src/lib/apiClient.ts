import axios from 'axios';

// 1. Initialize the instance
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    timeout: 10000, // 10 seconds timeout

    withCredentials: true,
});





export default api;



api.interceptors.request.use(
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




)



