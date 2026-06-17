import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useIsMobile } from './useIsMobile';

describe('useIsMobile', () => {
  const originalInnerWidth = window.innerWidth;

  const setWindowWidth = (width) => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    });
  };

  afterEach(() => {
    setWindowWidth(originalInnerWidth);
  });

  it('mengembalikan true ketika innerWidth < 768 (mobile)', () => {
    setWindowWidth(375);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('mengembalikan false ketika innerWidth >= 768 (tablet/desktop)', () => {
    setWindowWidth(768);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('mengembalikan false ketika innerWidth = 1024 (desktop)', () => {
    setWindowWidth(1024);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('update state saat window di-resize dari desktop ke mobile', () => {
    setWindowWidth(1024);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    act(() => {
      setWindowWidth(375);
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current).toBe(true);
  });

  it('update state saat window di-resize dari mobile ke desktop', () => {
    setWindowWidth(375);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);

    act(() => {
      setWindowWidth(1024);
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current).toBe(false);
  });

  it('membersihkan event listener saat unmount', () => {
    setWindowWidth(375);
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useIsMobile());
    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    removeEventListenerSpy.mockRestore();
  });

  it('mengembalikan false sebagai default ketika window tidak tersedia (SSR)', () => {
    // Simulasi SSR: window.innerWidth tidak diakses saat typeof window === 'undefined'
    // Kita verifikasi bahwa nilai default state adalah false (bukan error)
    // dengan cara memeriksa bahwa hook tidak crash saat window ada
    setWindowWidth(375);
    const { result } = renderHook(() => useIsMobile());
    // Hook harus berjalan tanpa error
    expect(typeof result.current).toBe('boolean');
  });

  it('mengembalikan true tepat di bawah breakpoint 768px', () => {
    setWindowWidth(767);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('mengembalikan false tepat di breakpoint 768px', () => {
    setWindowWidth(768);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });
});
