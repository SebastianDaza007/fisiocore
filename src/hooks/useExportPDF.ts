import { useState } from "react";
import jsPDF from "jspdf";
import { domToPng } from "modern-screenshot";

interface ExportPDFOptions {
  filename?: string;
  orientation?: "portrait" | "landscape";
  title?: string;
  subtitle?: string;
  includeDate?: boolean;
}

export const useExportPDF = () => {
  const [isExporting, setIsExporting] = useState(false);

  const exportToPDF = async (
    elementId: string,
    options: ExportPDFOptions = {}
  ) => {
    const {
      filename = "reporte-fisiocore",
      orientation = "landscape",
      title = "Reporte FisioCore",
      subtitle = "",
      includeDate = true,
    } = options;

    setIsExporting(true);

    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Elemento con ID "${elementId}" no encontrado`);
      }

      // Scroll to top para capturar desde el inicio
      element.scrollTop = 0;

      // Crear imagen PNG del contenido usando modern-screenshot
      const dataUrl = await domToPng(element, {
        scale: 2, // Alta calidad
        backgroundColor: "#ffffff",
        style: {
          // Forzar estilos seguros para la exportación
          transform: "scale(1)",
          transformOrigin: "top left",
        },
      });

      // Crear PDF
      const pdf = new jsPDF({
        orientation: orientation,
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Cargar la imagen para obtener dimensiones
      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      // Calcular dimensiones manteniendo aspect ratio
      const imgWidth = orientation === "landscape" ? 297 : 210;
      const imgHeight = orientation === "landscape" ? 210 : 297;
      const ratio = img.width / img.height;

      let finalWidth = imgWidth - 20; // Márgenes
      let finalHeight = finalWidth / ratio;

      // Ajustar si es muy alto
      if (finalHeight > imgHeight - 60) {
        finalHeight = imgHeight - 60;
        finalWidth = finalHeight * ratio;
      }

      // Agregar logo (teal)
      const logo = new Image();
      logo.src = "/isologo-fc-teal.png";
      await new Promise((resolve) => {
        logo.onload = resolve;
      });

      // Logo en la esquina superior izquierda (30x30mm)
      pdf.addImage(logo, "PNG", 10, 10, 30, 30);

      // Título principal
      pdf.setFontSize(24);
      pdf.setTextColor(15, 118, 110); // Teal-700
      pdf.setFont("helvetica", "bold");
      pdf.text(title, pageWidth / 2, 25, { align: "center" });

      // Subtítulo
      if (subtitle) {
        pdf.setFontSize(14);
        pdf.setTextColor(75, 85, 99); // Gray-600
        pdf.setFont("helvetica", "normal");
        pdf.text(subtitle, pageWidth / 2, 33, { align: "center" });
      }

      // Fecha en la esquina superior derecha
      if (includeDate) {
        const currentDate = new Date().toLocaleDateString("es-AR", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        pdf.setFontSize(9);
        pdf.setTextColor(107, 114, 128); // Gray-500
        pdf.setFont("helvetica", "italic");
        pdf.text(currentDate, pageWidth - 10, 15, { align: "right" });
      }

      // Línea separadora
      pdf.setDrawColor(15, 118, 110); // Teal-700
      pdf.setLineWidth(0.5);
      pdf.line(10, 45, pageWidth - 10, 45);

      // Agregar contenido capturado
      const xOffset = (pageWidth - finalWidth) / 2;
      pdf.addImage(dataUrl, "PNG", xOffset, 50, finalWidth, finalHeight);

      // Footer con branding
      pdf.setFontSize(8);
      pdf.setTextColor(156, 163, 175); // Gray-400
      pdf.setFont("helvetica", "italic");
      pdf.text(
        "FisioCore - Sistema de Gestión de Centro de Rehabilitación Física",
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      );

      // Línea footer
      pdf.setDrawColor(229, 231, 235); // Gray-200
      pdf.setLineWidth(0.3);
      pdf.line(10, pageHeight - 15, pageWidth - 10, pageHeight - 15);

      // Generar nombre del archivo con fecha
      const dateStr = new Date()
        .toISOString()
        .split("T")[0]
        .replace(/-/g, "");
      const finalFilename = `${filename}-${dateStr}.pdf`;

      // Descargar PDF
      pdf.save(finalFilename);

      return true;
    } catch (error) {
      console.error("Error al exportar PDF:", error);
      return false;
    } finally {
      setIsExporting(false);
    }
  };

  return { exportToPDF, isExporting };
};
