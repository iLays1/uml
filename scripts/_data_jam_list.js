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
		let list_jammer_link_total = []; 
		for (let i = major_jam_num_of_page - 1; i >= 0 ; i--) {
			major_jam_num_of_game += await create_file(i, list_both_jam.list_major_jam,
				INPUT_MAJOR_JAM_FOLDER_PATH + 'major_jam_',
				OUTPUT_MAJOR_JAM_FOLDER_PATH, 
				'major_jam_list_page_' + SF.int_to_str(i) + '.json',
				list_jammer_link_total);
		}
	}

	if (CREATE_MINI_JAM_FILES) {
		let list_jammer_link_total = [];
		for (let i = mini_jam_num_of_page - 1; i >= 0 ; i--) {
			mini_jam_num_of_game += await create_file(i, list_both_jam.list_mini_jam,
				INPUT_MINI_JAM_FOLDER_PATH + 'mini_jam_',
				OUTPUT_MINI_JAM_FOLDER_PATH, 
				'mini_jam_list_page_' + SF.int_to_str(i) + '.json',
				list_jammer_link_total);
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



async function create_file(page, list_jam, input_path_format, output_folder, output_file_name,
							list_jammer_link_total) {
	let num_of_game = 0;
	let list_result = [];
	for (let i = (page+1)*NUM_OF_JAM_PER_PAGE - 1; i >= page*NUM_OF_JAM_PER_PAGE; i--) {
		if (i >= list_jam.length) {
			continue;
		}

		let jam_data = list_jam[i];
		let list_game = await SF.read_json(input_path_format + SF.int_to_str(jam_data.id) + '.json');

		let publish_time_data_json_path = input_path_format + SF.int_to_str(jam_data.id) 
												+ '_publish_time.json';
		let publish_time_data = {};
		let publish_time_file_exist = SF.is_file_exist(publish_time_data_json_path);
		if (publish_time_file_exist) {
			publish_time_data = await SF.read_json(publish_time_data_json_path);
		}

		num_of_game += list_game.length;

		let list_jammer_link = [];
		let list_new_jammer = [];

		let list_game_n = [];
		for (let j = 0; j < list_game.length; j++) {
			let game = list_game[j];

			for (let k = 0; k < game.by_link.length; k++) {
				let by_link = game.by_link[k];
				let by = game.by[k];
				if (!is_in_list(list_jammer_link_total, by_link)) {
					list_jammer_link_total.push(by_link);
					list_new_jammer.push({
						by: by,
						by_link: by_link,
					});
				}
				if (!is_in_list(list_jammer_link, by_link)) {
					list_jammer_link.push(by_link);
				}
			}

			if (j >= NUM_OF_GAME_SHOWN) {
				continue;
			}

			let push_data = {
				title: game.title,
				title_link: game.title_link,
				submission_page_link: game.submission_page_link,
				by: game.by,
				by_link: game.by_link,
				rank: game.rank,
				ratings: game.ratings,
				score: game.score,
			};

			if (publish_time_file_exist) {
				for (let k = 0; k < publish_time_data.list.length; k++) {
					let time = publish_time_data.list[k];
					if (time.link != game.title_link) {
						continue;
					}

					push_data.t_publish_diff = time.time - publish_time_data.t_vote_start;
					break;
				}
			}
			
			list_game_n.push(push_data)
		}
		list_result.push({
			id: jam_data.id,
			jam_name: jam_data.jam_name,
			link: jam_data.link,
			num_of_game: list_game.length,
			num_of_jammer: list_jammer_link.length,
			num_of_new_jammer: list_new_jammer.length,
			list: list_game_n,
		});
	}

	list_result.sort(function(a, b) {
		return b.id - a.id;
	});

	await SF.write_json(list_result, output_folder, output_file_name);

	return num_of_game;
}

function is_in_list(list, by_link) {
	for (let i = 0; i < list.length; i++) {
		if (list[i] == by_link) {
			return true;
		}
	}
	return false;
}
