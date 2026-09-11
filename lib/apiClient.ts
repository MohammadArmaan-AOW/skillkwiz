import axios from "axios";

const apiClient = axios.create({
    baseURL: "",
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        /*
         * Keep API errors available to React Query mutations/queries.
         *
         * Components/hooks can inspect:
         * error.response?.status
         * error.response?.data
         */
        return Promise.reject(error);
    },
);

export default apiClient;
