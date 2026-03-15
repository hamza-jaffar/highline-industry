import { Plus, Upload, UploadCloud } from 'lucide-react'
import React from 'react'

const UploadPanel = () => {
    return (
        <div className="space-y-6 w-full">
            <button className="w-full bg-black rounded-md text-white h-10 flex items-center justify-center gap-2 text-sm font-bold hover:bg-black/80 transition-all">
                <Upload className="w-4 h-4" />
                Upload
            </button>

            <div className="border-b border-black/5 pb-4">
                <div className="flex gap-6 text-sm font-bold">
                    <button className="border-b-2 border-black pb-2">UPLOAD</button>
                    <button className="text-gray-400 pb-2">HISTORY</button>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">Folders</span>
                </div>
                <button className="w-full h-12 border border-dashed border-gray-200 rounded-lg flex items-center justify-center gap-2 text-xs text-gray-400 hover:border-black/20 hover:text-black transition-all">
                    <Plus className="w-3 h-3" />
                    Create folder
                </button>
            </div>

            <div className="pt-10 flex flex-col items-center text-center gap-4 py-8 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                <UploadCloud className="w-8 h-8 text-gray-300" />
                <div className="space-y-1">
                    <p className="text-xs font-bold">Upload or drag your files here</p>
                    <p className="text-[10px] text-gray-400">JPG or PNG, max 50MB</p>
                </div>
            </div>
        </div>
    )
}

export default UploadPanel