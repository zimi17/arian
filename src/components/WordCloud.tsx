import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { WordCloudItem } from '../types';

interface WordCloudProps {
  words: WordCloudItem[];
  width?: number;
  height?: number;
  maxWords?: number; // Maximum number of words to display
}

export const WordCloud: React.FC<WordCloudProps> = ({ 
  words, 
  width = 600, 
  height = 400,
  maxWords = 50
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || words.length === 0) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current);
    const g = svg.append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    // Prepare data with sizes
    const maxValue = Math.max(...words.map(w => w.value));
    const minValue = Math.min(...words.map(w => w.value));
    
    const sizeScale = d3.scaleLinear()
      .domain([minValue, maxValue])
      .range([12, 48]);

    // Simple spiral layout for words
    const data = words.slice(0, maxWords).map((word, i) => {
      const angle = i * 0.5;
      const radius = 10 + i * 5;
      return {
        ...word,
        x: radius * Math.cos(angle),
        y: radius * Math.sin(angle),
        size: sizeScale(word.value)
      };
    });

    // Create color scale
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Draw words
    g.selectAll('text')
      .data(data)
      .enter()
      .append('text')
      .text(d => d.text)
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .attr('font-size', d => `${d.size}px`)
      .attr('fill', (_d, i) => colorScale(String(i % 10)))
      .attr('text-anchor', 'middle')
      .attr('font-family', 'sans-serif')
      .style('cursor', 'pointer')
      .attr('opacity', 0)
      .transition()
      .duration(500)
      .delay((_d, i) => i * 20)
      .attr('opacity', 1);

  }, [words, width, height, maxWords]);

  if (words.length === 0) {
    return (
      <div 
        style={{ 
          width, 
          height, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: '#f5f5f5',
          borderRadius: '8px'
        }}
      >
        <p style={{ color: '#666' }}>No data to display</p>
      </div>
    );
  }

  return (
    <svg 
      ref={svgRef} 
      width={width} 
      height={height}
      style={{ 
        background: '#f9f9f9', 
        borderRadius: '8px',
        border: '1px solid #e0e0e0'
      }}
    />
  );
};
