export type Review = {
	text: string;
	author: string;
};

export const googleReviewsUrl =
	'https://www.google.com/maps/place/GLORY+Panel+%26+Paint/@-43.5403871,172.5228219,16z/data=!3m1!4b1!4m6!3m5!1s0x6d318be1e3439ef3:0x164dfb38cdb12ed4!8m2!3d-43.540391!4d172.5253968!16s%2Fg%2F11s47y329n';

export const reviews: Review[] = [
	{
		text: 'Absolutely amazing job done by Joey and his team. Went above and beyond to ensure I was happy with the work and I couldn\u2019t have asked for better. If you\u2019re looking for the job done correctly then this is the place to go.',
		author: 'Walter Savage',
	},
	{
		text: 'My bonnet\u2019s clear coat was breaking away, and rather than just fixing the affected area they went above and beyond \u2014 sanding, priming and painting the whole thing. Fantastic result, great communication and very reasonable pricing. Strongly recommend!',
		author: 'Stephen Deans',
	},
	{
		text: 'My insurance company recommended GLORY Panel & Paint. Joey made the whole process smooth and stress-free, explained everything and even pointed out paint issues I hadn\u2019t noticed. Professional and kind \u2014 thank you to the whole team!',
		author: 'Marcel Wilson',
	},
	{
		text: 'Joey took the time to sit down and helped me save money on the job. The car was covered in hail dents, but after their team finished it looked even better than when I first bought it. Outstanding craftsmanship and great service \u2014 I\u2019d choose these guys over anyone else in Christchurch.',
		author: 'Dominic Da Via',
	},
	{
		text: 'These guys are absolute legends \u2014 they looked after me really well! I needed to replace my centre caps and had no idea how, so they helped me and taught me how to do it, completely free. Big ups, really appreciated their service.',
		author: 'Ngakau Howell',
	},
];
