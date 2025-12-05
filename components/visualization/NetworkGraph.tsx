import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Code, Category } from '../types';

interface NetworkGraphProps {
  codes: Code[];
  categories: Category[];
  width?: number;
  height?: number;
  onSelectNode?: (type: 'code' | 'category', id: string) => void;
}

// Interface for D3 node data
interface NodeData {
  id: string;
  name: string;
  type: 'code' | 'category';
  value: number; // frequency for codes, number of codes for categories
  group: number;
}

// Interface for D3 link data
interface LinkData {
  source: string;
  target: string;
  value: number; // connection strength
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({ 
  codes, 
  categories, 
  width = 800, 
  height = 600, 
  onSelectNode 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous visualization
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current);
    
    // Prepare nodes - each code and category becomes a node
    const nodes: NodeData[] = [
      ...codes.map(code => ({
        id: code.id,
        name: code.name,
        type: 'code' as const,
        value: code.frequency,
        group: 1
      })),
      ...categories.map(category => ({
        id: category.id,
        name: category.name,
        type: 'category' as const,
        value: category.codeIds.length, // Number of codes in the category
        group: 2
      }))
    ];

    // Prepare links - connection between codes and their categories
    const links: LinkData[] = [];
    
    categories.forEach(category => {
      category.codeIds.forEach(codeId => {
        const codeExists = codes.some(code => code.id === codeId);
        if (codeExists) {
          links.push({
            source: codeId,
            target: category.id,
            value: 1 // Fixed connection strength for now
          });
        }
      });
    });

    // Create simulation
    const simulation = d3.forceSimulation<NodeData>()
      .force("link", d3.forceLink<NodeData, LinkData>(links).id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(30));

    // Create SVG container
    const container = svg.append("g");

    // Add zoom functionality
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 8])
      .on("zoom", (event) => {
        container.attr("transform", event.transform);
      });

    svg.call(zoom).on("dblclick.zoom", null); // Disable double click zoom

    // Add links
    const link = container.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", "#94a3b8")
      .attr("stroke-width", d => d.value * 2)
      .attr("opacity", 0.6);

    // Add nodes
    const node = container.append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "node-group")
      .call(
        d3.drag()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      )
      .on("click", (event, d) => {
        if (onSelectNode) {
          onSelectNode(d.type, d.id);
        }
      });

    // Add circles to nodes
    node.append("circle")
      .attr("r", d => {
        // Scale node size based on value
        const baseSize = d.type === 'code' ? 8 : 12;
        const scale = Math.min(d.value, 10) / 2; // Cap at 5x size
        return baseSize + scale;
      })
      .attr("fill", d => d.type === 'code' ? '#3b82f6' : '#8b5cf6') // Blue for codes, purple for categories
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .attr("cursor", "pointer")
      .attr("class", "transition-all hover:opacity-80 shadow-md");

    // Add labels to nodes
    node.append("text")
      .attr("dx", 12)
      .attr("dy", ".35em")
      .text(d => d.name.length > 15 ? `${d.name.substring(0, 12)}...` : d.name)
      .attr("font-size", "10px")
      .attr("fill", "#333")
      .attr("class", "pointer-events-none");

    // Update positions on each tick
    simulation.nodes(nodes).on("tick", () => {
      link
        .attr("x1", d => (d.source as any).x || 0)
        .attr("y1", d => (d.source as any).y || 0)
        .attr("x2", d => (d.target as any).x || 0)
        .attr("y2", d => (d.target as any).y || 0);

      node
        .attr("transform", d => `translate(${d.x},${d.y})`);
    });

    // Add simulation forces
    simulation.force("link", d3.forceLink<NodeData, LinkData>(links).id(d => d.id).distance(100).strength(1));

    // Cleanup function
    return () => {
      simulation.stop();
    };
  }, [codes, categories, width, height, onSelectNode]);

  return (
    <div className="network-graph-container w-full h-full">
      <svg 
        ref={svgRef} 
        width={width} 
        height={height} 
        className="w-full h-full bg-slate-50 rounded border border-slate-200"
      />
    </div>
  );
};