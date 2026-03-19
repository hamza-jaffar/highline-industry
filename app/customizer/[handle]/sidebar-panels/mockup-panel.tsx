"use client";

import { useRef, useState, memo, useMemo, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { Stage, Layer, Image as KonvaImage, Group, Text } from "react-konva";
import useImage from "@/lib/hooks/useImage";
import { Loader2, Download, X, Info } from "lucide-react";
import JSZip from "jszip";
import Konva from "konva";

const PREVIEW_SIZE = 280; // Larger for the main preview
const THUMB_SIZE = 80;
const CANVAS_SIZE = 500; // Match main canvas size

interface PartPreviewProps {
    partName: string;
    config: any;
    selectedColor: string;
    designs: any[];
    size: number;
    onClick?: () => void;
    isActive?: boolean;
}

const PartPreview = memo(({ partName, config, selectedColor, designs, size, onClick, isActive }: PartPreviewProps) => {
    const partDef = config?.parts?.[partName];
    const imageUrl = partDef?.isCommon
        ? config?.commonImages?.[partName]
        : config?.colorImages?.[selectedColor]?.[partName];

    const [image] = useImage(imageUrl || null, "anonymous");
    const scale = size / CANVAS_SIZE;

    return (
        <div
            onClick={onClick}
            className={`relative rounded-lg overflow-hidden transition-all cursor-pointer bg-[#f5f6f7] border-2 ${isActive ? 'border-black' : 'border-gray-100 hover:border-gray-200'
                }`}
            style={{ width: size, height: size }}
        >
            <div className="w-full h-full flex items-center justify-center">
                {!image ? (
                    <Loader2 className="w-4 h-4 animate-spin text-black/10" />
                ) : (
                    <Stage width={size} height={size} scaleX={scale} scaleY={scale}>
                        <Layer>
                            <KonvaImage image={image} width={CANVAS_SIZE} height={CANVAS_SIZE} listening={false} />

                            <Group
                                clipFunc={(ctx) => {
                                    if (!partDef?.areas) return;
                                    ctx.beginPath();
                                    partDef.areas.forEach((area: any) => {
                                        const ax = (area.x / 100) * CANVAS_SIZE;
                                        const ay = (area.y / 100) * CANVAS_SIZE;
                                        const aw = (area.width / 100) * CANVAS_SIZE;
                                        const ah = (area.height / 100) * CANVAS_SIZE;
                                        ctx.rect(ax, ay, aw, ah);
                                    });
                                    ctx.closePath();
                                }}
                                listening={false}
                            >
                                {designs.map((design) => (
                                    <PreviewDesignNode key={design.id} design={design} />
                                ))}
                            </Group>
                        </Layer>
                    </Stage>
                )}
            </div>
        </div>
    );
}, (prev, next) => {
    if (prev.isActive !== next.isActive || prev.partName !== next.partName || prev.selectedColor !== next.selectedColor || prev.size !== next.size || prev.config !== next.config) return false;
    if (prev.designs.length !== next.designs.length) return false;
    return prev.designs.every((d, i) => {
        const nd = next.designs[i];
        return d.id === nd.id && d.x === nd.x && d.y === nd.y && d.scaleX === nd.scaleX && d.scaleY === nd.scaleY && d.rotation === nd.rotation && d.content === nd.content && d.fill === nd.fill && d.fontFamily === nd.fontFamily;
    });
});

const PreviewDesignNode = ({ design }: { design: any }) => {
    const [image] = useImage(design.type === 'image' ? design.content : null, 'anonymous');

    if (design.type === 'image') {
        if (!image) return null;
        return (
            <KonvaImage
                image={image}
                x={design.x}
                y={design.y}
                width={design.width}
                height={design.height}
                rotation={design.rotation}
                scaleX={design.scaleX}
                scaleY={design.scaleY}
                crop={design.crop}
                listening={false}
            />
        );
    }

    return (
        <Text
            text={design.content}
            x={design.x}
            y={design.y}
            fontSize={design.height}
            fontFamily={design.fontFamily || 'Arial'}
            fill={design.fill || '#000'}
            rotation={design.rotation}
            scaleX={design.scaleX}
            scaleY={design.scaleY}
            listening={false}
        />
    );
};

const MockupPanel = () => {
    const config = useAppSelector(state => state.customizer.config);
    const designs = useAppSelector(state => state.customizer.designs);
    const colors = useAppSelector(state => state.customizer.colors);
    const selectedColor = useAppSelector(state => state.customizer.selectedColor);

    const [activePart, setActivePart] = useState<string>(Object.keys(config?.parts || {})[0] || 'Front');
    const [isDownloading, setIsDownloading] = useState(false);
    const [showNote, setShowNote] = useState(true);

    const parts = config?.parts ? Object.keys(config.parts) : [];

    const designsByPart = useMemo(() => {
        const map: Record<string, any[]> = {};
        designs.forEach(d => {
            if (!map[d.partName]) map[d.partName] = [];
            map[d.partName].push(d);
        });
        return map;
    }, [designs]);

    const handleZipDownload = async () => {
        if (!config || isDownloading) return;
        setIsDownloading(true);

        try {
            const zip = new JSZip();
            const offscreenStage = document.createElement('div');
            offscreenStage.style.display = 'none';
            document.body.appendChild(offscreenStage);

            // Helper to generate a single image dataURL
            // Since we need to wait for Konva/Images to render, we'll use a more robust approach
            // For now, we'll rely on the fact that images are likely already cached
            // In a production app, we'd use a dedicated offscreen renderer

            // For simplicity and speed in this context, we will iterate and capture
            // We use the existing PartPreview component's logic but in a more direct way

            // Trigger download for each color and side
            for (const color of colors) {
                const colorFolder = zip.folder(color);
                for (const part of parts) {
                    // Create a temporary stage to capture the mockup
                    const stage = new Konva.Stage({
                        container: offscreenStage,
                        width: 1000, // High res
                        height: 1000,
                        scaleX: 2,
                        scaleY: 2
                    });

                    const layer = new Konva.Layer();
                    stage.add(layer);

                    const partDef = config.parts[part];
                    const imageUrl = partDef.isCommon ? config.commonImages[part] : config.colorImages[color]?.[part];

                    if (imageUrl) {
                        const img = new Image();
                        img.crossOrigin = 'anonymous';
                        img.src = imageUrl;
                        await new Promise((res) => img.onload = res);

                        const kImg = new Konva.Image({
                            image: img,
                            width: 500,
                            height: 500
                        });
                        layer.add(kImg);

                        const group = new Konva.Group({
                            clipFunc: (ctx: any) => {
                                partDef.areas.forEach((area: any) => {
                                    ctx.rect((area.x / 100) * 500, (area.y / 100) * 500, (area.width / 100) * 500, (area.height / 100) * 500);
                                });
                            }
                        });
                        layer.add(group);

                        const partDesigns = designs.filter(d => d.partName === part);
                        for (const d of partDesigns) {
                            if (d.type === 'image') {
                                const dImg = new Image();
                                dImg.crossOrigin = 'anonymous';
                                dImg.src = d.content;
                                await new Promise((res) => dImg.onload = res);

                                const kdImg = new Konva.Image({
                                    image: dImg,
                                    x: d.x,
                                    y: d.y,
                                    width: d.width,
                                    height: d.height,
                                    rotation: d.rotation,
                                    scaleX: d.scaleX,
                                    scaleY: d.scaleY,
                                    crop: d.crop
                                });
                                group.add(kdImg);
                            } else {
                                const kdText = new Konva.Text({
                                    text: d.content,
                                    x: d.x,
                                    y: d.y,
                                    fontSize: d.height,
                                    fontFamily: d.fontFamily || 'Arial',
                                    fill: d.fill || '#000',
                                    rotation: d.rotation,
                                    scaleX: d.scaleX,
                                    scaleY: d.scaleY
                                });
                                group.add(kdText);
                            }
                        }
                    }

                    layer.draw();
                    const dataURL = stage.toDataURL();
                    const base64 = dataURL.split(',')[1];
                    colorFolder?.file(`${part}.png`, base64, { base64: true });

                    stage.destroy();
                }
            }

            const content = await zip.generateAsync({ type: "blob" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(content);
            link.download = `mockups-${Date.now()}.zip`;
            link.click();

            document.body.removeChild(offscreenStage);
        } catch (error) {
            console.error("Zip error:", error);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white relative">
            {/* Header with Download Button */}
            <div className="flex justify-center border-b border-gray-50 bg-white z-10">
                <button
                    onClick={handleZipDownload}
                    disabled={isDownloading}
                    className="flex items-center gap-2.5 px-6 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isDownloading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    ) : (
                        <Download className="w-4 h-4 text-gray-600 group-hover:scale-110 transition-transform" />
                    )}
                    <span className="text-[13px] font-bold text-gray-700">
                        {isDownloading ? "Generating ZIP..." : "Download"}
                    </span>
                </button>
            </div>

            {/* Main Preview Area */}
            <div className="flex-1 overflow-y-auto px-6 py-8 custom-scrollbar space-y-8">
                <div className="flex justify-center flex-col items-center gap-8">
                    {/* Large Preview */}
                    <PartPreview
                        partName={activePart}
                        config={config}
                        selectedColor={selectedColor}
                        designs={designsByPart[activePart] || []}
                        size={PREVIEW_SIZE}
                    />

                    {/* Side Thumbnails */}
                    <div className="flex gap-4 justify-center">
                        {parts.map(part => (
                            <div key={part} className="space-y-2 flex flex-col items-center">
                                <PartPreview
                                    partName={part}
                                    config={config}
                                    selectedColor={selectedColor}
                                    designs={designsByPart[part] || []}
                                    size={THUMB_SIZE}
                                    isActive={activePart === part}
                                    onClick={() => setActivePart(part)}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Spacing for Note box */}
                <div className="h-32" />
            </div>

            {/* Note Box at the Bottom */}
            {showNote && (
                <div className="absolute bottom-6 left-6 right-6 z-20">
                    <div className="bg-[#e9e9e9] rounded-xl p-5 pr-10 relative">
                        <button
                            onClick={() => setShowNote(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        <p className="text-[13px] leading-[1.6] font-medium text-black">
                            <span className="font-extrabold">Note:</span> Mockups are for reference only. Final print placement, size, and color will match your design on the center canvas as closely as possible.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MockupPanel;
