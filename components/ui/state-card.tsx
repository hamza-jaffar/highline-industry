export default function StatCard({ title, value, icon, className = "" }: { title: string, value: string, icon: React.ReactNode, className?: string }) {
    return (
        <div className={`p-6 rounded-2xl border border-black/10 bg-white shadow-sm flex flex-col gap-4 ${className}`}>
            <div className="flex items-center gap-3 text-black/50 text-xs uppercase tracking-widest">
                {icon}
                {title}
            </div>
            <p className="text-3xl font-semibold tracking-tighter">{value}</p>
        </div>
    );
}
