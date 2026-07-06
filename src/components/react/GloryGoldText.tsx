import { ShinyText } from '@/components/ui/shiny-text';
import { cn } from '@/lib/utils';

interface Props {
	text: string;
	className?: string;
}

/** Site gold headline accent — ShinyText with brand palette. */
export default function GloryGoldText({ text, className }: Props) {
	return (
		<ShinyText
			text={text}
			className={cn('glory-gold-shiny', className)}
			color="#c2a576"
			shineColor="#f2e6d2"
			speed={3}
			spread={120}
		/>
	);
}
