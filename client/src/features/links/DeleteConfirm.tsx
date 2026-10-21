import { useDeleteLink } from "@/lib/api/mutations/useLinkMutations";
import { getApiError } from "@/lib/api/getAPIError";
import { actionClass, destructiveActionClass } from "./actionStyles";

export function DeleteConfirm({
  code,
  label,
  onCancel,
  onDeleted,
}: {
  code: string;
  label: string;
  onCancel: () => void;
  onDeleted?: () => void;
}) {
  const remove = useDeleteLink();
  const error = remove.isError ? getApiError(remove.error) : null;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <p className="text-sm">
        Delete <span className="font-medium">{label}</span>? This can't be
        undone.
      </p>
      <button
        type="button"
        className={destructiveActionClass}
        disabled={remove.isPending}
        onClick={() => remove.mutate(code, { onSuccess: onDeleted })}
      >
        {remove.isPending ? "Deleting…" : "Delete"}
      </button>
      <button type="button" className={actionClass} onClick={onCancel}>
        Cancel
      </button>
      {error ? (
        <p role="alert" className="text-destructive w-full text-sm">
          {error.message}
        </p>
      ) : null}
    </div>
  );
}
