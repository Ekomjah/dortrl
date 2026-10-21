import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createLink,
  deleteLink,
  updateLink,
  type CreateLinkInput,
  type UpdateLinkInput,
} from "../api";
import { queryKeys } from "../queryKeys";

export const useCreateLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateLinkInput) => createLink(input),
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.links });
    },
  });
};

export const useUpdateLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ code, input }: { code: string; input: UpdateLinkInput }) =>
      updateLink(code, input),
    retry: false,
    onSuccess: (updated, { code }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.links });
      queryClient.removeQueries({ queryKey: queryKeys.linkStats(code) });
      if (updated.short_code !== code) {
        queryClient.removeQueries({
          queryKey: queryKeys.linkStats(updated.short_code),
        });
      }
    },
  });
};

export const useDeleteLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => deleteLink(code),
    retry: false,
    onSuccess: (_result, code) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.links });
      queryClient.removeQueries({ queryKey: queryKeys.linkStats(code) });
    },
  });
};
