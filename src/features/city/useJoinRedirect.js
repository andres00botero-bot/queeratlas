import { useCallback } from "react";
import { writeLocalValue } from "@/lib/storage";

export function useJoinRedirect({ pathname, router }) {
  const redirectToJoin = useCallback(
    (targetPath = pathname) => {
      writeLocalValue("qa_redirect", targetPath);
      router.push("/?join=true");
    },
    [pathname, router]
  );

  const redirectToJoinWithReturnTarget = useCallback(
    (targetPath) => {
      writeLocalValue("qa_redirect", targetPath);
      writeLocalValue("qa_post_login_target", targetPath);
      router.push("/?join=true");
    },
    [router]
  );

  return {
    redirectToJoin,
    redirectToJoinWithReturnTarget,
  };
}
