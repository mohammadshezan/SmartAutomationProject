"use client";
import { useEffect } from 'react';

export default function CustomerOrderTracking() {
  useEffect(() => {
    // Permanently redirect this page to the consolidated customer dashboard
    window.location.replace('/customer/dashboard');
  }, []);
  return null;
}
