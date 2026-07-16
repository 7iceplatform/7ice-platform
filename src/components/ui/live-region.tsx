"use client";

import { useEffect, useState } from "react";

export function LiveRegion({ message }: { message: string }) {
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    const clearTimer = setTimeout(() => setAnnouncement(""), 0);
    const timer = setTimeout(() => setAnnouncement(message), 100);
    return () => {
      clearTimeout(clearTimer);
      clearTimeout(timer);
    };
  }, [message]);

  return (
    <div aria-live="polite" aria-atomic="true" className="sr-only">
      {announcement}
    </div>
  );
}
