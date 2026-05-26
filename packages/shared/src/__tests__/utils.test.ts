import { formatDate, isValidEmail, truncate } from "../utils";

describe("Shared Utils", () => {
  describe("formatDate", () => {
    it("should format date to YYYY-MM-DD", () => {
      const date = new Date("2023-12-25T10:30:00Z");
      expect(formatDate(date)).toBe("2023-12-25");
    });

    it("should handle different dates correctly", () => {
      const date = new Date("2024-01-01T00:00:00Z");
      expect(formatDate(date)).toBe("2024-01-01");
    });
  });

  describe("isValidEmail", () => {
    it("should return true for valid emails", () => {
      expect(isValidEmail("test@example.com")).toBe(true);
      expect(isValidEmail("user.name+tag@domain.co.uk")).toBe(true);
      expect(isValidEmail("user123@subdomain.domain.org")).toBe(true);
    });

    it("should return false for invalid emails", () => {
      expect(isValidEmail("")).toBe(false);
      expect(isValidEmail("invalid")).toBe(false);
      expect(isValidEmail("test@")).toBe(false);
      expect(isValidEmail("@example.com")).toBe(false);
      expect(isValidEmail("test.example.com")).toBe(false);
      expect(isValidEmail("test@example")).toBe(false);
    });
  });

  describe("truncate", () => {
    it("should not truncate short strings", () => {
      expect(truncate("hello", 10)).toBe("hello");
    });

    it("should truncate long strings with default suffix", () => {
      expect(truncate("hello world", 8)).toBe("hello...");
    });

    it("should use custom suffix", () => {
      expect(truncate("hello world", 9, "…")).toBe("hello wo…");
    });
  });
});
