import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export function useEmployerLogout() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            await axios.post(
                "/api/auth/employer/logout",
                {},
                {
                    withCredentials: true,
                },
            );
        },

        onSuccess: () => {
            queryClient.removeQueries({
                queryKey: ["employer"],
            });

            window.location.href = "/services";
        },
    });
}