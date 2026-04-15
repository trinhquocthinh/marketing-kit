
'use client';

export default function LabelHot() {
    return (
        <span className="flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-5 w-5 rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative text-[7px] font-bold text-white inline-flex items-center justify-center rounded-full h-5 w-5 bg-rose-500">Hot</span>
        </span>
    )
}