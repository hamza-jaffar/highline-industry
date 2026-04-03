import React from 'react'

const Heading = ({ title, description }: { title: string, description: string }) => {
    return (
        <div className="space-y-1">
            <h1 className="text-3xl font-sora font-semibold text-[#111]">
                {title}
            </h1>
            <p className="text-muted text-sm">
                {description}
            </p>
        </div>
    )
}

export default Heading