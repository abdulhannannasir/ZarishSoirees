import { useSyncExternalStore } from "react";

const subscribe = (onChange: () => void) => {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
};

/**
 * The address's query string ("?r=hall&t=serene-romantic", or ""), read without making the page
 * dynamic: on the server and while hydrating it is "", and the real value follows. Components that
 * only enhance themselves from the address (pre-filling a form, building a message) can use it on a
 * statically generated page without a Suspense boundary.
 */
export function useSearchString(): string {
  return useSyncExternalStore(
    subscribe,
    () => window.location.search,
    () => "",
  );
}
