import { useEffect, useState } from 'react';

type NavItem = {
	label: string;
	href: string;
	active?: boolean;
};

interface Props {
	currentPath: string;
	navItems: NavItem[];
}

const BOOK_ONLINE = { label: 'Book Online', href: '/book-online/' };

export default function MobileNav({ currentPath, navItems }: Props) {
	const [open, setOpen] = useState(false);

	const bookOnlineActive =
		currentPath === '/book-online/' ||
		currentPath.startsWith('/book-appointment');

	useEffect(() => {
		document.body.style.overflow = open ? 'hidden' : '';
		return () => {
			document.body.style.overflow = '';
		};
	}, [open]);

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setOpen(false);
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, []);

	return (
		<div className="glory-mobile-nav">
			<button
				type="button"
				className="glory-mobile-nav__toggle"
				aria-expanded={open}
				aria-controls="glory-mobile-drawer"
				aria-label={open ? 'Close menu' : 'Open menu'}
				onClick={() => setOpen((v) => !v)}
			>
				<svg viewBox="0 0 24 24" width="34" height="34" fill="currentColor" aria-hidden="true">
					{open ? (
						<path
							d="M6 6l12 12M18 6L6 18"
							stroke="currentColor"
							strokeWidth="2.5"
							strokeLinecap="round"
							fill="none"
						/>
					) : (
						<>
							<rect y="4" width="24" height="2.5" rx="1" />
							<rect y="10.75" width="24" height="2.5" rx="1" />
							<rect y="17.5" width="24" height="2.5" rx="1" />
						</>
					)}
				</svg>
			</button>

			{open && (
				<div
					className="glory-mobile-nav__backdrop"
					aria-hidden="true"
					onClick={() => setOpen(false)}
				/>
			)}

			<nav
				id="glory-mobile-drawer"
				className={`glory-mobile-nav__drawer${open ? ' is-open' : ''}`}
				aria-label="Mobile navigation"
				aria-hidden={!open}
			>
				<ul className="glory-mobile-nav__list">
					{navItems.map((item) => (
						<li key={item.href}>
							<a
								href={item.href}
								aria-current={item.active ? 'page' : undefined}
								onClick={() => setOpen(false)}
							>
								{item.label}
							</a>
						</li>
					))}
					<li className="glory-nav-cta">
						<a
							href={BOOK_ONLINE.href}
							aria-current={bookOnlineActive ? 'page' : undefined}
							onClick={() => setOpen(false)}
						>
							{BOOK_ONLINE.label}
						</a>
					</li>
				</ul>
			</nav>
		</div>
	);
}
