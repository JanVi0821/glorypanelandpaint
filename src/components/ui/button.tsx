import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
	'inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0',
	{
		variants: {
			variant: {
				default: 'bg-primary text-primary-foreground hover:bg-primary/90',
				destructive:
					'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20',
				outline:
					'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50',
				secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
				ghost: 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
				link: 'text-primary underline-offset-4 hover:underline',
				gold: 'border-0 bg-[linear-gradient(120deg,#f2e6d2,#d8bd96_45%,#c2a576)] font-extrabold text-[#0a0a0c] shadow-none hover:brightness-105 hover:-translate-y-px',
			},
			size: {
				default: 'h-9 px-4 py-2 has-[>svg]:px-3',
				sm: 'h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5',
				lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
				xl: 'h-auto rounded-[5px] px-[26px] py-[13px] text-base has-[>svg]:px-[26px]',
				icon: 'size-9',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
);

function Button({
	className,
	variant,
	size,
	asChild = false,
	loading = false,
	disabled,
	children,
	...props
}: React.ComponentProps<'button'> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
		loading?: boolean;
	}) {
	const Comp = asChild ? Slot : 'button';

	return (
		<Comp
			data-slot="button"
			className={cn(buttonVariants({ variant, size, className }))}
			disabled={disabled || loading}
			aria-busy={loading || undefined}
			{...props}
		>
			{loading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
			{children}
		</Comp>
	);
}

export { Button, buttonVariants };
