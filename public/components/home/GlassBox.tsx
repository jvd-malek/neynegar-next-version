interface GlassBoxProps {
    name: string,
    full?: boolean
}

const GlassBox = ({ name, full = false }: GlassBoxProps) => (
    <div
        className={`p-1 rounded-lg text-center border border-inherit ${full ? "w-full bg-white/5" : "bg-white"}`}
        role="listitem"
    >
        <span className="font-medium animate-pulse">{name}</span>
    </div>
);

export default GlassBox;