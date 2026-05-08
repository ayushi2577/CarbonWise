import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

/**
 * D3BreakevenChart — Upfront Carbon Cost vs Long-Term Savings
 *
 * Shows cumulative lifecycle CO₂ over km driven.
 * The "carbon debt" (manufacturing + battery disposal) is paid upfront,
 * then the fuel/energy line rises. Where lines cross = breakeven point.
 *
 * This is the mandatory "Upfront Carbon Cost vs Long-Term Savings" chart
 * required by the problem statement (D3.js).
 */
export default function D3BreakevenChart({ cars, mileage, years }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!cars || cars.length === 0 || !svgRef.current) return;

    const el = svgRef.current;
    d3.select(el).selectAll('*').remove();

    const totalKm  = mileage * 365 * years;
    const POINTS   = 120;
    const step     = totalKm / POINTS;

    // Build series: at each km point, cumulative CO₂ = mfg + battDisp + (fuel_rate × km)
    const series = cars.map(car => {
      const fuelRate = car.fuel / totalKm; // t CO₂ per km
      const upfront  = car.mfg + car.battDisp;
      const data = Array.from({ length: POINTS + 1 }, (_, i) => {
        const km = i * step;
        return { km, co2: upfront + fuelRate * km };
      });
      return { car, data, upfront };
    });

    // Dimensions
    const W = el.clientWidth || 560;
    const H = 320;
    const margin = { top: 24, right: 32, bottom: 48, left: 52 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;

    const svg = d3.select(el)
      .attr('width', W)
      .attr('height', H);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xMax = totalKm;
    const yMax = d3.max(series, s => d3.max(s.data, d => d.co2));

    const x = d3.scaleLinear().domain([0, xMax]).range([0, w]);
    const y = d3.scaleLinear().domain([0, yMax * 1.05]).range([h, 0]).nice();

    // Palette
    const palette = ['#4A7C59', '#C44B2B', '#D4860A', '#5B8DD9', '#9B59B6'];
    const colorOf = (i, type) => {
      if (type === 'ev')     return '#4A7C59';
      if (type === 'hybrid') return '#D4860A';
      if (type === 'ice')    return '#C44B2B';
      return palette[i % palette.length];
    };

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(y).ticks(5).tickSize(-w).tickFormat(''))
      .selectAll('line')
      .style('stroke', 'rgba(0,0,0,0.06)')
      .style('stroke-dasharray', '3,3');
    g.select('.grid .domain').remove();

    // Upfront cost annotation band (shaded region showing carbon debt)
    const maxUpfront = d3.max(series, s => s.upfront);
    g.append('rect')
      .attr('x', 0).attr('y', y(maxUpfront))
      .attr('width', w).attr('height', h - y(maxUpfront))
      .attr('fill', 'rgba(196,75,43,0.04)');

    g.append('line')
      .attr('x1', 0).attr('x2', w)
      .attr('y1', y(maxUpfront)).attr('y2', y(maxUpfront))
      .style('stroke', 'rgba(196,75,43,0.25)')
      .style('stroke-dasharray', '4,4')
      .style('stroke-width', 1);

    g.append('text')
      .attr('x', 6).attr('y', y(maxUpfront) - 5)
      .style('font-family', 'Space Mono, monospace')
      .style('font-size', '9px')
      .style('fill', 'rgba(196,75,43,0.6)')
      .style('letter-spacing', '0.08em')
      .text('▲ MFG + BATTERY CARBON DEBT');

    // Line generator
    const line = d3.line()
      .x(d => x(d.km))
      .y(d => y(d.co2))
      .curve(d3.curveCatmullRom.alpha(0.5));

    // Draw lines
    series.forEach((s, i) => {
      const color = colorOf(i, s.car.type);

      // Shadow for depth
      g.append('path')
        .datum(s.data)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 4)
        .attr('stroke-opacity', 0.12)
        .attr('d', line);

      // Main line with animated draw
      const path = g.append('path')
        .datum(s.data)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 2.5)
        .attr('stroke-linecap', 'round')
        .attr('d', line);

      const totalLength = path.node().getTotalLength();
      path
        .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
        .attr('stroke-dashoffset', totalLength)
        .transition().duration(900).delay(i * 180).ease(d3.easeCubicOut)
        .attr('stroke-dashoffset', 0);

      // End label
      const last = s.data[s.data.length - 1];
      g.append('circle')
        .attr('cx', x(last.km)).attr('cy', y(last.co2))
        .attr('r', 4).attr('fill', color).attr('stroke', '#fff').attr('stroke-width', 2);

      g.append('text')
        .attr('x', x(last.km) - 4)
        .attr('y', y(last.co2) - 10)
        .style('font-family', 'Space Mono, monospace')
        .style('font-size', '9px')
        .style('font-weight', '700')
        .style('fill', color)
        .style('text-anchor', 'end')
        .text(`${s.car.name.split(' ').slice(-2).join(' ')} (${last.co2.toFixed(1)}t)`);
    });

    // Axes
    const kmFormatter = v => v >= 1000 ? `${(v/1000).toFixed(0)}k km` : `${v}`;
    const xAxis = d3.axisBottom(x).ticks(6).tickFormat(kmFormatter);
    const yAxis = d3.axisLeft(y).ticks(5).tickFormat(v => `${v}t`);

    g.append('g').attr('transform', `translate(0,${h})`).call(xAxis)
      .selectAll('text')
      .style('font-family', 'Space Mono, monospace')
      .style('font-size', '10px')
      .style('fill', 'var(--text-muted, #888)');

    g.append('g').call(yAxis)
      .selectAll('text')
      .style('font-family', 'Space Mono, monospace')
      .style('font-size', '10px')
      .style('fill', 'var(--text-muted, #888)');

    g.select('.domain').style('stroke', 'var(--border, #ddd)');

    // Hover tooltip
    const tooltip = d3.select(el.parentNode)
      .append('div')
      .style('position', 'absolute')
      .style('background', '#1A1F14')
      .style('color', '#F5F0E8')
      .style('padding', '10px 14px')
      .style('border-radius', '8px')
      .style('font-family', 'Space Mono, monospace')
      .style('font-size', '11px')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('z-index', 99)
      .style('line-height', '1.7');

    const bisect = d3.bisector(d => d.km).left;

    svg.append('rect')
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .attr('x', margin.left).attr('y', margin.top)
      .attr('width', w).attr('height', h)
      .on('mousemove', (event) => {
        const [mx] = d3.pointer(event, el);
        const kmVal = x.invert(mx - margin.left);
        const rows = series.map(s => {
          const idx = bisect(s.data, kmVal, 1);
          const d   = s.data[Math.min(idx, s.data.length - 1)];
          return `<span style="color:${colorOf(series.indexOf(s), s.car.type)}">${s.car.name.split(' ').slice(-2).join(' ')}</span>: ${d.co2.toFixed(1)}t`;
        }).join('<br/>');
        tooltip
          .html(`<div style="opacity:.5;font-size:9px;letter-spacing:.1em;margin-bottom:4px">${Math.round(kmVal).toLocaleString()} km</div>${rows}`)
          .style('opacity', 1)
          .style('left', `${event.offsetX + 14}px`)
          .style('top',  `${event.offsetY - 20}px`);
      })
      .on('mouseleave', () => tooltip.style('opacity', 0));

    return () => tooltip.remove();
  }, [cars, mileage, years]);

  return (
    <div style={{ position: 'relative' }}>
      <svg ref={svgRef} style={{ width: '100%', display: 'block' }} />
    </div>
  );
}
