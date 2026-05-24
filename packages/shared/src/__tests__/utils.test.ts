import { sleep, formatDate, isValidEmail, generateId } from "../utils";

describe("Shared Utils", () => {
  describe("sleep", () => {
    it("should resolve after specified milliseconds", async () => {
      const start = Date.now();
      await sleep(100);
      const end = Date.now();
      expect(end - start).toBeGreaterThanOrEqual(90); // Allow some tolerance
    });
  });

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

  describe("generateId", () => {
    it("should generate a string", () => {
      const id = generateId();
      expect(typeof id).toBe("string");
      expect(id.length).toBeGreaterThan(0);
    });

    it("should generate unique IDs", () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });

    it("should generate IDs of expected length", () => {
      const id = generateId();
      expect(id.length).toBeGreaterThan(10); // Random length, but should be reasonable
      expect(id.length).toBeLessThanOrEqual(36);
    });
  });
});
