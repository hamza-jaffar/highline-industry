"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Image as KonvaImage, Transformer } from 'react-konva';
import { Area } from './types';
import { Trash2 } from 'lucide-react';

interface AreaSelectorProps {
  imageUrl: string;
  areas: Area[];
  onUpdateAreas: (areas: Area[]) => void;
  selectedAreaId: string | null;
  onSelectArea: (id: string | null) => void;
}

const AreaSelector = ({ imageUrl, areas, onUpdateAreas, selectedAreaId, onSelectArea }: AreaSelectorProps) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [newArea, setNewArea] = useState<{ x: number, y: number, width: number, height: number } | null>(null);
  const stageRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  useEffect(() => {
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      setImage(img);
      const maxWidth = 500;
      const maxHeight = 500;
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (maxWidth / width) * height;
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = (maxHeight / height) * width;
        height = maxHeight;
      }
      setDimensions({ width, height });
    };
  }, [imageUrl]);

  useEffect(() => {
    if (selectedAreaId && trRef.current && stageRef.current) {
      const node = stageRef.current.findOne('#' + selectedAreaId);
      if (node) {
        trRef.current.nodes([node]);
        trRef.current.getLayer().batchDraw();
      }
    }
  }, [selectedAreaId]);

  const handleMouseDown = (e: any) => {
    const clickedOnEmpty = e.target === e.target.getStage() || e.target.className === 'Image';
    
    if (clickedOnEmpty) {
      onSelectArea(null);
      if (e.target.getStage()) {
        const { x, y } = e.target.getStage().getPointerPosition();
        setNewArea({ x, y, width: 0, height: 0 });
      }
      return;
    }

    if (e.target.className === 'Rect') {
      onSelectArea(e.target.id());
    }
  };

  const handleMouseMove = (e: any) => {
    if (!newArea) return;

    const { x, y } = e.target.getStage().getPointerPosition();
    setNewArea({
      ...newArea,
      width: x - newArea.x,
      height: y - newArea.y,
    });
  };

  const handleMouseUp = () => {
    if (!newArea) return;

    if (Math.abs(newArea.width) > 5 && Math.abs(newArea.height) > 5) {
      const x = newArea.width > 0 ? newArea.x : newArea.x + newArea.width;
      const y = newArea.height > 0 ? newArea.y : newArea.y + newArea.height;
      const width = Math.abs(newArea.width);
      const height = Math.abs(newArea.height);

      const areaId = Math.random().toString(36).substr(2, 9);
      const area: Area = {
        id: areaId,
        x: (x / dimensions.width) * 100,
        y: (y / dimensions.height) * 100,
        width: (width / dimensions.width) * 100,
        height: (height / dimensions.height) * 100,
        allowedType: "both",
        imagePrice: 0,
        textPrice: 0
      };

      onUpdateAreas([...areas, area]);
      onSelectArea(areaId);
    }

    setNewArea(null);
  };

  const handleAreaChange = (id: string, newAttrs: any) => {
    const updatedAreas = areas.map((area) => {
      if (area.id === id) {
        return {
          ...area,
          x: (newAttrs.x / dimensions.width) * 100,
          y: (newAttrs.y / dimensions.height) * 100,
          width: (newAttrs.width / dimensions.width) * 100,
          height: (newAttrs.height / dimensions.height) * 100,
        };
      }
      return area;
    });
    onUpdateAreas(updatedAreas);
  };

  const deleteArea = (id: string) => {
    onUpdateAreas(areas.filter(a => a.id !== id));
    onSelectArea(null);
  };

  if (!image) return null;

  return (
    <div className="relative">
      <Stage
        width={dimensions.width}
        height={dimensions.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        ref={stageRef}
        className="cursor-crosshair"
      >
        <Layer>
          <KonvaImage image={image} width={dimensions.width} height={dimensions.height} />
          {areas.map((area) => (
            <Rect
              key={area.id}
              id={area.id}
              x={(area.x / 100) * dimensions.width}
              y={(area.y / 100) * dimensions.height}
              width={(area.width / 100) * dimensions.width}
              height={(area.height / 100) * dimensions.height}
              fill={selectedAreaId === area.id ? "rgba(0, 112, 243, 0.2)" : "rgba(0, 0, 0, 0.2)"}
              stroke={selectedAreaId === area.id ? "#0070f3" : "#000"}
              strokeWidth={2}
              draggable
              onClick={() => onSelectArea(area.id)}
              onDragEnd={(e) => {
                handleAreaChange(area.id, {
                  x: e.target.x(),
                  y: e.target.y(),
                  width: (area.width / 100) * dimensions.width,
                  height: (area.height / 100) * dimensions.height,
                });
              }}
              onTransformEnd={(e) => {
                const node = e.target;
                const scaleX = node.scaleX();
                const scaleY = node.scaleY();
                node.scaleX(1);
                node.scaleY(1);
                handleAreaChange(area.id, {
                  x: node.x(),
                  y: node.y(),
                  width: Math.max(5, node.width() * scaleX),
                  height: Math.max(5, node.height() * scaleY),
                });
              }}
            />
          ))}
          {selectedAreaId && (
            <Transformer
              ref={trRef}
              boundBoxFunc={(oldBox, newBox) => {
                if (newBox.width < 5 || newBox.height < 5) {
                  return oldBox;
                }
                return newBox;
              }}
            />
          )}
          {newArea && (
            <Rect
              x={newArea.x}
              y={newArea.y}
              width={newArea.width}
              height={newArea.height}
              fill="rgba(0, 112, 243, 0.2)"
              stroke="#0070f3"
              strokeWidth={2}
            />
          )}
        </Layer>
      </Stage>
      {selectedAreaId && (
        <div className="absolute top-2 left-2 z-20">
            <button 
                onClick={() => deleteArea(selectedAreaId)}
                className="bg-red-500 text-white p-2 rounded-lg shadow-lg hover:bg-red-600 transition-all flex items-center gap-2 text-xs font-bold"
            >
                <Trash2 className="w-4 h-4" /> Delete Selected Area
            </button>
        </div>
      )}
    </div>
  );
};

export default AreaSelector;
