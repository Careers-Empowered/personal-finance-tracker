import jsPDF from "jspdf";

import type { Category } from "../category-create/categoryTypes";
import type { Subcategory } from "../subcategories/types/subcategory.types";

const PAGE_MARGIN = 18;
const CONTENT_WIDTH = 174;

const hexToRgb = (
  hex: string,
): [number, number, number] => {
  const cleaned = hex.replace("#", "");

  if (cleaned.length !== 6) {
    return [15, 39, 71];
  }

  return [
    parseInt(cleaned.slice(0, 2), 16),
    parseInt(cleaned.slice(2, 4), 16),
    parseInt(cleaned.slice(4, 6), 16),
  ];
};

const sanitizeFileName = (
  value: string,
): string => {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
};

const createUniqueFileName = (
  categories: Category[],
  selectedCategoryId: string | null,
) => {
  const selectedCategory =
    categories.find(
      (category) =>
        category.id === selectedCategoryId,
    );

  const customCategory =
    categories.find(
      (category) => category.isCustom,
    );

  const mainCategory =
    selectedCategory ??
    customCategory;

  const categoryName = mainCategory
    ? sanitizeFileName(
        mainCategory.name,
      )
    : "categories";

  const now = new Date();

  const year = now.getFullYear();

  const month = String(
    now.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    now.getDate(),
  ).padStart(2, "0");

  const hours = String(
    now.getHours(),
  ).padStart(2, "0");

  const minutes = String(
    now.getMinutes(),
  ).padStart(2, "0");

  const seconds = String(
    now.getSeconds(),
  ).padStart(2, "0");

  return (
    `categories-${categoryName}` +
    `-${year}-${month}-${day}` +
    `-${hours}${minutes}${seconds}.pdf`
  );
};

const addPageNumbers = (pdf: jsPDF) => {
  const pageCount =
    pdf.getNumberOfPages();

  for (
    let page = 1;
    page <= pageCount;
    page += 1
  ) {
    pdf.setPage(page);

    const pageHeight =
      pdf.internal.pageSize.getHeight();

    pdf.setDrawColor(
      220,
      226,
      234,
    );

    pdf.line(
      PAGE_MARGIN,
      pageHeight - 15,
      PAGE_MARGIN + CONTENT_WIDTH,
      pageHeight - 15,
    );

    pdf.setFontSize(8);

    pdf.setTextColor(
      120,
      130,
      145,
    );

    pdf.text(
      "Personal Finance Tracker",
      PAGE_MARGIN,
      pageHeight - 9,
    );

    pdf.text(
      `Page ${page} of ${pageCount}`,
      PAGE_MARGIN + CONTENT_WIDTH,
      pageHeight - 9,
      {
        align: "right",
      },
    );
  }
};

