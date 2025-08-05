import { expect, test } from "vitest";
import { ButtonItem, EllipsisItem, getRange } from "./utils";

const onPageChangeRef = { current: () => {} };

test("getRange, no ellipsis", () => {
  const range = getRange({
    currentPage: 1,
    pages: 9,
    offset: 1,
    boundaries: 2,
  });

  expect(range.length).toBe(9);

  expect(JSON.stringify(range)).toStrictEqual(
    JSON.stringify([
      ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map(
        (value) => new ButtonItem({ value, onPageChangeRef })
      ),
    ])
  );
});

test("getRange, right ellipsis only", () => {
  const range = getRange({
    currentPage: 1,
    pages: 10,
    offset: 1,
    boundaries: 2,
  });

  expect(range.length).toBe(9);

  expect(JSON.stringify(range)).toStrictEqual(
    JSON.stringify([
      ...[1, 2, 3, 4, 5, 6].map(
        (value) => new ButtonItem({ value, onPageChangeRef })
      ),
      new EllipsisItem({ ellipsedRange: [7, 8], onPageChangeRef }),
      ...[9, 10].map((value) => new ButtonItem({ value, onPageChangeRef })),
    ])
  );
});

test("getRange, left ellipsis only", () => {
  const range = getRange({
    currentPage: 7,
    pages: 10,
    offset: 1,
    boundaries: 2,
  });

  expect(range.length).toBe(9);

  expect(JSON.stringify(range)).toStrictEqual(
    JSON.stringify([
      ...[1, 2].map((value) => new ButtonItem({ value, onPageChangeRef })),
      new EllipsisItem({ ellipsedRange: [3, 4], onPageChangeRef }),
      ...[5, 6, 7, 8, 9, 10].map(
        (value) => new ButtonItem({ value, onPageChangeRef })
      ),
    ])
  );
});

test("getRange, left ellipsis and right ellipsis", () => {
  const range = getRange({
    currentPage: 10,
    pages: 20,
    offset: 1,
    boundaries: 2,
  });

  expect(range.length).toBe(9);

  expect(JSON.stringify(range)).toStrictEqual(
    JSON.stringify([
      ...[1, 2].map((value) => new ButtonItem({ value, onPageChangeRef })),
      new EllipsisItem({ ellipsedRange: [3, 4, 5, 6, 7, 8], onPageChangeRef }),
      ...[9, 10, 11].map((value) => new ButtonItem({ value, onPageChangeRef })),
      new EllipsisItem({
        ellipsedRange: [12, 13, 14, 15, 16, 17, 18],
        onPageChangeRef,
      }),
      ...[19, 20].map((value) => new ButtonItem({ value, onPageChangeRef })),
    ])
  );
});
