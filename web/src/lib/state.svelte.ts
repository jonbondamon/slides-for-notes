import { DEFAULT_OPTIONS, type TransformOptions } from './transform';

export interface AppState {
	file: File | null;
	fileName: string;
	pageCount: number;
	options: TransformOptions;
	isProcessing: boolean;
}

function createState() {
	const state = $state<AppState>({
		file: null,
		fileName: '',
		pageCount: 0,
		options: { ...DEFAULT_OPTIONS },
		isProcessing: false
	});
	return state;
}

export const app = createState();

export function outputFileName(): string {
	if (!app.fileName) return 'slides-notes.pdf';
	const dot = app.fileName.lastIndexOf('.');
	const stem = dot === -1 ? app.fileName : app.fileName.slice(0, dot);
	const tag =
		app.options.layout === 'extend'
			? 'notes'
			: app.options.layout === '3up'
				? '3up'
				: 'all';
	return `${stem}-${tag}.pdf`;
}
