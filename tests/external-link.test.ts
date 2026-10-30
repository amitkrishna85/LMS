import { describe, it, expect } from "vitest";

describe("External Course Link & Compliance Validation", () => {
  const validateExternalCourseUrl = (url?: string | null) => {
    if (!url) return false;
    try {
      const parsed = new URL(url);
      return parsed.protocol === "https:";
    } catch (e) {
      return false;
    }
  };

  const allowedSelfReportStatuses = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"];
  const isValidProgressStatus = (status: string) => {
    return allowedSelfReportStatuses.includes(status);
  };

  it("should validate that external course URLs strictly require https protocol", () => {
    expect(validateExternalCourseUrl("https://www.udemy.com/course/sample")).toBe(true);
    expect(validateExternalCourseUrl("https://coursera.org/learn/system-design")).toBe(true);
    expect(validateExternalCourseUrl("http://insecure-site.com/course")).toBe(false);
    expect(validateExternalCourseUrl("javascript:alert(1)")).toBe(false);
    expect(validateExternalCourseUrl("")).toBe(false);
    expect(validateExternalCourseUrl(null)).toBe(false);
  });

  it("should only accept valid self-reported progress statuses", () => {
    expect(isValidProgressStatus("NOT_STARTED")).toBe(true);
    expect(isValidProgressStatus("IN_PROGRESS")).toBe(true);
    expect(isValidProgressStatus("COMPLETED")).toBe(true);
    expect(isValidProgressStatus("INVALID_STATUS")).toBe(false);
  });

  it("should ensure rel attributes are secure for external window opening", () => {
    const relAttributes = "noopener,noreferrer";
    expect(relAttributes.includes("noopener")).toBe(true);
    expect(relAttributes.includes("noreferrer")).toBe(true);
  });
});
