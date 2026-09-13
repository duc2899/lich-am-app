export type DateValidationOptions = {
    yearRequired?: boolean;
    fieldLabel?: string;
};

export function validateDateParts(
    day: string,
    month: string,
    year: string,
    opts: DateValidationOptions = {}
): string | null {
    const suffix = opts.fieldLabel ? ` ${opts.fieldLabel}` : "";
    const currentYear = new Date().getFullYear();

    if (opts.yearRequired && !year.trim()) {
        return `Vui lòng nhập năm${suffix}`;
    }
    if (year.trim()) {
        const y = Number(year);
        if (!Number.isInteger(y) || y < 1900 || y > currentYear) {
            return `Năm${suffix} không hợp lệ`;
        }
    }
    if (day.trim()) {
        const d = Number(day);
        if (!Number.isInteger(d) || d < 1 || d > 31) {
            return `Ngày${suffix} không hợp lệ`;
        }
    }
    if (month.trim()) {
        const m = Number(month);
        if (!Number.isInteger(m) || m < 1 || m > 12) {
            return `Tháng${suffix} không hợp lệ`;
        }
    }
    return null;
}

export function parseDateParts(day: string, month: string, year: string) {
    return {
        day: day.trim() ? Number(day) : undefined,
        month: month.trim() ? Number(month) : undefined,
        year: year.trim() ? Number(year) : undefined,
    };
}