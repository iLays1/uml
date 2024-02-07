const ScrapFiles = require('./_scrap_files.js');

async function main() {
	let link = '';
	if (process.argv.length >= 3) {
		link = process.argv[2];
	} else {
		console.log('a link is needed');
		return;
	}

	let options = ScrapFiles.options_obj_create();
	options.list_rewrite_these_files = [link];
	options.create_jam_list_file = false;
	options.use_jam_list_json = true;

	await ScrapFiles.main(options);
}

main();
