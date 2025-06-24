import * as d3Shape from 'd3-shape';

function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// Единая функция для нормализации timestamp
function normalizeTimestamp(timestamp) {
  if (typeof timestamp === 'number') {
    // Если число больше 1000000000000, то это миллисекунды - конвертируем в секунды
    return timestamp > 1000000000000 ? Math.floor(timestamp / 1000) : timestamp;
  }
  
  if (typeof timestamp === 'string') {
    // Если это строка с числом (Unix timestamp)
    if (/^\d+$/.test(timestamp)) {
      const num = parseInt(timestamp, 10);
      return num > 1000000000000 ? Math.floor(num / 1000) : num;
    }
    
    // Если это дата в формате DD/MM/YYYY
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(timestamp)) {
      const [day, month, year] = timestamp.split('/');
      const date = new Date(year, month - 1, day);
      return Math.floor(date.getTime() / 1000);
    }
    
    // Попытка парсинга как обычной даты
    const date = new Date(timestamp);
    if (!isNaN(date.getTime())) {
      return Math.floor(date.getTime() / 1000);
    }
  }
  
  return null;
}

// Функция для агрегации недельных данных
function aggregateWeek(weekData) {
  if (!weekData || weekData.length === 0) return null;
  
  const sortedData = weekData.sort((a, b) => a.timestamp - b.timestamp);
  
  return {
    timestamp: sortedData[0].timestamp,
    open: sortedData[0].open,
    close: sortedData[sortedData.length - 1].close,
    high: Math.max(...sortedData.map(d => d.high)),
    low: Math.min(...sortedData.map(d => d.low)),
    volume: sortedData.reduce((sum, d) => sum + (d.volume || 0), 0)
  };
}

export function aggregateToWeekly(data) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    console.warn('aggregateToWeekly: Invalid input data');
    return [];
  }

  // Сначала нормализуем все timestamp'ы
  const normalizedData = data.map(item => {
    const normalizedTimestamp = normalizeTimestamp(item.timestamp);
    if (normalizedTimestamp === null) {
      console.warn('aggregateToWeekly: Could not parse timestamp', item.timestamp);
      return null;
    }
    return {
      ...item,
      timestamp: normalizedTimestamp
    };
  }).filter(Boolean);

  if (normalizedData.length === 0) {
    return [];
  }

  // Сортируем по timestamp
  normalizedData.sort((a, b) => a.timestamp - b.timestamp);

  const result = [];
  let week = [];
  let lastWeekNumber = null;

  for (const item of normalizedData) {
    const date = new Date(item.timestamp * 1000);
    const weekNumber = getWeekNumber(date);
    
    if (weekNumber !== lastWeekNumber && week.length > 0) {
      const aggregated = aggregateWeek(week);
      if (aggregated) {
        result.push(aggregated);
      }
      week = [];
    }
    
    week.push(item);
    lastWeekNumber = weekNumber;
  }

  // Обрабатываем последнюю неделю
  if (week.length > 0) {
    const aggregated = aggregateWeek(week);
    if (aggregated) {
      result.push(aggregated);
    }
  }

  console.log('Weekly aggregation result:', result.length, 'weeks from', normalizedData.length, 'daily records');
  return result;
}

export function generatePath(
  values: [number, number][],
  scaleX: (ts: number) => number,
  scaleY: (val: number) => number,
  height: number,
  padding: number
): string | null {
  const lineGen = d3Shape.line<[number, number]>()
    .x(([ts]) => scaleX(ts))
    .y(([, val]) => height - padding - scaleY(val))
    .curve(d3Shape.curveNatural);
  return lineGen(values);
}

export function getVisibleDataRange(
  currentData,
  visibleSeries,
  scale,
  translateX,
  width,
  padding,
  minX,
  maxX
) {
  if (!currentData || currentData.length === 0) {
    return { minY: 0, maxY: 100 };
  }

  let minY = Infinity;
  let maxY = -Infinity;

  currentData.forEach(item => {
    if (visibleSeries.Open && item.open != null && !isNaN(item.open)) {
      minY = Math.min(minY, item.open);
      maxY = Math.max(maxY, item.open);
    }
    if (visibleSeries.High && item.high != null && !isNaN(item.high)) {
      minY = Math.min(minY, item.high);
      maxY = Math.max(maxY, item.high);
    }
    if (visibleSeries.Low && item.low != null && !isNaN(item.low)) {
      minY = Math.min(minY, item.low);
      maxY = Math.max(maxY, item.low);
    }
    if (visibleSeries.Close && item.close != null && !isNaN(item.close)) {
      minY = Math.min(minY, item.close);
      maxY = Math.max(maxY, item.close);
    }
  });

  // Если нет видимых серий или данных
  if (minY === Infinity || maxY === -Infinity) {
    return { minY: 0, maxY: 100 };
  }

  // Добавляем небольшой отступ для лучшего отображения
  const paddingY = (maxY - minY) * 0.1;
  const result = {
    minY: minY - paddingY,
    maxY: maxY + paddingY
  };

  console.log('Visible data range:', result);
  return result;
}