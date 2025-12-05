import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import cloud from 'd3-cloud';

interface WordCloudProps {
  words: { text: string; value: number }[];
  width?: number;
  height?: number;
  maxWords?: number;
}

export const WordCloudDisplay: React.FC<WordCloudProps> = ({ 
  words, 
  width = 600, 
  height = 300, 
  maxWords = 50 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || words.length === 0) return;

    // Use container width if not explicit, but ensure we have dimensions
    const finalWidth = width;
    const finalHeight = height;

    const sortedWords = [...words]
      .sort((a, b) => b.value - a.value)
      .slice(0, maxWords);

    if (sortedWords.length === 0) return;

    const maxVal = sortedWords[0].value;
    const minVal = sortedWords[sortedWords.length - 1].value;
    
    // Scale for font size
    const fontSizeScale = d3.scaleLinear()
      .domain([minVal, maxVal])
      .range([12, 40]); // Adjusted range for better fit in smaller boxes

    const colorScale = d3.scaleOrdinal(d3.schemeTableau10);

    const layout = cloud()
      .size([finalWidth, finalHeight])
      .words(sortedWords.map(d => ({ text: d.text, size: fontSizeScale(d.value), value: d.value })))
      .padding(3)
      .rotate(() => (Math.random() > 0.5 ? 0 : 90))
      .font("Segoe UI")
      .fontSize((d: any) => d.size)
      .on("end", draw);

    layout.start();

    function draw(words: any[]) {
      if (!svgRef.current) return;
      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();

      svg.attr("width", finalWidth)
         .attr("height", finalHeight)
         .append("g")
         .attr("transform", `translate(${finalWidth / 2},${finalHeight / 2})`)
         .selectAll("text")
         .data(words)
         .enter().append("text")
         .style("font-size", (d: any) => `${d.size}px`)
         .style("font-family", "Segoe UI, sans-serif")
         .style("font-weight", "600")
         .style("fill", (_: any, i: number) => colorScale(i.toString()))
         .attr("text-anchor", "middle")
         .attr("transform", (d: any) => `translate(${d.x},${d.y})rotate(${d.rotate})`)
         .text((d: any) => d.text);
    }
  }, [words, width, height, maxWords]);

  return (
    <div ref={containerRef} className="flex justify-center items-center w-full h-full overflow-hidden">
      <svg ref={svgRef}></svg>
    </div>
  );
};