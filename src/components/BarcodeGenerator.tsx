import React, { useRef } from "react";
import { ICTAsset } from "../types";
import { Printer, Shield, CheckCircle } from "lucide-react";

interface BarcodeGeneratorProps {
  asset: ICTAsset;
}

export const BarcodeGenerator: React.FC<BarcodeGeneratorProps> = ({ asset }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printRef.current?.innerHTML;
    const originalContent = document.body.innerHTML;
    
    if (printContent) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Print Asset Tag - ${asset.id}</title>
              <style>
                body {
                  font-family: 'Courier New', monospace;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 100vh;
                  margin: 0;
                  background-color: white;
                }
                .tag {
                  border: 3px double black;
                  padding: 15px;
                  width: 320px;
                  text-align: center;
                  background: white;
                }
                .header {
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 8px;
                  font-weight: bold;
                  font-size: 14px;
                  margin-bottom: 8px;
                  border-bottom: 1px solid black;
                  padding-bottom: 4px;
                }
                .title {
                  font-size: 11px;
                  margin: 4px 0;
                  text-transform: uppercase;
                }
                .barcode {
                  display: flex;
                  justify-content: center;
                  align-items: flex-end;
                  height: 45px;
                  margin: 10px 0;
                  gap: 1px;
                }
                .bar {
                  background-color: black;
                  height: 100%;
                }
                .asset-id {
                  font-size: 16px;
                  font-weight: bold;
                  letter-spacing: 2px;
                  margin: 5px 0;
                }
                .footer {
                  font-size: 9px;
                  margin-top: 8px;
                  border-top: 1px dotted black;
                  padding-top: 4px;
                }
              </style>
            </head>
            <body>
              <div class="tag">
                <div class="header">
                  <span>URC ICT ASSET RECOGNITION</span>
                </div>
                <div class="title">${asset.name} - ${asset.manufacturer} ${asset.model}</div>
                <div class="barcode">
                  ${generateMockBarcodeBars()}
                </div>
                <div class="asset-id">${asset.id}</div>
                <div class="footer">
                  PROPERTY OF URC • DO NOT REMOVE<br>
                  SCAN TO LOG SUPPORT TICKET / REPORT ISSUE
                </div>
              </div>
              <script>
                window.onload = function() {
                  window.print();
                  setTimeout(function() { window.close(); }, 500);
                }
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  // Generate deterministic barcode bars based on Asset ID
  const getBarcodeBars = () => {
    const bars: number[] = [];
    const seed = asset.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    // Produce 40 bars of alternating 1px, 2px, 3px, 4px widths
    for (let i = 0; i < 36; i++) {
      const width = ((seed + i * 7) % 4) + 1; // Widths between 1 and 4
      bars.push(width);
    }
    return bars;
  };

  const generateMockBarcodeBars = () => {
    const bars = getBarcodeBars();
    return bars
      .map((width, idx) => {
        // Alternating black and white bars (simulated by spacing)
        if (idx % 2 === 0) {
          return `<div class="bar" style="width: ${width}px; height: 100%;"></div>`;
        } else {
          return `<div style="width: ${width}px; height: 100%;"></div>`;
        }
      })
      .join("");
  };

  return (
    <div className="flex flex-col items-center bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="w-full flex justify-between items-center mb-4">
        <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-emerald-600" />
          Physical Asset Tag
        </h4>
        <button
          onClick={handlePrint}
          className="flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 px-2.5 py-1.5 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
          id={`print-tag-btn-${asset.id}`}
        >
          <Printer className="w-3.5 h-3.5" />
          Print Tag
        </button>
      </div>

      {/* Tag Preview Box */}
      <div
        ref={printRef}
        className="w-full max-w-[340px] bg-white border-2 border-dashed border-gray-300 rounded-lg p-5 flex flex-col items-center shadow-inner"
      >
        <div className="w-full border-2 border-black p-4 bg-white select-none text-center">
          {/* Tag Header */}
          <div className="flex items-center justify-center gap-1.5 border-b border-black pb-1 mb-2 font-mono text-xs font-black text-black">
            <span className="w-2.5 h-2.5 bg-black rounded-sm flex items-center justify-center text-[7px] text-white font-bold">U</span>
            URC ICT ASSET RECOGNITION
          </div>

          {/* Asset Description */}
          <div className="font-mono text-[10px] text-black font-semibold uppercase tracking-wider truncate max-w-full">
            {asset.name}
          </div>
          <div className="font-mono text-[9px] text-gray-700 uppercase truncate max-w-full mb-2">
            {asset.manufacturer} {asset.model}
          </div>

          {/* Barcode Lines */}
          <div className="flex justify-center items-end h-10 my-3 gap-[1.5px]">
            {getBarcodeBars().map((width, idx) => (
              <div
                key={idx}
                className={`h-full ${idx % 2 === 0 ? "bg-black" : "bg-transparent"}`}
                style={{ width: `${width * 1.5}px` }}
              />
            ))}
          </div>

          {/* Asset Tag ID */}
          <div className="font-mono text-base font-bold tracking-[3px] text-black border border-black/20 py-0.5 rounded bg-gray-50">
            {asset.id}
          </div>

          {/* Tag Footer */}
          <div className="mt-2.5 pt-2 border-t border-dotted border-black font-mono text-[8px] leading-relaxed text-black/80">
            <div>PROPERTY OF URC • DO NOT REMOVE</div>
            <div className="text-gray-500 font-bold mt-0.5">SCAN TO REPORT FAULT / LOG TICKET</div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-1.5 text-xs text-gray-500">
        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
        Barcode generated deterministically from unique asset ID
      </div>
    </div>
  );
};
