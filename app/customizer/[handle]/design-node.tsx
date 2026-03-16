"use client";

import { useRef, useEffect } from "react";
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
    const [image] = useImage(design.type === 'image' ? design.content : null);

    const handleSelect = (e: any) => {
        // Prevent event from bubbling up to stage
        e.cancelBubble = true;
        dispatch(selectElement(design.id));
    };

    const handleDragMove = (e: any) => {
        dispatch(updateElement({
            id: design.id,
            x: e.target.x(),
            y: e.target.y()
        }));
    };

    const handleDragEnd = (e: any) => {
        // Log history point only on end
        dispatch(saveHistoryState());
    };

    const handleTransformEnd = (e: any) => {
        const node = shapeRef.current;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();

        dispatch(updateElement({
            id: design.id,
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            scaleX: scaleX,
            scaleY: scaleY,
        }));
        dispatch(saveHistoryState());
    };

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
