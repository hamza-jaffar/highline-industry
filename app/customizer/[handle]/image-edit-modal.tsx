"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { X, Check, Eraser, ZoomIn, ZoomOut, RotateCcw, Loader2 } from "lucide-react";
import { DesignElement } from "@/lib/store/customizerSlice";
import { useAppDispatch } from "@/lib/store/hooks";
import { updateElement, setElementCrop, saveHistoryState } from "@/lib/store/customizerSlice";

interface ImageEditModalProps {
    design: DesignElement;
    onClose: () => void;
}

interface CropArea {
    x: number;
    y: number;
    width: number;
    height: number;
}

export const ImageEditModal = ({ design, onClose }: ImageEditModalProps) => {
    const dispatch = useAppDispatch();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const dragRef = useRef<{ active: boolean; handle: string | null; startX: number; startY: number; startCrop: CropArea } | null>(null);
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const [activeTab, setActiveTab] = useState<'crop' | 'removebg'>('crop');
    const [isRemovingBg, setIsRemovingBg] = useState(false);
    const [bgRemoved, setBgRemoved] = useState(false);
    const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
    const [zoom, setZoom] = useState(1);

    // Crop state in relative coords (0-1)
    const [crop, setCrop] = useState<CropArea>({ x: 0, y: 0, width: 1, height: 1 });

    // Load image
    useEffect(() => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            setImage(img);
            // If design already has a crop, restore it in relative coords
            if (design.crop) {
                const naturalW = img.naturalWidth;
                const naturalH = img.naturalHeight;
                setCrop({
                    x: design.crop.x / naturalW,
                    y: design.crop.y / naturalH,
                    width: design.crop.width / naturalW,
                    height: design.crop.height / naturalH,
                });
            } else {
                setCrop({ x: 0, y: 0, width: 1, height: 1 });
            }
        };
        img.src = processedImageUrl || design.content;
    }, [design.content, design.crop, processedImageUrl]);

    // Render the crop overlay canvas
    useEffect(() => {
        if (!canvasRef.current || !image) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const DISPLAY = 480;
        const aspect = image.naturalWidth / image.naturalHeight;
        const dW = aspect >= 1 ? DISPLAY : DISPLAY * aspect;
        const dH = aspect >= 1 ? DISPLAY / aspect : DISPLAY;

        canvas.width = dW;
        canvas.height = dH;

        // Draw image
        ctx.clearRect(0, 0, dW, dH);
        ctx.drawImage(image, 0, 0, dW, dH);

        if (activeTab === 'crop') {
            // Darken outside crop
            const cx = crop.x * dW;
            const cy = crop.y * dH;
            const cw = crop.width * dW;
            const ch = crop.height * dH;

            ctx.fillStyle = 'rgba(0,0,0,0.55)';
            ctx.fillRect(0, 0, dW, cy);
            ctx.fillRect(0, cy + ch, dW, dH - (cy + ch));
            ctx.fillRect(0, cy, cx, ch);
            ctx.fillRect(cx + cw, cy, dW - (cx + cw), ch);

            // Rule of thirds
            ctx.strokeStyle = 'rgba(255,255,255,0.4)';
            ctx.lineWidth = 0.8;
            for (let i = 1; i < 3; i++) {
                ctx.beginPath();
                ctx.moveTo(cx + (cw * i) / 3, cy);
                ctx.lineTo(cx + (cw * i) / 3, cy + ch);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(cx, cy + (ch * i) / 3);
                ctx.lineTo(cx + cw, cy + (ch * i) / 3);
                ctx.stroke();
            }

            // Crop border
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 4]);
            ctx.strokeRect(cx, cy, cw, ch);
            ctx.setLineDash([]);

            // Corner handles
            const hs = 10;
            ctx.fillStyle = '#2563eb';
            const corners = [
                [cx, cy], [cx + cw, cy], [cx, cy + ch], [cx + cw, cy + ch],
                [cx + cw / 2, cy], [cx + cw / 2, cy + ch],
                [cx, cy + ch / 2], [cx + cw, cy + ch / 2],
            ];
            corners.forEach(([hx, hy]) => {
                ctx.fillRect(hx - hs / 2, hy - hs / 2, hs, hs);
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 1.5;
                ctx.strokeRect(hx - hs / 2, hy - hs / 2, hs, hs);
            });
        }
    }, [image, crop, activeTab]);

    const getCropHandle = (ex: number, ey: number, dW: number, dH: number): string | null => {
        const cx = crop.x * dW;
        const cy = crop.y * dH;
        const cw = crop.width * dW;
        const ch = crop.height * dH;
        const hs = 14;
        const handles: Record<string, [number, number]> = {
            'tl': [cx, cy], 'tr': [cx + cw, cy],
            'bl': [cx, cy + ch], 'br': [cx + cw, cy + ch],
            'tc': [cx + cw / 2, cy], 'bc': [cx + cw / 2, cy + ch],
            'ml': [cx, cy + ch / 2], 'mr': [cx + cw, cy + ch / 2],
        };
        for (const [name, [hx, hy]] of Object.entries(handles)) {
            if (Math.abs(ex - hx) <= hs && Math.abs(ey - hy) <= hs) return name;
        }
        // Inside crop = move
        if (ex > cx && ex < cx + cw && ey > cy && ey < cy + ch) return 'move';
        return null;
    };

    const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current!;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        if ('touches' in e) {
            return {
                x: (e.touches[0].clientX - rect.left) * scaleX,
                y: (e.touches[0].clientY - rect.top) * scaleY,
            };
        }
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY,
        };
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (activeTab !== 'crop' || !canvasRef.current) return;
        const { x, y } = getCanvasCoords(e);
        const handle = getCropHandle(x, y, canvasRef.current.width, canvasRef.current.height);
        if (!handle) return;
        dragRef.current = { active: true, handle, startX: x, startY: y, startCrop: { ...crop } };
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!dragRef.current?.active || !canvasRef.current) return;
        const { x, y } = getCanvasCoords(e);
        const dW = canvasRef.current.width;
        const dH = canvasRef.current.height;
        const dx = (x - dragRef.current.startX) / dW;
        const dy = (y - dragRef.current.startY) / dH;
        const sc = dragRef.current.startCrop;
        const handle = dragRef.current.handle;

        let nx = sc.x, ny = sc.y, nw = sc.width, nh = sc.height;
        const MIN = 0.05;

        if (handle === 'move') {
            nx = Math.max(0, Math.min(1 - sc.width, sc.x + dx));
            ny = Math.max(0, Math.min(1 - sc.height, sc.y + dy));
        } else {
            if (handle?.includes('l')) { nx = Math.max(0, Math.min(sc.x + sc.width - MIN, sc.x + dx)); nw = sc.x + sc.width - nx; }
            if (handle?.includes('r')) { nw = Math.max(MIN, Math.min(1 - sc.x, sc.width + dx)); }
            if (handle?.includes('t')) { ny = Math.max(0, Math.min(sc.y + sc.height - MIN, sc.y + dy)); nh = sc.y + sc.height - ny; }
            if (handle?.includes('b')) { nh = Math.max(MIN, Math.min(1 - sc.y, sc.height + dy)); }
            if (handle === 'ml' || handle === 'mr') { ny = sc.y; nh = sc.height; }
            if (handle === 'tc' || handle === 'bc') { nx = sc.x; nw = sc.width; }
        }

        setCrop({ x: Math.max(0, nx), y: Math.max(0, ny), width: Math.min(1 - nx, nw), height: Math.min(1 - ny, nh) });
    };

    const handleMouseUp = () => { dragRef.current = null; };

    const applyCrop = () => {
        if (!image) return;
        const finalCrop = {
            x: Math.round(crop.x * image.naturalWidth),
            y: Math.round(crop.y * image.naturalHeight),
            width: Math.round(crop.width * image.naturalWidth),
            height: Math.round(crop.height * image.naturalHeight),
        };
        dispatch(setElementCrop({ id: design.id, crop: finalCrop }));
        dispatch(saveHistoryState());
        onClose();
    };

    const handleRemoveBg = async () => {
        if (!image) return;
        setIsRemovingBg(true);
        try {
            // Export to blob and send to remove.bg API
            const canvas = document.createElement('canvas');
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;
            const ctx = canvas.getContext('2d')!;
            ctx.drawImage(image, 0, 0);

            const blob = await new Promise<Blob>((res) => canvas.toBlob(b => res(b!), 'image/png'));
            const formData = new FormData();
            formData.append('image_file', blob, 'image.png');
            formData.append('size', 'auto');

            const resp = await fetch('https://api.remove.bg/v1.0/removebg', {
                method: 'POST',
                headers: { 'X-Api-Key': process.env.NEXT_PUBLIC_REMOVE_BG_API_KEY || '' },
                body: formData,
            });

            if (resp.ok) {
                const resultBlob = await resp.blob();
                const url = URL.createObjectURL(resultBlob);
                setProcessedImageUrl(url);
                setBgRemoved(true);
            } else {
                // Simulate locally using canvas color difference
                simulateRemoveBg(canvas, ctx);
            }
        } catch {
            // Fallback: simulate with nearest-color removal from corners
            const canvas = document.createElement('canvas');
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;
            const ctx = canvas.getContext('2d')!;
            ctx.drawImage(image, 0, 0);
            simulateRemoveBg(canvas, ctx);
        }
        setIsRemovingBg(false);
    };

    const simulateRemoveBg = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        // Sample corner pixel as background color
        const bgR = data[0], bgG = data[1], bgB = data[2];
        const threshold = 50;
        for (let i = 0; i < data.length; i += 4) {
            const dr = Math.abs(data[i] - bgR);
            const dg = Math.abs(data[i + 1] - bgG);
            const db = Math.abs(data[i + 2] - bgB);
            if (dr + dg + db < threshold * 3) {
                data[i + 3] = 0;
            }
        }
        ctx.putImageData(imgData, 0, 0);
        const url = canvas.toDataURL('image/png');
        setProcessedImageUrl(url);
        setBgRemoved(true);
    };

    const applyRemoveBg = () => {
        if (!processedImageUrl) return;
        dispatch(updateElement({ id: design.id, content: processedImageUrl }));
        dispatch(saveHistoryState());
        onClose();
    };

    const resetCrop = () => setCrop({ x: 0, y: 0, width: 1, height: 1 });

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[95vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-black/5">
                    <h2 className="text-lg font-black tracking-tight">Edit Image</h2>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-black/5 px-6">
                    <button
                        onClick={() => setActiveTab('crop')}
                        className={`py-3 px-4 text-sm font-bold border-b-2 transition-colors cursor-pointer ${activeTab === 'crop' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-700'}`}
                    >
                        ✂️ Crop
                    </button>
                    <button
                        onClick={() => setActiveTab('removebg')}
                        className={`py-3 px-4 text-sm font-bold border-b-2 transition-colors cursor-pointer ${activeTab === 'removebg' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-700'}`}
                    >
                        🪄 Remove BG
                    </button>
                </div>

                {/* Canvas */}
                <div className="flex-1 overflow-auto flex items-center justify-center bg-[#f5f6f7] p-4 min-h-0">
                    {activeTab === 'crop' ? (
                        <canvas
                            ref={canvasRef}
                            className="max-w-full max-h-[50vh] object-contain rounded-lg cursor-crosshair shadow-lg select-none"
                            style={{ touchAction: 'none' }}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                        />
                    ) : (
                        <div className="flex flex-col items-center gap-4">
                            <div className="rounded-xl overflow-hidden shadow-lg bg-[#d6d3d3] bg-[repeating-conic-gradient(#ccc_0%_25%,transparent_0%_50%)] bg-[length:16px_16px]">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={processedImageUrl || design.content}
                                    alt="Preview"
                                    className="max-h-[45vh] max-w-full object-contain"
                                />
                            </div>
                            {bgRemoved && (
                                <div className="flex items-center gap-2 text-green-600 text-sm font-semibold bg-green-50 px-4 py-2 rounded-full">
                                    <Check className="w-4 h-4" />
                                    Background removed!
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer actions */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-black/5 gap-3">
                    {activeTab === 'crop' ? (
                        <>
                            <button
                                onClick={resetCrop}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Reset
                            </button>
                            <div className="flex items-center gap-2 text-xs text-gray-400 hidden md:flex">
                                <span>Drag handles to crop</span>
                            </div>
                            <button
                                onClick={applyCrop}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-black text-white text-sm font-bold hover:bg-black/80 transition-colors cursor-pointer"
                            >
                                <Check className="w-4 h-4" />
                                Apply Crop
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={handleRemoveBg}
                                disabled={isRemovingBg}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-bold hover:bg-purple-700 disabled:opacity-50 transition-colors cursor-pointer"
                            >
                                {isRemovingBg ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eraser className="w-4 h-4" />}
                                {isRemovingBg ? 'Processing...' : 'Remove Background'}
                            </button>
                            {bgRemoved && (
                                <button
                                    onClick={applyRemoveBg}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-black text-white text-sm font-bold hover:bg-black/80 transition-colors cursor-pointer"
                                >
                                    <Check className="w-4 h-4" />
                                    Apply
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
