import { useEffect, useRef } from 'react';
import { photoStripImages } from '../../data/images';

export default function PhotoStrip() {
	const trackRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const track = trackRef.current;
		if (!track || track.dataset.cloned === 'true') return;

		Array.from(track.children).forEach((node) => {
			track.appendChild(node.cloneNode(true));
		});
		track.dataset.cloned = 'true';
	}, []);

	return (
		<div className="glory-strip">
			<div className="glory-strip-track" ref={trackRef}>
				{photoStripImages.map((img) => (
					<img
						key={img.src}
						src={img.src}
						alt={img.alt}
						loading="lazy"
						width={380}
						height={285}
					/>
				))}
			</div>
		</div>
	);
}
