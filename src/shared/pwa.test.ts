import { afterEach, describe, expect, it, vi } from "vitest";
import { isStandalonePwa, registerServiceWorker } from "./pwa";

describe("pwa module registration", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns null when serviceWorker is not supported in navigator", async () => {
    const originalNavigator = window.navigator;
    const navigatorMock = { ...originalNavigator };
    // @ts-expect-error test unsupported navigator
    delete navigatorMock.serviceWorker;
    vi.spyOn(window, "navigator", "get").mockReturnValue(navigatorMock as Navigator);

    const result = await registerServiceWorker();
    expect(result).toBeNull();
  });

  it("handles registration failure gracefully without throwing", async () => {
    const registerMock = vi
      .fn<
        (url: string | URL, options?: RegistrationOptions) => Promise<ServiceWorkerRegistration>
      >()
      .mockRejectedValue(new Error("SecurityError"));
    vi.spyOn(window, "navigator", "get").mockReturnValue({
      serviceWorker: { register: registerMock },
    } as unknown as Navigator);

    const result = await registerServiceWorker();
    expect(result).toBeNull();
    expect(registerMock).toHaveBeenCalledWith("/sw.js", { scope: "/" });
  });

  it("registers service worker successfully when supported", async () => {
    const mockRegistration = { scope: "/" } as ServiceWorkerRegistration;
    const registerMock = vi
      .fn<
        (url: string | URL, options?: RegistrationOptions) => Promise<ServiceWorkerRegistration>
      >()
      .mockResolvedValue(mockRegistration);
    vi.spyOn(window, "navigator", "get").mockReturnValue({
      serviceWorker: { register: registerMock },
    } as unknown as Navigator);

    const result = await registerServiceWorker();
    expect(result).toBe(mockRegistration);
  });
});

describe("pwa module display mode", () => {
  it("detects standalone display mode", () => {
    window.matchMedia = vi.fn<(query: string) => MediaQueryList>().mockImplementation((query) => ({
      matches: query === "(display-mode: standalone)",
      media: query,
      onchange: null,
      addListener: vi.fn<() => void>(),
      removeListener: vi.fn<() => void>(),
      addEventListener: vi.fn<() => void>(),
      removeEventListener: vi.fn<() => void>(),
      dispatchEvent: vi.fn<() => boolean>(),
    }));

    expect(isStandalonePwa()).toBe(true);
  });
});
