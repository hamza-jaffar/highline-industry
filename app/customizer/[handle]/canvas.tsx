"use client";

import { useRef, useState, useEffect } from "react";
import {
    X,
    RotateCcw,
    RotateCw,
    Grid,
    Maximize2,
    Undo2,
    Redo2,
    Crop,
    Eraser,
    Check
} from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { setPart, setZoom, setPan, toggleGrid, undo, redo, selectElement, updateElement, saveHistoryState, removeElementBackground, setElementCrop, setTab } from "@/lib/store/customizerSlice";
import { Stage, Layer, Image as KonvaImage, Rect, Group, Text, Transformer } from "react-konva";
import useImage from "@/lib/hooks/useImage";
import { DesignNode } from "./design-node";
import { ImageEditModal } from "./image-edit-modal";

const CANVAS_SIZE = 500;

const CenterCanvas = ({ isMobile }: { isMobile?: boolean }) => {
    const dispatch = useAppDispatch();
    const config = useAppSelector(state => state.customizer.config);
    const selectedPart = useAppSelector(state => state.customizer.selectedPart);
    const selectedColor = useAppSelector(state => state.customizer.selectedColor);
    const showGrid = useAppSelector(state => state.customizer.canvas.showGrid);
    const zoom = useAppSelector(state => state.customizer.canvas.zoom);
    const pan = useAppSelector(state => state.customizer.canvas.pan);
    const past = useAppSelector(state => state.customizer.history.past);
    const future = useAppSelector(state => state.customizer.history.future);
    const designs = useAppSelector(state => state.customizer.designs);
    const selectedElementId = useAppSelector(state => state.customizer.selectedElementId);
    const trRef = useRef<any>(null);
    const stageRef = useRef<any>(null);

    const parts = config?.parts ? Object.keys(config.parts) : [];
    const partDef = config?.parts ? config.parts[selectedPart] : null;

    const currentImageUrl = partDef?.isCommon
        ? config?.commonImages?.[selectedPart]
        : config?.colorImages?.[selectedColor]?.[selectedPart];

    const [baseImage] = useImage(currentImageUrl || null, "anonymous");

    const currentDesigns = designs.filter(d => d.partName === selectedPart);

    const containerRef = useRef<HTMLDivElement>(null);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const [isCropMode, setIsCropMode] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editModalTab, setEditModalTab] = useState<'crop' | 'removebg'>('crop');

    // Exit crop mode when selection changes
    useEffect(() => {
        setIsCropMode(false);
    }, [selectedElementId]);

    useEffect(() => {
        const attachTransformer = () => {
            if (selectedElementId && trRef.current && stageRef.current) {
                const stage = stageRef.current;
                const node = stage.findOne(`.${selectedElementId}`);
                if (node) {
                    trRef.current.nodes([node]);
                    trRef.current.getLayer().batchDraw();
                } else {
                    trRef.current.nodes([]);
                }
            } else if (trRef.current) {
                trRef.current.nodes([]);
                trRef.current.getLayer()?.batchDraw();
            }
        };

        attachTransformer();
        // Use animation frame for smoother updates across grouping/clipping layers
        const frame = requestAnimationFrame(attachTransformer);
        return () => cancelAnimationFrame(frame);
    }, [selectedElementId, designs, selectedPart]);

    const handleStageInteraction = (e: any) => {
        // If clicking on the background, de-select
        if (e.target === e.target.getStage() || e.target.name() === 'background-rect') {
            dispatch(selectElement(null));
        }
    };

    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                setContainerSize({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight
                });
            }
        };
        updateSize();

        // Secondary check for mobile browsers that might report 0 size initially
        const timeout = setTimeout(updateSize, 100);
        const timeoutLong = setTimeout(updateSize, 500);

        window.addEventListener('resize', updateSize);
        return () => {
            window.removeEventListener('resize', updateSize);
            clearTimeout(timeout);
            clearTimeout(timeoutLong);
        };
    }, []);

    // Center canvas initially
    useEffect(() => {
        if (containerSize.width > 0 && containerSize.height > 0 && zoom === 1 && pan.x === 0 && pan.y === 0) {
            const scaleX = containerSize.width / CANVAS_SIZE;
            const scaleY = containerSize.height / CANVAS_SIZE;
            let initialZoom = Math.min(scaleX, scaleY) * 0.8;

            // Safeguard against zero or invalid size
            if (initialZoom <= 0 || isNaN(initialZoom)) initialZoom = isMobile ? 0.4 : 0.6;

            const initialPanX = (containerSize.width - (CANVAS_SIZE * initialZoom)) / 2;
            const initialPanY = (containerSize.height - (CANVAS_SIZE * initialZoom)) / 2;

            dispatch(setZoom(initialZoom));
            dispatch(setPan({ x: initialPanX, y: initialPanY }));
        }
    }, [containerSize, zoom, pan, dispatch, isMobile]);

    const handleWheel = (e: any) => {
        e.evt.preventDefault();

        const scaleBy = 1.05;
        const stage = e.target.getStage();
        const oldScale = stage.scaleX();
        const mousePointTo = {
            x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
            y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale,
        };

        const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

        dispatch(setZoom(newScale));
        dispatch(setPan({
            x: -(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale,
            y: -(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale,
        }));
    };

    const handleDragEnd = (e: any) => {
        if (e.target.getStage() === e.target) {
            dispatch(setPan({
                x: e.target.x(),
                y: e.target.y()
            }));
            return;
        }

        // Handle DesignNode drag end for area switching
        const node = e.target;
        const id = node.name();
        const design = designs.find(d => d.id === id);

        if (design && partDef) {
            // Find which area contains the center of the node
            const centerX = node.x() + (node.width() * node.scaleX()) / 2;
            const centerY = node.y() + (node.height() * node.scaleY()) / 2;

            const newArea = partDef.areas.find(area => {
                const ax = (area.x / 100) * CANVAS_SIZE;
                const ay = (area.y / 100) * CANVAS_SIZE;
                const aw = (area.width / 100) * CANVAS_SIZE;
                const ah = (area.height / 100) * CANVAS_SIZE;

                return centerX >= ax && centerX <= ax + aw &&
                    centerY >= ay && centerY <= ay + ah &&
                    (area.allowedType === 'both' || area.allowedType === design.type);
            });

            const targetAreaId = newArea?.id;
            // Always update, even if to undefined, to ensure it doesn't stay stuck to an old area
            dispatch(updateElement({ id: design.id, areaId: targetAreaId }));
        }

        dispatch(saveHistoryState());
    };

    const checkDeselect = (e: any) => {
        const clickedOnEmpty = e.target === e.target.getStage() || e.target.name() === 'background-rect';
        if (clickedOnEmpty) {
            dispatch(selectElement(null));
        }
    };

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Only handle if not typing in an input/textarea
            if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
                return;
            }

            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'z') {
                    e.preventDefault();
                    dispatch(undo());
                } else if (e.key === 'y') {
                    e.preventDefault();
                    dispatch(redo());
                }
            } else {
                if (e.key.toLowerCase() === 'g') {
                    dispatch(toggleGrid());
                } else if (e.key.toLowerCase() === 'f') {
                    // Fit to Screen Logic
                    if (containerSize.width && containerSize.height) {
                        const scaleX = containerSize.width / CANVAS_SIZE;
                        const scaleY = containerSize.height / CANVAS_SIZE;
                        const newZoom = Math.min(scaleX, scaleY) * 0.8;

                        const newPanX = (containerSize.width - (CANVAS_SIZE * newZoom)) / 2;
                        const newPanY = (containerSize.height - (CANVAS_SIZE * newZoom)) / 2;

                        dispatch(setZoom(newZoom));
                        dispatch(setPan({ x: newPanX, y: newPanY }));
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [dispatch, containerSize]);

    return (
        <>
            <div className="bg-[#f5f6f7] w-full h-full relative flex flex-col overflow-hidden">
                {/* Top Canvas Toolbar */}
                <div className={`h-12 md:h-14 bg-white/80 backdrop-blur-md border-b border-black/5 flex items-center justify-between ${isMobile ? 'px-2' : 'px-6'} z-10 w-full shrink-0`}>
                    <div className="flex items-center gap-1.5 md:gap-3 overflow-x-auto hide-scrollbar">
                        {parts.map(part => (
                            <button
                                key={part}
                                onClick={() => dispatch(setPart(part))}
                                className={`cursor-pointer px-3 md:px-4 py-1.5 rounded-md text-[10px] md:text-xs font-bold transition-all whitespace-nowrap ${selectedPart === part
                                    ? 'bg-black text-white shadow-md'
                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                    }`}
                            >
                                {isMobile ? (config?.parts[part].name || part).split(' ')[0] : (config?.parts[part].name || part)}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-1 md:gap-2 shrink-0 ml-2">
                        <div className="flex items-center bg-gray-100 p-0.5 md:p-1 rounded-lg">
                            <button
                                onClick={() => dispatch(undo())}
                                disabled={past.length === 0}
                                className="p-1 md:p-1.5 hover:bg-white cursor-pointer rounded-md transition-all text-gray-500 hover:text-black disabled:opacity-30"
                            >
                                <Undo2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            </button>
                            <button
                                onClick={() => dispatch(redo())}
                                disabled={future.length === 0}
                                className="p-1 md:p-1.5 hover:bg-white cursor-pointer rounded-md transition-all text-gray-500 hover:text-black disabled:opacity-30"
                            >
                                <Redo2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            </button>
                        </div>

                        {/* Image Editing Tools */}
                        {selectedElementId && designs.find(d => d.id === selectedElementId)?.type === 'image' && (
                            <div className="flex items-center gap-1 md:gap-2 ml-1">
                                <button
                                    onClick={() => { setEditModalTab('crop'); setShowEditModal(true); }}
                                    className="p-1.5 md:p-2 cursor-pointer bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1.5"
                                    title="Crop Image"
                                >
                                    <Crop className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                    {!isMobile && <span className="text-[10px] font-bold uppercase">Crop</span>}
                                </button>
                                <button
                                    onClick={() => { setEditModalTab('removebg'); setShowEditModal(true); }}
                                    className="p-1.5 md:p-2 cursor-pointer bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors flex items-center gap-1.5"
                                    title="Remove Background"
                                >
                                    <Eraser className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                    {!isMobile && <span className="text-[10px] font-bold uppercase">Remove BG</span>}
                                </button>
                            </div>
                        )}

                        {!isMobile && (
                            <>
                                <div className="w-px h-6 bg-black/5 mx-2" />
                                <button
                                    onClick={() => dispatch(toggleGrid())}
                                    className={`p-2 rounded-lg cursor-pointer transition-colors ${showGrid ? 'bg-black text-white' : 'hover:bg-gray-100 text-gray-400 hover:text-black'}`}
                                >
                                    <Grid className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => dispatch(setZoom(zoom * 1.2))}
                                    className="p-2 hover:bg-gray-100 cursor-pointer rounded-lg transition-colors text-gray-400 hover:text-black"
                                >
                                    <Maximize2 className="w-5 h-5" />
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Main Stage */}
                <div
                    className="flex-1 relative flex items-center justify-center p-0 overflow-hidden"
                    id="canvas-container"
                    ref={containerRef}
                >
                    {containerSize.width > 0 && (
                        <Stage
                            ref={stageRef}
                            width={containerSize.width}
                            height={containerSize.height}
                            onWheel={handleWheel}
                            scaleX={zoom}
                            scaleY={zoom}
                            x={pan.x}
                            y={pan.y}
                            draggable
                            onDragEnd={handleDragEnd}
                            onMouseDown={handleStageInteraction}
                            onTouchStart={handleStageInteraction}
                        >
                            <Layer>
                                {/* Base Image Background */}
                                <Rect name="background-rect" width={CANVAS_SIZE} height={CANVAS_SIZE} fill="#ffffff" />

                                {/* Base Product Image */}
                                {baseImage ? (
                                    <KonvaImage
                                        image={baseImage}
                                        width={CANVAS_SIZE}
                                        height={CANVAS_SIZE}
                                    />
                                ) : (
                                    <Rect
                                        width={CANVAS_SIZE}
                                        height={CANVAS_SIZE}
                                        fill="#f8f9fa"
                                        stroke="#e9ecef"
                                        strokeWidth={2}
                                    />
                                )}

                                {/* Grid (if enabled) */}
                                {showGrid && (
                                    <Group opacity={0.15} listening={false}>
                                        {Array.from({ length: 20 }).map((_, i) => (
                                            <Rect
                                                key={`grid-v-${i}`}
                                                x={(CANVAS_SIZE / 20) * i}
                                                y={0}
                                                width={1}
                                                height={CANVAS_SIZE}
                                                fill="black"
                                            />
                                        ))}
                                        {Array.from({ length: 20 }).map((_, i) => (
                                            <Rect
                                                key={`grid-h-${i}`}
                                                x={0}
                                                y={(CANVAS_SIZE / 20) * i}
                                                width={CANVAS_SIZE}
                                                height={1}
                                                fill="black"
                                            />
                                        ))}
                                    </Group>
                                )}

                                {/* Global Design Layer Clipped to Product Square */}
                                <Group
                                    key={`global-product-clipping-${selectedPart}`}
                                    clipX={0}
                                    clipY={0}
                                    clipWidth={CANVAS_SIZE}
                                    clipHeight={CANVAS_SIZE}
                                >
                                    {/* Render Areas Borders/Labels */}
                                    {partDef?.areas.map(area => (
                                        <Group
                                            key={`area-guide-${area.id}`}
                                            x={(area.x / 100) * CANVAS_SIZE}
                                            y={(area.y / 100) * CANVAS_SIZE}
                                            listening={false}
                                        >
                                            <Rect
                                                width={(area.width / 100) * CANVAS_SIZE}
                                                height={(area.height / 100) * CANVAS_SIZE}
                                                stroke="#000"
                                                strokeWidth={1}
                                                dash={[4, 4]}
                                                opacity={0.3}
                                            />
                                            <Text
                                                fontSize={10}
                                                fontStyle="bold"
                                                fill="black"
                                                opacity={0.4}
                                                y={-14}
                                            />
                                        </Group>
                                    ))}

                                    {/* 
                                    Unified Design Rendering:
                                    1. Render designs assigned to existing areas (clipped).
                                    2. Render any remaining designs (floating) clipped to the product square.
                                */}
                                    {(() => {
                                        const areaIdsInPart = new Set(partDef?.areas.map(a => a.id));

                                        return (
                                            <>
                                                {/* Render User Designs inside Clipped Areas */}
                                                {partDef?.areas.map(area => {
                                                    const areaDesigns = currentDesigns.filter(d => d.areaId === area.id);
                                                    const areaX = (area.x / 100) * CANVAS_SIZE;
                                                    const areaY = (area.y / 100) * CANVAS_SIZE;
                                                    const areaWidth = (area.width / 100) * CANVAS_SIZE;
                                                    const areaHeight = (area.height / 100) * CANVAS_SIZE;

                                                    return (
                                                        <Group
                                                            key={`clipped-area-${area.id}`}
                                                            clipX={areaX}
                                                            clipY={areaY}
                                                            clipWidth={areaWidth}
                                                            clipHeight={areaHeight}
                                                        >
                                                            {areaDesigns.map(design => (
                                                                <DesignNode
                                                                    key={design.id}
                                                                    design={design}
                                                                    isSelected={design.id === selectedElementId}
                                                                />
                                                            ))}
                                                        </Group>
                                                    );
                                                })}

                                                {/* Render floating designs or designs with orphaned areaIds for this perspective */}
                                                {/* We use a clipFunc to ensure they are only visible within the union of all valid areas */}
                                                <Group
                                                    key={`floating-clipped-${selectedPart}`}
                                                    clipFunc={(ctx) => {
                                                        if (!partDef) return;
                                                        ctx.beginPath();
                                                        partDef.areas.forEach(area => {
                                                            const ax = (area.x / 100) * CANVAS_SIZE;
                                                            const ay = (area.y / 100) * CANVAS_SIZE;
                                                            const aw = (area.width / 100) * CANVAS_SIZE;
                                                            const ah = (area.height / 100) * CANVAS_SIZE;
                                                            ctx.rect(ax, ay, aw, ah);
                                                        });
                                                        ctx.closePath();
                                                    }}
                                                >
                                                    {currentDesigns.filter(d => !d.areaId || !areaIdsInPart.has(d.areaId)).map(design => (
                                                        <DesignNode
                                                            key={design.id}
                                                            design={design}
                                                            isSelected={design.id === selectedElementId}
                                                        />
                                                    ))}
                                                </Group>
                                            </>
                                        );
                                    })()}
                                </Group>

                                {/* Transformer rendered outside ALL groups to ensure handles are never clipped */}
                                <Transformer
                                    ref={trRef}
                                    boundBoxFunc={(oldBox, newBox) => {
                                        if (newBox.width < 5 || newBox.height < 5) return oldBox;
                                        return newBox;
                                    }}
                                />
                            </Layer>
                        </Stage>
                    )}
                </div>
            </div>

            {/* Image Edit Modal */}
            {showEditModal && selectedElementId && !(() => {
                const d = designs.find(d => d.id === selectedElementId);
                return !d;
            })() && (
                    <ImageEditModal
                        design={designs.find(d => d.id === selectedElementId)!}
                        onClose={() => setShowEditModal(false)}
                    />
                )}
        </>
    );
};

export default CenterCanvas;
