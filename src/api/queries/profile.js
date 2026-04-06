// Profile query hooks — fetch and update the logged-in user's profile.
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client, { multipartClient } from '../client';
import { extractPayload } from '../utils/responseParsers';

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await client.get('/profile');
      return extractPayload(res);
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData) => {
      const res = await multipartClient.put('/profile', formData);
      return extractPayload(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
