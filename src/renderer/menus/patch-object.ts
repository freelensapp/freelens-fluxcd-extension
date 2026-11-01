import { Renderer } from "@freelensapp/extensions";

const {
  Component: { Notifications },
} = Renderer;

interface PatchedObject {
  kind: string;
  metadata: { name: string; namespace?: string };
}

/**
 * Runs the patch of a menu item and shows a failure as an error notification that names the action, the kind and the
 * object. The patch runs in `onClick`, and an error in an event handler does not reach the error boundary, so the
 * returned promise never rejects.
 *
 * The host's API rejects a failed request with a `JsonApiErrorParsed`, which is no `Error` and whose `toString()`
 * gives the messages of the response.
 */
export async function patchObject(action: string, object: PatchedObject, patch: () => Promise<unknown>): Promise<void> {
  try {
    await patch();
  } catch (error) {
    const { name, namespace } = object.metadata;
    const reason = error instanceof Error ? error.message : String(error);
    Notifications.error(`Failed to ${action} ${object.kind} ${namespace ? `${namespace}/` : ""}${name}: ${reason}`);
  }
}
