/**
 * Daily windows.
 */
export interface DayWindows {
  /** Overnight window; true means overnight, false means same day */
  overnight: boolean;
  /** Global window start hour (HH) */
  globalStartHour: string;
  /** Global window end hour (HH) */
  globalEndHour: string;
  /**
   * Local window hours (array of tuples of HH). Boolean marks if window is
   * overnight or not (true if overnight, false if across same day).
   */
  localHours: Array<[string, string, boolean]>;
}

/**
 * Weekly windows.
 */
export interface WeekWindows {
  /** Date before study (used as seed) */
  dateBeforeStudy?: string;
  /** Monday windows */
  monday: DayWindows;
  /** Tuesday windows */
  tuesday: DayWindows;
  /** Wednesday windows */
  wednesday: DayWindows;
  /** Thursday windows */
  thursday: DayWindows;
  /** Friday windows */
  friday: DayWindows;
  /** Saturday windows */
  saturday: DayWindows;
  /** Sunday windows */
  sunday: DayWindows;
}
