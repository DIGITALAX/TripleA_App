"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CONTRACTS_PAUSED,
  CONTRACTS_PAUSED_EVENT,
  NOTICE_STORAGE_KEY,
} from "@/lib/constants";

const useNotice = () => {
  const [noticeOpen, setNoticeOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!CONTRACTS_PAUSED) return;

    let seen = false;
    try {
      seen = window.sessionStorage.getItem(NOTICE_STORAGE_KEY) === "1";
    } catch (err) {
      seen = false;
    }
    if (!seen) setNoticeOpen(true);

    const onBlocked = () => setNoticeOpen(true);

    window.addEventListener(CONTRACTS_PAUSED_EVENT, onBlocked);
    return () => {
      window.removeEventListener(CONTRACTS_PAUSED_EVENT, onBlocked);
    };
  }, []);

  const hideNotice = useCallback(() => {
    try {
      window.sessionStorage.setItem(NOTICE_STORAGE_KEY, "1");
    } catch (err) {}
    setNoticeOpen(false);
  }, []);

  return { noticeOpen, hideNotice };
};

export default useNotice;
