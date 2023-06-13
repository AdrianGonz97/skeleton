import { readFileSync } from 'fs';
import { writeFile } from 'fs/promises';
import postcss from 'postcss';
import postcssJs from 'postcss-js';

// Converts a theme's .css file into a .ts file.
export async function convertTheme(name: string) {
	const cssEntryPath = `./src/themes/theme-${name}.css`;
	const css = readFileSync(cssEntryPath, 'utf8');
	const result = postcss().process(css, { from: cssEntryPath });

	const cssInJs = postcssJs.objectify(result.root);

	const properties = { ...cssInJs[':root'] };

	delete cssInJs[':root'];

	const theme = {
		properties: properties,
		extras: { ...cssInJs }
	};

	// Creates the generated CSS-in-JS file
	await writeFile(
		`./src/tailwind/themes/${name}.ts`,
		`import type { Theme } from './index.js';

const ${name} = ${JSON.stringify(theme, undefined, '\t')} satisfies Theme;
	
export default ${name};`
	).catch((e) => console.error(e));
}

convertTheme('vintage');