import React, { useState } from 'react';

const QuarterSelector = ({ onChange }) => {
  const now = new Date();
  const [quarter, setQuarter] = useState(Math.floor(now.getMonth() / 3) + 1);
  const [year, setYear] = useState(now.getFullYear());

  // Generate 10 years range (current year - 10 → current year)
  const years = Array.from({ length: 11 }, (_, i) => now.getFullYear() - 10 + i);

  const handleChange = (newQuarter, newYear) => {
    setQuarter(newQuarter);
    setYear(newYear);
    if (onChange) onChange({ quarter: newQuarter, year: newYear });
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        flexWrap: 'wrap', // responsive
      }}
    >
      {/* Quarter Selector */}
      <div>
        <label>Quarter: </label>
        <select
          style={{height:24,  margin:2}}
          value={quarter}
          onChange={(e) => handleChange(Number(e.target.value), year)}
        >
          <option value={1}>Q1 (Jan–Mar)</option>
          <option value={2}>Q2 (Apr–Jun)</option>
          <option value={3}>Q3 (Jul–Sep)</option>
          <option value={4}>Q4 (Oct–Dec)</option>
        </select>
      </div>

      {/* Year Selector */}
      <div>
        <label>Year: </label>
        <select
          style={{height:24,  margin:2}}
          value={year}
          onChange={(e) => handleChange(quarter, Number(e.target.value))}
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default QuarterSelector;
