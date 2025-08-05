type GetRangeParams = {
  /**
   * The page we are currently at.
   */
  currentPage: number;
  /**
   * The number of pages to always show at the beginning and end of the range.
   * @default 2
   */
  boundaries?: number;
  /**
   * The number of pages to show before and after the current page.
   * This is the number of pages to show before and after the current page,
   * but not including the current page.
   * @default 1
   */
  offset?: number;
  /**
   * A ref to the function to call when the page changes.
   */
  onPageChangeRef?: { current: (page: number) => void };
  /**
   * The total number of pages.
   */
  pages: number;
};

type PaginationItem = ButtonItem | EllipsisItem;

function getRange({
  /**
   * The page we are currently at.
   */
  currentPage,
  boundaries = 2,
  offset = 1,
  pages,
  onPageChangeRef = { current: () => {} },
}: GetRangeParams): PaginationItem[] {
  const range: PaginationItem[] = [];

  /**
   * The number of items in the range.
   */
  const rangeLength = boundaries * 2 + offset * 2 + 3; // 3 => 2 ellipsis + currPage

  /**
   * If the number of pages is less than the range length,
   * we can just return a range of buttons.
   */
  if (pages <= rangeLength) {
    for (let i = 1; i <= pages; i++) {
      range.push(new ButtonItem({ value: i, onPageChangeRef }));
    }
    return range;
  }

  /**
   * The smallest value of the page on the right of the last ellipsis.
   */
  const minUnellipsedRight = pages - boundaries + 1;

  /**
   * The max value of unellipsed pages with the only ellipsis of the range on the right.
   * @example
   * boundaries = 2, offset = 1, pages = 20
   * rightEllispisOnlyLimit = 6
   * << < 1 2 3 4 5 [6]... 19 20 > >> 
   */
  const rightEllispisOnlyLimit = rangeLength - boundaries - 1;
  /**
   * The minimum value of unellipsed pages with the only ellipsis of the range on the left.
   * @example
   * boundaries = 2, offset = 1, pages = 20
   * leftEllipsisOnlyLimit = 15
   * << < 1 2 ... [15] 16 17 18 19 20 > >> 
   */
  const leftEllipsisOnlyLimit = pages - rangeLength + boundaries + 2;

  /**   
   * If the current page is within the range of pages to the right of the ellipsis.
   */
  if (currentPage + offset <= rightEllispisOnlyLimit) {
    /**
     * Add the buttons up to the ellipsis.
     */
    for (let i = 1; i <= rightEllispisOnlyLimit; i++) {
      range.push(new ButtonItem({ value: i, onPageChangeRef }));
    }

    /**
     * Add the ellipsis for the range of pages to the right of the ellipsis.
     */
    const ellipsedRange: number[] = [];
    for (let i = rightEllispisOnlyLimit + 1; i < minUnellipsedRight; i++) {
      ellipsedRange.push(i);
    }
    range.push(new EllipsisItem({ ellipsedRange, onPageChangeRef }));

    /**
     * Add the boundaries buttons after the ellipsis.
     */
    for (let i = minUnellipsedRight; i <= pages; i++) {
      range.push(new ButtonItem({ value: i, onPageChangeRef }));
    }
    return range;
  }

  /**
   * If the current page is within the range of pages to the left of the ellipsis.
   */
  if (currentPage - offset >= leftEllipsisOnlyLimit) {
    /**
     * Add the boundaries buttons before the ellipsis.
     */
    for (let i = 1; i <= boundaries; i++) {
      range.push(new ButtonItem({ value: i, onPageChangeRef }));
    }

    /**
     * Add the ellipsis for the range of pages to the left of the ellipsis.
     */
    const ellipsedRange: number[] = [];
    for (let i = boundaries + 1; i < leftEllipsisOnlyLimit; i++) {
      ellipsedRange.push(i);
    }

    range.push(new EllipsisItem({ ellipsedRange, onPageChangeRef }));

    /**
     * Add the buttons after the ellipsis till the last page.
     */
    for (let i = leftEllipsisOnlyLimit; i <= pages; i++) {
      range.push(new ButtonItem({ value: i, onPageChangeRef }));
    }

    return range;
  }

  /**
   * If the current page is not within the range of pages to the left or right of the ellipsis,
   * we will have a range like this:
   * << < 1 2 ... 9 10 11 ... 19 20 > >> 
   *
   * So we will first add the boundaries buttons.
   */
  for (let i = 1; i <= boundaries; i++) {
    range.push(new ButtonItem({ value: i, onPageChangeRef }));
  }

  /**
   * Add the ellipsis for the range of pages included in the ellipsis on the left.
   */
  const leftEllipsedRange: number[] = [];
  for (let i = boundaries + 1; i < currentPage - offset; i++) {
    leftEllipsedRange.push(i);
  }
  range.push(
    new EllipsisItem({ ellipsedRange: leftEllipsedRange, onPageChangeRef })
  );

  /**
   * Add the buttons for the range of pages between the left ellipsis and the right ellipsis.
   */
  for (let i = currentPage - offset; i <= currentPage + offset; i++) {
    range.push(new ButtonItem({ value: i, onPageChangeRef }));
  }

  /**
   * Add the ellipsis for the range of pages included in the ellipsis on the right.
   */
  const rightEllipsedRange: number[] = [];
  for (let i = currentPage + offset + 1; i < minUnellipsedRight; i++) {
    rightEllipsedRange.push(i);
  }

  range.push(
    new EllipsisItem({ ellipsedRange: rightEllipsedRange, onPageChangeRef })
  );

  /**
   * Add the buttons for the range of pages after the right ellipsis.
   */
  for (let i = minUnellipsedRight; i <= pages; i++) {
    range.push(new ButtonItem({ value: i, onPageChangeRef }));
  }
  return range;
}

class ButtonItem {
  type = "button" as const;
  value: number;
  #onPageChangeRef: { current: (page: number) => void };
  goToPage = () => {
    this.#onPageChangeRef.current(this.value);
  };

  constructor({
    value,
    onPageChangeRef,
  }: {
    value: number;
    onPageChangeRef: { current: (page: number) => void };
  }) {
    this.value = value;
    this.#onPageChangeRef = onPageChangeRef;
  }
}

class EllipsisItem {
  type = "ellipsis" as const;
  ellipsedRange: number[];
  #onPageChangeRef: { current: (page: number) => void };
  onChange = (evt: { value: string }) => {
    this.#onPageChangeRef.current(parseInt(evt.value));
  };

  constructor({
    ellipsedRange,
    onPageChangeRef,
  }: {
    ellipsedRange: number[];
    onPageChangeRef: { current: (page: number) => void };
  }) {
    this.ellipsedRange = ellipsedRange;
    this.#onPageChangeRef = onPageChangeRef;
  }
}

export {
  getRange,
  ButtonItem,
  EllipsisItem,
  type PaginationItem,
  type GetRangeParams,
};
