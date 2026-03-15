import { Upload } from 'lucide-react'
import React from 'react'

const TextPanel = () => {
    return (
        <div className="space-y-6 w-full">
            <button className="w-full bg-black rounded-md text-white h-10 flex items-center justify-center gap-2 text-sm font-bold hover:bg-black/80 transition-all">
                <Upload className="w-4 h-4" />
                Upload
            </button>
        </div>
    )
}

export default TextPanel