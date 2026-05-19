import { PDFDocument, type PDFPage, rgb, PDFName, PDFNumber } from 'pdf-lib';

const MM_TO_PT = 72 / 25.4;
const MAX_USER_SPACE_PT = 14400;

export type Layout = 'extend' | '3up' | 'all';
export type PageSize = 'letter' | 'a4' | 'legal';

export interface RgbColor {
	r: number; // 0..1
	g: number;
	b: number;
}

export interface TransformOptions {
	layout: Layout;
	ratio: number;
	lines: boolean;
	lineSpacingMm: number;
	lineWeightPt: number;
	lineColor: RgbColor;
	pageSize: PageSize;
	marginMm: number;
	gutterMm: number;
}

const PAGE_SIZES: Record<PageSize, [number, number]> = {
	letter: [612, 792],
	a4: [595.28, 841.89],
	legal: [612, 1008]
};

export const DEFAULT_OPTIONS: TransformOptions = {
	layout: 'extend',
	ratio: 1,
	lines: true,
	lineSpacingMm: 9,
	lineWeightPt: 0.3,
	lineColor: { r: 0.722, g: 0.722, b: 0.722 },
	pageSize: 'letter',
	marginMm: 12.7,
	gutterMm: 6.35
};

export function hexToRgb(hex: string): RgbColor {
	const s = hex.replace('#', '');
	const n = parseInt(
		s.length === 3
			? s
					.split('')
					.map((c) => c + c)
					.join('')
			: s,
		16
	);
	return {
		r: ((n >> 16) & 0xff) / 255,
		g: ((n >> 8) & 0xff) / 255,
		b: (n & 0xff) / 255
	};
}

export function rgbToHex({ r, g, b }: RgbColor): string {
	const to = (v: number) =>
		Math.round(v * 255)
			.toString(16)
			.padStart(2, '0');
	return `#${to(r)}${to(g)}${to(b)}`;
}

function drawRuledLines(
	page: PDFPage,
	x: number,
	y: number,
	width: number,
	height: number,
	spacing: number,
	weight: number,
	color: RgbColor
) {
	const c = rgb(color.r, color.g, color.b);
	let yPos = y + height - spacing;
	while (yPos > y + 0.001) {
		page.drawLine({
			start: { x, y: yPos },
			end: { x: x + width, y: yPos },
			thickness: weight,
			color: c
		});
		yPos -= spacing;
	}
}

export async function transformPdf(
	bytes: ArrayBuffer | Uint8Array,
	opts: Partial<TransformOptions> = {}
): Promise<Uint8Array> {
	const o: TransformOptions = { ...DEFAULT_OPTIONS, ...opts };
	const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
	const dst = await PDFDocument.create();

	const sourcePages = src.getPages();
	if (sourcePages.length === 0) throw new Error('PDF has no pages');

	const embedded = await dst.embedPages(sourcePages);

	const lineSpacingPt = o.lineSpacingMm * MM_TO_PT;
	const marginPt = o.marginMm * MM_TO_PT;
	const gutterPt = o.gutterMm * MM_TO_PT;

	if (o.layout === 'extend') {
		for (const ep of embedded) {
			const slideW = ep.width;
			const slideH = ep.height;
			const notesW = slideW * o.ratio;
			const page = dst.addPage([slideW + notesW, slideH]);
			page.drawPage(ep, { x: 0, y: 0 });
			if (o.lines && notesW > 0) {
				drawRuledLines(
					page,
					slideW,
					0,
					notesW,
					slideH,
					lineSpacingPt,
					o.lineWeightPt,
					o.lineColor
				);
			}
		}
	} else if (o.layout === '3up') {
		const [pageW, pageH] = PAGE_SIZES[o.pageSize];
		const usableW = pageW - 2 * marginPt;
		const usableH = pageH - 2 * marginPt;
		const slideColW = (usableW - gutterPt) / (1 + o.ratio);
		const notesColW = usableW - gutterPt - slideColW;
		const rowH = (usableH - 2 * gutterPt) / 3;
		const slideColX = marginPt;
		const notesColX = marginPt + slideColW + gutterPt;

		for (let i = 0; i < embedded.length; i += 3) {
			const group = embedded.slice(i, i + 3);
			const page = dst.addPage([pageW, pageH]);
			group.forEach((ep, j) => {
				const yBottom = marginPt + (2 - j) * (rowH + gutterPt);
				const scale = Math.min(slideColW / ep.width, rowH / ep.height);
				const drawnW = ep.width * scale;
				const drawnH = ep.height * scale;
				const tx = slideColX + (slideColW - drawnW) / 2;
				const ty = yBottom + (rowH - drawnH) / 2;
				page.drawPage(ep, { x: tx, y: ty, xScale: scale, yScale: scale });
				if (o.lines && notesColW > 0) {
					drawRuledLines(
						page,
						notesColX,
						yBottom,
						notesColW,
						rowH,
						lineSpacingPt,
						o.lineWeightPt,
						o.lineColor
					);
				}
			});
		}
	} else {
		const slideW = embedded[0].width;
		const slideH = embedded[0].height;
		const notesW = slideW * o.ratio;
		const physTotalW = slideW + notesW;
		const physTotalH = slideH * embedded.length;

		const userUnit = Math.max(
			1,
			Math.ceil(Math.max(physTotalW, physTotalH) / MAX_USER_SPACE_PT)
		);
		const u = userUnit;
		const page = dst.addPage([physTotalW / u, physTotalH / u]);
		if (u !== 1) {
			page.node.set(PDFName.of('UserUnit'), PDFNumber.of(u));
		}

		const n = embedded.length;
		embedded.forEach((ep, i) => {
			const yBottomPhys = slideH * (n - 1 - i);
			page.drawPage(ep, {
				x: 0,
				y: yBottomPhys / u,
				xScale: 1 / u,
				yScale: 1 / u
			});
			if (o.lines && notesW > 0) {
				drawRuledLines(
					page,
					slideW / u,
					yBottomPhys / u,
					notesW / u,
					slideH / u,
					lineSpacingPt / u,
					o.lineWeightPt / u,
					o.lineColor
				);
			}
		});
	}

	return await dst.save();
}