export const downloadCategoryPdf = (
  categories: Category[],
  subcategories: Subcategory[],
  selectedCategoryId: string | null,
) => {
  /*
   * ========================================
   * SELECT REPORT CATEGORIES
   * ========================================
   *
   * Include:
   * 1. All custom categories.
   * 2. The currently selected default category.
   *
   * Other default categories are excluded.
   */

  const reportCategories =
    categories.filter(
      (category) =>
        category.isCustom ||
        category.id === selectedCategoryId,
    );

  const reportCategoryIds = new Set(
    reportCategories.map(
      (category) => category.id,
    ),
  );

  const reportSubcategories =
    subcategories.filter(
      (subcategory) =>
        reportCategoryIds.has(
          subcategory.categoryId,
        ),
    );

  const pdf = new jsPDF();

  const pageHeight =
    pdf.internal.pageSize.getHeight();

  let y = 18;

  const addPageIfNeeded = (
    height: number,
  ) => {
    if (
      y + height >
      pageHeight - 25
    ) {
      pdf.addPage();
      y = 22;
    }
  };

  /*
   * ========================================
   * HEADER
   * ========================================
   */

  pdf.setFillColor(
    15,
    39,
    71,
  );

  pdf.roundedRect(
    PAGE_MARGIN,
    y,
    CONTENT_WIDTH,
    34,
    5,
    5,
    "F",
  );

  pdf.setTextColor(
    255,
    255,
    255,
  );

  pdf.setFontSize(19);

  pdf.setFont(
    "helvetica",
    "bold",
  );

  pdf.text(
    "Personal Finance Tracker",
    PAGE_MARGIN + 8,
    y + 13,
  );

  pdf.setFontSize(10);

  pdf.setFont(
    "helvetica",
    "normal",
  );

  pdf.text(
    "Category & Subcategory Report",
    PAGE_MARGIN + 8,
    y + 21,
  );

  pdf.setFontSize(8);

  pdf.text(
    `Generated ${new Date().toLocaleString()}`,
    PAGE_MARGIN + 8,
    y + 28,
  );

  y += 44;

  /*
   * ========================================
   * EMPTY REPORT
   * ========================================
   */

  if (
    reportCategories.length === 0
  ) {
    pdf.setTextColor(
      20,
      38,
      65,
    );

    pdf.setFontSize(14);

    pdf.setFont(
      "helvetica",
      "bold",
    );

    pdf.text(
      "No categories selected",
      PAGE_MARGIN,
      y,
    );

    y += 9;

    pdf.setFontSize(9);

    pdf.setFont(
      "helvetica",
      "normal",
    );

    pdf.setTextColor(
      100,
      110,
      125,
    );

    pdf.text(
      "Select a default category or create a custom category before downloading the report.",
      PAGE_MARGIN,
      y,
      {
        maxWidth: CONTENT_WIDTH,
      },
    );

    addPageNumbers(pdf);

    pdf.save(
      createUniqueFileName(
        categories,
        selectedCategoryId,
      ),
    );

    return;
  }

  /*
   * ========================================
   * SUMMARY DATA
   * ========================================
   */

  const expenseCategories =
    reportCategories.filter(
      (category) =>
        category.type === "expense",
    );

  const incomeCategories =
    reportCategories.filter(
      (category) =>
        category.type === "income",
    );

  const customCategories =
    reportCategories.filter(
      (category) =>
        category.isCustom,
    );

  const defaultCategories =
    reportCategories.filter(
      (category) =>
        !category.isCustom,
    );

  const summaryItems = [
    {
      label: "Categories",
      value: reportCategories.length,
    },
    {
      label: "Subcategories",
      value: reportSubcategories.length,
    },
    {
      label: "Custom",
      value: customCategories.length,
    },
    {
      label: "Default",
      value: defaultCategories.length,
    },
  ];

  /*
   * ========================================
   * SUMMARY CARDS
   * ========================================
   */

  const cardGap = 4;

  const cardWidth =
    (CONTENT_WIDTH -
      cardGap * 3) /
    4;

  summaryItems.forEach(
    (item, index) => {
      const x =
        PAGE_MARGIN +
        index *
          (cardWidth + cardGap);

      pdf.setFillColor(
        247,
        249,
        252,
      );

      pdf.setDrawColor(
        225,
        230,
        238,
      );

      pdf.roundedRect(
        x,
        y,
        cardWidth,
        25,
        3,
        3,
        "FD",
      );

      pdf.setTextColor(
        15,
        39,
        71,
      );

      pdf.setFontSize(15);

      pdf.setFont(
        "helvetica",
        "bold",
      );

      pdf.text(
        String(item.value),
        x + cardWidth / 2,
        y + 11,
        {
          align: "center",
        },
      );

      pdf.setTextColor(
        105,
        115,
        130,
      );

      pdf.setFontSize(7);

      pdf.setFont(
        "helvetica",
        "normal",
      );

      pdf.text(
        item.label,
        x + cardWidth / 2,
        y + 19,
        {
          align: "center",
        },
      );
    },
  );

  y += 36;

  /*
   * ========================================
   * REPORT TYPE SUMMARY
   * ========================================
   */

  addPageIfNeeded(30);

  pdf.setFillColor(
    248,
    250,
    253,
  );

  pdf.setDrawColor(
    225,
    230,
    238,
  );

  pdf.roundedRect(
    PAGE_MARGIN,
    y,
    CONTENT_WIDTH,
    25,
    4,
    4,
    "FD",
  );

  pdf.setTextColor(
    15,
    39,
    71,
  );

  pdf.setFontSize(9);

  pdf.setFont(
    "helvetica",
    "bold",
  );

  pdf.text(
    "REPORT OVERVIEW",
    PAGE_MARGIN + 7,
    y + 8,
  );

  pdf.setFontSize(8);

  pdf.setFont(
    "helvetica",
    "normal",
  );

  pdf.setTextColor(
    90,
    100,
    115,
  );

  pdf.text(
    `Expense categories: ${expenseCategories.length}`,
    PAGE_MARGIN + 7,
    y + 16,
  );

  pdf.text(
    `Income categories: ${incomeCategories.length}`,
    PAGE_MARGIN + 95,
    y + 16,
  );

  y += 34;

  /*
   * ========================================
   * CATEGORY SECTIONS
   * ========================================
   */

  const renderCategoryType = (
    type: Category["type"],
    title: string,
    accent: [number, number, number],
  ) => {
    const typeCategories =
      reportCategories.filter(
        (category) =>
          category.type === type,
      );

    if (
      typeCategories.length === 0
    ) {
      return;
    }

    addPageIfNeeded(20);

    /*
     * Section accent
     */

    pdf.setFillColor(
      accent[0],
      accent[1],
      accent[2],
    );

    pdf.roundedRect(
      PAGE_MARGIN,
      y,
      4,
      10,
      2,
      2,
      "F",
    );

    pdf.setTextColor(
      15,
      39,
      71,
    );

    pdf.setFontSize(16);

    pdf.setFont(
      "helvetica",
      "bold",
    );

    pdf.text(
      title,
      PAGE_MARGIN + 9,
      y + 8,
    );

    y += 17;

    typeCategories.forEach(
      (category) => {
        const categorySubcategories =
          reportSubcategories.filter(
            (subcategory) =>
              subcategory.categoryId ===
              category.id,
          );

        const cardHeight =
          15 +
          Math.max(
            categorySubcategories.length *
              7,
            8,
          );

        addPageIfNeeded(
          cardHeight + 6,
        );

        const categoryColor =
          category.color
            ? hexToRgb(category.color)
            : accent;

        /*
         * Category card
         */

        pdf.setFillColor(
          250,
          251,
          253,
        );

        pdf.setDrawColor(
          225,
          230,
          238,
        );

        pdf.roundedRect(
          PAGE_MARGIN,
          y,
          CONTENT_WIDTH,
          cardHeight,
          4,
          4,
          "FD",
        );

        /*
         * Category badge
         */

        pdf.setFillColor(
          categoryColor[0],
          categoryColor[1],
          categoryColor[2],
        );

        pdf.circle(
          PAGE_MARGIN + 10,
          y + 10,
          5,
          "F",
        );

        /*
         * Category initial
         */

        pdf.setTextColor(
          255,
          255,
          255,
        );

        pdf.setFontSize(9);

        pdf.setFont(
          "helvetica",
          "bold",
        );

        const initial =
          category.name
            .trim()
            .charAt(0)
            .toUpperCase();

        pdf.text(
          initial || "?",
          PAGE_MARGIN + 10,
          y + 13,
          {
            align: "center",
          },
        );

        /*
         * Category name
         */

        pdf.setTextColor(
          20,
          38,
          65,
        );

        pdf.setFontSize(11);

        pdf.setFont(
          "helvetica",
          "bold",
        );

        pdf.text(
          category.name,
          PAGE_MARGIN + 19,
          y + 9,
        );

        /*
         * Category badge label
         */

        pdf.setTextColor(
          120,
          130,
          145,
        );

        pdf.setFontSize(7);

        pdf.setFont(
          "helvetica",
          "normal",
        );

        pdf.text(
          category.isCustom
            ? "CUSTOM CATEGORY"
            : "SELECTED DEFAULT CATEGORY",
          PAGE_MARGIN + 19,
          y + 14,
        );

        /*
         * Subcategories
         */

        let subY = y + 23;

        if (
          categorySubcategories.length ===
          0
        ) {
          pdf.setTextColor(
            145,
            150,
            160,
          );

          pdf.setFontSize(8);

          pdf.text(
            "No subcategories",
            PAGE_MARGIN + 19,
            subY,
          );
        } else {
          categorySubcategories.forEach(
            (subcategory) => {
              pdf.setFillColor(
                categoryColor[0],
                categoryColor[1],
                categoryColor[2],
              );

              pdf.circle(
                PAGE_MARGIN + 21,
                subY - 1.5,
                1.3,
                "F",
              );

              pdf.setTextColor(
                75,
                85,
                100,
              );

              pdf.setFontSize(8);

              pdf.setFont(
                "helvetica",
                "normal",
              );

              pdf.text(
                subcategory.name,
                PAGE_MARGIN + 26,
                subY,
              );

              subY += 7;
            },
          );
        }

        y += cardHeight + 6;
      },
    );

    y += 5;
  };

  renderCategoryType(
    "expense",
    "Expense Categories",
    [245, 145, 55],
  );

  renderCategoryType(
    "income",
    "Income Categories",
    [45, 150, 105],
  );

  /*
   * ========================================
   * FOOTER / PAGE NUMBERS
   * ========================================
   */

  addPageNumbers(pdf);

  /*
   * ========================================
   * SAVE PDF
   * ========================================
   */

  pdf.save(
    createUniqueFileName(
      categories,
      selectedCategoryId,
    ),
  );
};