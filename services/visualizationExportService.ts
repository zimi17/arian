// visualizationExportService.ts
import html2canvas from 'html2canvas';

// Export a visualization element as PNG image
export const exportVisualizationAsImage = async (
  elementId: string, 
  filename: string = 'visualization.png'
): Promise<void> => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID '${elementId}' not found`);
    }

    // Use html2canvas to capture the visualization
    const canvas = await html2canvas(element, {
      scale: 2, // Higher resolution
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    // Convert to blob and download
    canvas.toBlob((blob) => {
      if (!blob) {
        throw new Error('Failed to create image blob');
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  } catch (error) {
    console.error('Error exporting visualization:', error);
    throw error;
  }
};

// Get image data URL for a visualization element
export const getVisualizationAsImageData = async (
  elementId: string
): Promise<string> => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID '${elementId}' not found`);
    }

    const canvas = await html2canvas(element, {
      scale: 2, // Higher resolution
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error capturing visualization:', error);
    throw error;
  }
};

// Export multiple visualizations as a combined report
export const exportVisualizationReport = async (
  elementIds: string[],
  title: string = 'Visualization Report',
  filename: string = 'visualization_report.html'
): Promise<void> => {
  try {
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; background: #fff; }
          .page-break { page-break-before: always; }
          .visualization { margin: 20px 0; page-break-inside: avoid; }
          .title { text-align: center; margin-bottom: 30px; }
        </style>
      </head>
      <body>
        <h1 class="title">${title}</h1>
    `;

    for (let i = 0; i < elementIds.length; i++) {
      const elementId = elementIds[i];
      const element = document.getElementById(elementId);
      
      if (element) {
        // For now, we'll include the HTML structure of the visualization
        // In a more complete implementation, we would capture images of each visualization
        htmlContent += `
          <div class="visualization">
            <h2>Visualization ${i + 1}</h2>
            <div id="viz-${elementId}">${element.innerHTML}</div>
          </div>
          ${i < elementIds.length - 1 ? '<div class="page-break"></div>' : ''}
        `;
      }
    }

    htmlContent += '</body></html>';

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting visualization report:', error);
    throw error;
  }
};