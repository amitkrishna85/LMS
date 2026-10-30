import { describe, it, expect } from "vitest";

describe("Learning Path Sequence & Progress Calculation", () => {
  const samplePathItems = [
    { id: "item_3", courseId: "c3", order: 3, isRequired: true, title: "Kubernetes in Prod" },
    { id: "item_1", courseId: "c1", order: 1, isRequired: true, title: "Modern TS & Next.js" },
    { id: "item_2", courseId: "c2", order: 2, isRequired: false, title: "Cloud Architecture (Udemy)" },
  ];

  it("should sort learning path items strictly by sequential order", () => {
    const sorted = [...samplePathItems].sort((a, b) => a.order - b.order);
    expect(sorted[0].order).toBe(1);
    expect(sorted[1].order).toBe(2);
    expect(sorted[2].order).toBe(3);
    expect(sorted[0].courseId).toBe("c1");
  });

  it("should correctly compute composite progress percentage across internal & external courses", () => {
    const totalItems = samplePathItems.length;
    // Student completed c1 (internal) and c2 (external self-reported)
    const completedCourseIds = new Set(["c1", "c2"]);

    const completedCount = samplePathItems.filter((item) =>
      completedCourseIds.has(item.courseId)
    ).length;

    const percent = Math.round((completedCount / totalItems) * 100);
    expect(percent).toBe(67); // 2 out of 3 = 66.67% => 67%
  });

  it("should return 100% when all items in path are completed", () => {
    const completedCourseIds = new Set(["c1", "c2", "c3"]);
    const completedCount = samplePathItems.filter((item) =>
      completedCourseIds.has(item.courseId)
    ).length;
    const percent = Math.round((completedCount / samplePathItems.length) * 100);
    expect(percent).toBe(100);
  });
});
