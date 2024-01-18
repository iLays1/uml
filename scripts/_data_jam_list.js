const SF = require('./_shared_functions');

module.exports = {
	main: main,
}

const NUM_OF_JAM_PER_PAGE = 10;

const INPUT_MINI_JAM_FOLDER_PATH = './scrapped_files/mini_jam/';
const INPUT_MAJOR_JAM_FOLDER_PATH = './scrapped_files/major_jam/';
const INPUT_JAM_LIST_PATH = './scrapped_files/jam_list/';
const OUTPUT_MINI_JAM_FOLDER_PATH = './data_files/jam_list_data/mini_jam/';
const OUTPUT_MAJOR_JAM_FOLDER_PATH = './data_files/jam_list_data/major_jam/';
const OUTPUT_FOLDER_PATH = './data_files/jam_list_data/';

const CREATE_MAJOR_JAM_FILES = true;
const CREATE_MINI_JAM_FILES = true;
const NUM_OF_GAME_SHOWN = 20;

async function main() {
	let list_both_jam = await SF.read_json(INPUT_JAM_LIST_PATH + 'jam_list.json');

	let mini_jam_num_of_page = Math.ceil(list_both_jam.list_mini_jam.length / NUM_OF_JAM_PER_PAGE);
	let mini_jam_num_of_game = 0;
	let major_jam_num_of_page = Math.ceil(list_both_jam.list_major_jam.length / NUM_OF_JAM_PER_PAGE);
	let major_jam_num_of_game = 0;
	
	if (CREATE_MAJOR_JAM_FILES) {
		for (let i = 0; i < major_jam_num_of_page; i++) {
			major_jam_num_of_game += await create_file(i, list_both_jam.list_major_jam,
				INPUT_MAJOR_JAM_FOLDER_PATH + 'major_jam_',
				OUTPUT_MAJOR_JAM_FOLDER_PATH, 
				'major_jam_list_page_' + SF.int_to_str(i) + '.json');
		}
	}

	if (CREATE_MINI_JAM_FILES) {
		for (let i = 0; i < mini_jam_num_of_page; i++) {
			mini_jam_num_of_game += await create_file(i, list_both_jam.list_mini_jam,
				INPUT_MINI_JAM_FOLDER_PATH + 'mini_jam_',
				OUTPUT_MINI_JAM_FOLDER_PATH, 
				'mini_jam_list_page_' + SF.int_to_str(i) + '.json');
		}
	}

	let other_data = {
		major_jam_num_of_page: major_jam_num_of_page,
		mini_jam_num_of_page: mini_jam_num_of_page,

		num_of_major_jam: list_both_jam.list_major_jam.length,
		num_of_mini_jam: list_both_jam.list_mini_jam.length,

		major_jam_num_of_game: major_jam_num_of_game,
		mini_jam_num_of_game: mini_jam_num_of_game,

		num_of_game_shown: NUM_OF_GAME_SHOWN,
	}
	await SF.write_json(other_data, OUTPUT_FOLDER_PATH, 'other_data.json');
}

// main();



async function create_file(page, list_jam, input_path_format, output_folder, output_file_name) {
	let num_of_game = 0;
	let list_result = [];
	for (let i = page*NUM_OF_JAM_PER_PAGE; i < (page+1)*NUM_OF_JAM_PER_PAGE; i++) {
		if (i >= list_jam.length) {
			break;
		}

		let jam_data = list_jam[i];
		let list_game = await SF.read_json(input_path_format + SF.int_to_str(jam_data.id) + '.json');
		num_of_game += list_game.length;
		let list_game_n = [];
		for (let j = 0; j < NUM_OF_GAME_SHOWN; j++) {
			if (j >= list_game.length) {
				break;
			}
			
			let game = list_game[j];
			list_game_n.push({
				title: game.title,
				title_link: game.title_link,
				submission_page_link: game.submission_page_link,
				by: game.by,
				by_link: game.by_link,
				rank: game.rank,
				ratings: game.ratings,
				score: game.score,
			})
		}
		list_result.push({
			id: jam_data.id,
			jam_name: jam_data.jam_name,
			link: jam_data.link,
			list: list_game_n,
		});
	}
	await SF.write_json(list_result, output_folder, output_file_name);

	return num_of_game;
}
