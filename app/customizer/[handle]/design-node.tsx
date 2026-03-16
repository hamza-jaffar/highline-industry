"use client";

import { useRef } from "react";
import { Image as KonvaImage, Text as KonvaText, Transformer } from "react-konva";
import useImage from "@/lib/hooks/useImage";
import { DesignElement } from "@/lib/store/customizerSlice";
import { useAppDispatch } from "@/lib/store/hooks";
import { updateElement, selectElement, saveHistoryState } from "@/lib/store/customizerSlice";

interface DesignNodeProps {
    design: DesignElement;
    isSelected: boolean;
}

export const DesignNode = ({ design, isSelected }: DesignNodeProps) => {
    const shapeRef = useRef<any>(null);
    const dispatch = useAppDispatch();
    const [image] = useImage(design.type === 'image' ? design.content : null, 'anonymous');

    const handleSelect = (e: any) => {
        e.cancelBubble = true;
        dispatch(selectElement(design.id));
    };

    const handleDragMove = (e: any) => {
        dispatch(updateElement({ id: design.id, x: e.target.x(), y: e.target.y() }));
    };

    const handleDragEnd = () => {
        dispatch(saveHistoryState());
    };

    const handleTransformEnd = () => {
        const node = shapeRef.current;
        dispatch(updateElement({
            id: design.id,
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            scaleX: node.scaleX(),
            scaleY: node.scaleY(),
        }));
        dispatch(saveHistoryState());
    };

    // Convert stored source-px crop to Konva's crop prop
    const konvaCrop = design.crop ? design.crop : undefined;

    return (
        <>
            {design.type === 'image' && image ? (
                <KonvaImage
                    ref={shapeRef}
                    image={image}
                    name={design.id}
                    x={design.x}
                    y={design.y}
                    width={design.width}
                    height={design.height}
                    rotation={design.rotation}
                    scaleX={design.scaleX}
                    scaleY={design.scaleY}
                    crop={konvaCrop}
                    draggable={!design.isLocked}
                    onClick={handleSelect}
                    onTap={handleSelect}
                    onDragMove={handleDragMove}
                    onDragEnd={handleDragEnd}
                    onTransformEnd={handleTransformEnd}
                />
            ) : design.type === 'text' ? (
                <KonvaText
                    ref={shapeRef}
                    text={design.content}
                    name={design.id}
                    x={design.x}
                    y={design.y}
                    fontSize={design.height}
                    fontFamily={design.fontFamily || 'Arial'}
                    fill={design.fill || '#000'}
                    rotation={design.rotation}
                    scaleX={design.scaleX}
                    scaleY={design.scaleY}
                    draggable={!design.isLocked}
                    onClick={handleSelect}
                    onTap={handleSelect}
                    onDragMove={handleDragMove}
                    onDragEnd={handleDragEnd}
                    onTransformEnd={handleTransformEnd}
                />
            ) : null}
        </>
    );
};
