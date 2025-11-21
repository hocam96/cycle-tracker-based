// src/App.jsx
import { useState, useEffect, useMemo } from "react";

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function stripTime(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isSameDay(a, b) {
  if (!a || !b) return false;
  const da = stripTime(a);
  const db = stripTime(b);
  return da.getTime() === db.getTime();
}

function formatDate(date) {
  if (!date) return "-";
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function calculateCycle(lastPeriodStr, cycleLength, periodLength) {
  if (!lastPeriodStr) return {};

  const lastPeriod = new Date(lastPeriodStr);
  const today = new Date();

  const nextPeriodStart = addDays(lastPeriod, cycleLength);
  const nextPeriodEnd = addDays(nextPeriodStart, periodLength - 1);

  const ovulationDay = addDays(lastPeriod, cycleLength - 14);
  const fertileStart = addDays(ovulationDay, -3);
  const fertileEnd = addDays(ovulationDay, 1);

  // Pregnancy estimate (40 weeks)
  const dueDate = addDays(lastPeriod, 280);
  const diffMsFromStart = today - lastPeriod;
  const diffDaysFromStart = Math.floor(diffMsFromStart / (1000 * 60 * 60 * 24));
  const pregWeeks = Math.floor(diffDaysFromStart / 7);
  const pregExtraDays = diffDaysFromStart % 7;

  // Today-in-cycle info
  let cycleDayToday = null;
  let phaseLabel = null;
  let phaseDescription = null;

  if (diffDaysFromStart >= 0) {
    cycleDayToday = (diffDaysFromStart % cycleLength) + 1;

    if (cycleDayToday <= periodLength) {
      phaseLabel = "Menstrual phase";
      phaseDescription = "Typical bleeding days of your cycle.";
    } else if (cycleDayToday < cycleLength - 14 - 1) {
      phaseLabel = "Follicular phase";
      phaseDescription = "Hormones rise and a follicle matures.";
    } else if (
      cycleDayToday >= cycleLength - 14 - 3 &&
      cycleDayToday <= cycleLength - 14 + 1
    ) {
      phaseLabel = "Fertile window";
      phaseDescription = "Higher chance of conception around ovulation.";
    } else {
      phaseLabel = "Luteal phase";
      phaseDescription =
        "Post-ovulation phase; PMS symptoms may appear for some people.";
    }
  }

  return {
    lastPeriod,
    nextPeriodStart,
    nextPeriodEnd,
    ovulationDay,
    fertileStart,
    fertileEnd,
    dueDate,
    pregWeeks: diffDaysFromStart >= 0 ? pregWeeks : null,
    pregExtraDays: diffDaysFromStart >= 0 ? pregExtraDays : null,
    cycleDayToday,
    phaseLabel,
    phaseDescription,
    periodLength,
    cycleLength,
  };
}

function buildCalendar(results, baseDate) {
  if (!results || !results.lastPeriod) return null;

  const { lastPeriod, cycleLength, periodLength } = results;
  const today = new Date();
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const firstWeekday = firstDayOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const msPerDay = 1000 * 60 * 60 * 24;

  const days = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const labels = [];

    const diffMs = stripTime(date) - stripTime(lastPeriod);
    const diffDays = Math.floor(diffMs / msPerDay);

    if (diffDays >= 0) {
      const dayInCycle = diffDays % cycleLength;
      const ovulationIndex = cycleLength - 14;

      if (dayInCycle < periodLength) labels.push("period");
      if (dayInCycle >= ovulationIndex - 3 && dayInCycle <= ovulationIndex + 1)
        labels.push("fertile");
      if (dayInCycle === ovulationIndex) labels.push("ovulation");
    }

    if (isSameDay(date, today)) labels.push("today");

    days.push({ date, labels });
  }

  return {
    year,
    month,
    firstWeekday,
    days,
  };
}

export default function App() {
  const [lastPeriod, setLastPeriod] = useState("");
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);
  const [pregnancyMode, setPregnancyMode] = useState(false);
  const [calendarMonthOffset, setCalendarMonthOffset] = useState(0);

  // Local storage load
  useEffect(() => {
    const saved = localStorage.getItem("cycle-tracker");
    if (saved) {
      const data = JSON.parse(saved);
      if (data.lastPeriod) setLastPeriod(data.lastPeriod);
      if (data.cycleLength) setCycleLength(data.cycleLength);
      if (data.periodLength) setPeriodLength(data.periodLength);
      if (typeof data.pregnancyMode === "boolean")
        setPregnancyMode(data.pregnancyMode);
    }
  }, []);

  // Local storage save
  useEffect(() => {
    const data = {
      lastPeriod,
      cycleLength,
      periodLength,
      pregnancyMode,
    };
    localStorage.setItem("cycle-tracker", JSON.stringify(data));
  }, [lastPeriod, cycleLength, periodLength, pregnancyMode]);

  const results = useMemo(
    () =>
      calculateCycle(lastPeriod, Number(cycleLength), Number(periodLength)),
    [lastPeriod, cycleLength, periodLength]
  );

  const hasData = Boolean(lastPeriod);

  const baseCalendarDate = useMemo(() => {
    const today = new Date();
    return new Date(
      today.getFullYear(),
      today.getMonth() + calendarMonthOffset,
      1
    );
  }, [calendarMonthOffset]);

  const calendar = useMemo(
    () => buildCalendar(results, baseCalendarDate),
    [results, baseCalendarDate]
  );

  const monthLabel = calendar
    ? baseCalendarDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "";

  const weekdayLabels = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div className="app-root">
      <div className="app-card">
        <header className="app-header">
          <div className="app-header-main">
            <div className="app-brand">
              <div className="app-logo-wrap">
                <img
                  src="/logo.png"
                  alt="Cycle Tracker logo"
                  className="app-logo"
                />
              </div>
              <div>
                <h1>Cycle &amp; Pregnancy Tracker</h1>
                <p className="tagline">Track your cycle on Base</p>
              </div>
            </div>
            <span className="pill">Mini app</span>
          </div>

          <p className="subtitle">
            A simple, pastel dashboard for cycle phases, calendar, ovulation and
            pregnancy estimates. Not medical advice.
          </p>
        </header>

        {/* BASICS */}
        <section className="section">
          <h2>Basics</h2>
          <div className="grid">
            <div className="field">
              <label>Last period start date</label>
              <input
                type="date"
                value={lastPeriod}
                onChange={(e) => setLastPeriod(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Average cycle length (days)</label>
              <input
                type="number"
                min="20"
                max="40"
                value={cycleLength}
                onChange={(e) => setCycleLength(e.target.value || 28)}
              />
              <small>
                Many people are around 28 days, but your body is unique.
              </small>
            </div>

            <div className="field">
              <label>Period length (days)</label>
              <input
                type="number"
                min="2"
                max="10"
                value={periodLength}
                onChange={(e) => setPeriodLength(e.target.value || 5)}
              />
            </div>
          </div>

          <label className="toggle">
            <input
              type="checkbox"
              checked={pregnancyMode}
              onChange={(e) => setPregnancyMode(e.target.checked)}
            />
            <span>Show pregnancy mode (estimate)</span>
          </label>
        </section>

        {/* TODAY IN CYCLE */}
        <section className="section">
          <h2>Today in your cycle</h2>
          {!hasData ? (
            <p className="hint">
              Add your last period date to see where you are in this cycle.
            </p>
          ) : (
            <div className="summary-grid">
              <div className="summary-card today">
                <h3>
                  Day{" "}
                  {results.cycleDayToday != null ? results.cycleDayToday : "–"}
                </h3>
                <p className="main">
                  {results.phaseLabel || "Cycle phase unavailable"}
                </p>
                <p className="sub">{results.phaseDescription}</p>
              </div>
            </div>
          )}
        </section>

        {/* CALENDAR */}
        <section className="section">
          <h2>Calendar</h2>
          {!calendar ? (
            <p className="hint">
              Once you add your data, you&apos;ll see cycle highlights for each
              month here.
            </p>
          ) : (
            <div className="calendar">
              <div className="calendar-header">
                <button
                  type="button"
                  className="calendar-nav-button"
                  onClick={() =>
                    setCalendarMonthOffset((prev) => prev - 1)
                  }
                >
                  ‹
                </button>
                <span className="calendar-month-label">{monthLabel}</span>
                <button
                  type="button"
                  className="calendar-nav-button"
                  onClick={() =>
                    setCalendarMonthOffset((prev) => prev + 1)
                  }
                >
                  ›
                </button>
              </div>

              <div className="calendar-weekdays">
                {weekdayLabels.map((w) => (
                  <div key={w} className="weekday">
                    {w}
                  </div>
                ))}
              </div>
              <div className="calendar-days">
                {Array.from({ length: calendar.firstWeekday }).map((_, i) => (
                  <div key={`empty-${i}`} className="day-cell empty" />
                ))}
                {calendar.days.map((dayObj, idx) => {
                  const dayNumber = dayObj.date.getDate();
                  const classes = ["day-cell"];
                  if (dayObj.labels.includes("period")) classes.push("period");
                  if (dayObj.labels.includes("fertile")) classes.push("fertile");
                  if (dayObj.labels.includes("ovulation"))
                    classes.push("ovulation");
                  if (dayObj.labels.includes("today")) classes.push("today");

                  return (
                    <div key={idx} className={classes.join(" ")}>
                      {dayNumber}
                    </div>
                  );
                })}
              </div>

              <div className="calendar-legend">
                <span className="legend-item">
                  <span className="legend-dot period" /> Period
                </span>
                <span className="legend-item">
                  <span className="legend-dot fertile" /> Fertile window
                </span>
                <span className="legend-item">
                  <span className="legend-dot ovulation" /> Ovulation
                </span>
                <span className="legend-item">
                  <span className="legend-dot today" /> Today
                </span>
              </div>
            </div>
          )}
        </section>

        {/* PREDICTION */}
        <section className="section">
          <h2>Cycle prediction</h2>
          {!hasData ? (
            <p className="hint">
              Once you add your data, you&apos;ll see your next period and
              ovulation window here.
            </p>
          ) : (
            <div className="summary-grid">
              <div className="summary-card period">
                <h3>Next period</h3>
                <p className="main">{formatDate(results.nextPeriodStart)}</p>
                <p className="sub">
                  Estimated window: {formatDate(results.nextPeriodStart)} –{" "}
                  {formatDate(results.nextPeriodEnd)}
                </p>
              </div>

              <div className="summary-card ovulation">
                <h3>Ovulation day</h3>
                <p className="main">{formatDate(results.ovulationDay)}</p>
                <p className="sub">
                  Fertile window: {formatDate(results.fertileStart)} –{" "}
                  {formatDate(results.fertileEnd)}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* PREGNANCY */}
        {pregnancyMode && hasData && (
          <section className="section">
            <h2>Pregnancy estimate</h2>
            <div className="summary-grid">
              <div className="summary-card pregnancy">
                <h3>Estimated due date</h3>
                <p className="main">{formatDate(results.dueDate)}</p>
                {results.pregWeeks != null && (
                  <p className="sub">
                    Based on your last period, you are approximately{" "}
                    <strong>
                      {results.pregWeeks} weeks {results.pregExtraDays} days
                    </strong>{" "}
                    pregnant.
                  </p>
                )}
              </div>
            </div>
            <p className="disclaimer">
              This tool uses standard average-cycle assumptions and should not
              replace professional medical guidance.
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
