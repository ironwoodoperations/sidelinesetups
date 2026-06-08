import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn (class merge utility)", () => {
  it("joins truthy class names and drops falsy ones", () => {
    const disabled: string | false = false;
    expect(cn("a", disabled && "hidden", undefined, "c")).toBe("a c");
  });

  it("lets a later Tailwind class override an earlier conflicting one", () => {
    // tailwind-merge should keep only the last padding class
    expect(cn("p-2", "p-4")).toBe("p-4");
  });
});
