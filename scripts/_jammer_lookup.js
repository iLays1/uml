const SF = require('./_shared_functions');

module.exports = {
	main: main,
}

const INPUT_FOLDER_PATH = "../docs/_data_files/leaderboard_data/all/";
const OUTPUT_FOLDER_PATH = "../docs/_data_files/jammer_lookup/";

async function main() {
	let list_result = [];
	let otherdata = await SF.read_json(INPUT_FOLDER_PATH + 'other_data.json');
	for (let i = 0; i < otherdata.num_of_page; i++) {
		let jammer_list = await SF.read_json(INPUT_FOLDER_PATH + 'page_' + SF.int_to_str(i) + '.json');
		for (let j = 0; j < jammer_list.length; j++) {
			let jammer = jammer_list[j];
			list_result.push({
				jammer: jammer.jammer,
				jammer_link: jammer.jammer_link,
			})
		}
	}
	await SF.write_json(list_result, OUTPUT_FOLDER_PATH, 'jammer_lookup.json');
}

// main();
