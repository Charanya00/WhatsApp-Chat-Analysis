import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type AnalysisSession, type GetSessionResponse, type UploadChatResponse } from "@shared/schema";

// Custom error parsing to handle backend formats
const parseError = async (res: Response) => {
  try {
    const errorData = await res.json();
    return new Error(errorData.message || "An unknown error occurred");
  } catch {
    return new Error(`Request failed with status ${res.status}`);
  }
};

export function useUploadChat() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (file: File): Promise<UploadChatResponse> => {
      const formData = new FormData();
      formData.append('file', file); // Adjust field name if backend expects 'chat'

      const res = await fetch(api.chat.upload.path, {
        method: api.chat.upload.method,
        body: formData,
        // Do NOT set Content-Type header; browser sets it automatically with the boundary for FormData
      });

      if (!res.ok) throw await parseError(res);
      
      // The schema returns z.any(), so we cast it to our known type
      return (await res.json()) as UploadChatResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.sessions.list.path] });
    },
  });
}

export function useSessions() {
  return useQuery({
    queryKey: [api.sessions.list.path],
    queryFn: async (): Promise<AnalysisSession[]> => {
      const res = await fetch(api.sessions.list.path, { credentials: "include" });
      if (!res.ok) throw await parseError(res);
      return api.sessions.list.responses[200].parse(await res.json());
    },
  });
}

export function useSessionAnalysis(id: number | null) {
  return useQuery({
    queryKey: [api.sessions.get.path, id],
    queryFn: async (): Promise<GetSessionResponse | null> => {
      if (!id) return null;
      const url = buildUrl(api.sessions.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      
      if (res.status === 404) return null;
      if (!res.ok) throw await parseError(res);
      
      return (await res.json()) as GetSessionResponse;
    },
    enabled: !!id, // Only run the query if we have an ID
  });
}
