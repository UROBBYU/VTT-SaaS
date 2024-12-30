export default ({
	color
}: {
	color: string
}) => <style>{`body { --foreground: ${color} }`}</style>