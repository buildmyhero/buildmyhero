import { useState } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';
import { CharacterData } from '@/types/character';

interface Character {
  id: string;
  character_name: string;
  character_class: string;
  level: number;
  race: string;
  ruleset: string;
  character_data: CharacterData;
  portrait_url: string | null;
}

export function usePdfGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePdf = async (character: Character): Promise<void> => {
    setIsGenerating(true);
    
    try {
      // Find the character sheet element
      const element = document.getElementById('character-sheet');
      if (!element) {
        throw new Error('Character sheet element not found');
      }

      // Create a clone for PDF generation with print-friendly styles
      const clone = element.cloneNode(true) as HTMLElement;
      clone.style.width = '800px';
      clone.style.padding = '40px';
      clone.style.background = 'white';
      clone.style.color = 'black';
      
      // Temporarily add to document
      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      clone.style.top = '0';
      document.body.appendChild(clone);

      // Apply print-friendly styles to the clone
      const allElements = clone.querySelectorAll('*');
      allElements.forEach((el) => {
        const htmlEl = el as HTMLElement;
        // Reset backgrounds to white or very light
        const computedStyle = window.getComputedStyle(htmlEl);
        if (computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)' && computedStyle.backgroundColor !== 'transparent') {
          htmlEl.style.backgroundColor = '#f5f5f5';
        }
        // Make text dark
        htmlEl.style.color = '#1a1a1a';
      });

      // Generate canvas from the clone
      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      // Remove the clone
      document.body.removeChild(clone);

      // Create PDF
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        0,
        position,
        imgWidth,
        imgHeight,
        undefined,
        'FAST'
      );
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(
          canvas.toDataURL('image/png'),
          'PNG',
          0,
          position,
          imgWidth,
          imgHeight,
          undefined,
          'FAST'
        );
        heightLeft -= pageHeight;
      }

      // Download the PDF
      const fileName = `${character.character_name.replace(/\s+/g, '_')}_Character_Sheet.pdf`;
      pdf.save(fileName);
      
      toast.success('Character sheet PDF downloaded!');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    generatePdf,
  };
}
