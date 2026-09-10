"use client";

import React, { useEffect, useState } from "react";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";

export function GlobalQueryLoader() {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const activeCount = isFetching + isMutating;
  const isLoading = activeCount > 0;

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoading) {
      timer = setTimeout(() => setVisible(true), 50);
    } else {
      timer = setTimeout(() => setVisible(false), 0);
    }
    return () => clearTimeout(timer);
  }, [isLoading]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading data..."
      className="fixed top-0 left-0 right-0 z-[9999] h-[3px] bg-[#333333]/40 overflow-hidden pointer-events-none backdrop-blur-xs"
    >
      <div className="h-full bg-gradient-to-r from-[#e01b22] via-[#ff4d4f] to-[#e01b22] shadow-[0_0_12px_#e01b22] animate-network-progress" />
    </div>
  );
}
