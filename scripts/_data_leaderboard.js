const SF = require('./_shared_functions');

module.exports = {
	main: main,
}

const NUM_OF_JAMMER_PER_PAGE = 100;

const INPUT_MINI_JAM_FOLDER_PATH = './scrapped_files/mini_jam/';
const INPUT_MAJOR_JAM_FOLDER_PATH = './scrapped_files/major_jam/';
const INPUT_JAM_LIST_PATH = './scrapped_files/jam_list/';
const OUTPUT_FOLDER_PATH = '../docs/_data_files/leaderboard_data/';

async function main() {
	let list_both_jam = await SF.read_json(INPUT_JAM_LIST_PATH + 'jam_list.json');

	let table_of_content = [];

	{
		let toc_data = await create_files(9999999, list_both_jam, OUTPUT_FOLDER_PATH + 'all/');
		toc_data_process(table_of_content, toc_data, 'all');
	}

	{
		let toc_data = await create_files(1, list_both_jam, OUTPUT_FOLDER_PATH + 'by_game_in_top_1/');
		toc_data_process(table_of_content, toc_data, '_1');
	}

	{
		let toc_data = await create_files(5, list_both_jam, OUTPUT_FOLDER_PATH + 'by_game_in_top_5/');
		toc_data_process(table_of_content, toc_data, '_5');
	}

	{
		let toc_data = await create_files(10, list_both_jam, OUTPUT_FOLDER_PATH + 'by_game_in_top_10/');
		toc_data_process(table_of_content, toc_data, '_10');
	}

	{
		let toc_data = await create_files(20, list_both_jam, OUTPUT_FOLDER_PATH + 'by_game_in_top_20/');
		toc_data_process(table_of_content, toc_data, '_20');
	}

	await SF.write_json(table_of_content, OUTPUT_FOLDER_PATH, 'table_of_content.json');
}

// main();



async function create_files(max_rank, list_both_jam, output_folder) {
	let toc_data = [];
	let list_result = [];
	let num_of_mini_jam = list_both_jam.list_mini_jam.length;
	let num_of_major_jam = list_both_jam.list_major_jam.length;

	// Push datas from major jam into list_result
	for (let i = 0; i < num_of_major_jam; i++) {
		let jam_id = i + 1;
		let jam_name_and_link = get_jam_name_and_link(list_both_jam.list_major_jam, jam_id);
		let jam_name = jam_name_and_link.jam_name;
		let jam_link = jam_name_and_link.jam_link;
		await push_data_from_file_into_list(list_result, max_rank,
							INPUT_MAJOR_JAM_FOLDER_PATH + 'major_jam_' + SF.int_to_str(jam_id) + '.json', 
							'major_jam', jam_id, jam_name, jam_link);
	}

	// Push datas from mini jam into list_result
	for (let i = 0; i < num_of_mini_jam; i++) {
		let jam_id = i + 1;
		let jam_name_and_link = get_jam_name_and_link(list_both_jam.list_mini_jam, jam_id);
		let jam_name = jam_name_and_link.jam_name;
		let jam_link = jam_name_and_link.jam_link;
		await push_data_from_file_into_list(list_result, max_rank,
							INPUT_MINI_JAM_FOLDER_PATH + 'mini_jam_' + SF.int_to_str(jam_id) + '.json', 
							'mini_jam', jam_id, jam_name, jam_link);
	}

	// Sort list_result.jammer.list_game_sorted
	for (let i = 0; i < list_result.length; i++) {
		let jammer = list_result[i];
		jammer.list_game_sorted.sort((a, b) => {
			if (a.rank - b.rank != 0) {
				return a.rank - b.rank;
			}

			return b.score - a.score;
		});
	}

	// Sort the jammers
	// The if block is so the all leaderboard, which have max_rank of 9999999 is not sorted
	if (max_rank <= 100) {
		list_result.sort((a, b) => {
			let b_sub_a = b.list_game_sorted.length - a.list_game_sorted.length;
			if (b_sub_a != 0) {
				return b_sub_a;
			}

			let rank_sum_a = 0;
			let rank_sum_b = 0;
			for (let i = 0; i < a.list_game_sorted.length; i++) {
				rank_sum_a += a.list_game_sorted[i].rank;
			}
			for (let i = 0; i < b.list_game_sorted.length; i++) {
				rank_sum_b += b.list_game_sorted[i].rank;
			}
			if (rank_sum_a - rank_sum_b != 0) {
				return rank_sum_a - rank_sum_b;
			}

			let score_sum_a = 0;
			let score_sum_b = 0;
			for (let i = 0; i < a.list_game_sorted.length; i++) {
				score_sum_a += a.list_game_sorted[i].score;
			}
			for (let i = 0; i < b.list_game_sorted.length; i++) {
				score_sum_b += b.list_game_sorted[i].score;
			}
			return score_sum_b - score_sum_a;
		});
	}

	// Write files and modify toc_data
	// toc_data (toc means table of content) is used to lookup jammer fastly in the jammer page
	for (let i = 0; i < Math.ceil(list_result.length / NUM_OF_JAMMER_PER_PAGE); i++) {
		let list_write = [];
		for (let j = i*NUM_OF_JAMMER_PER_PAGE; j < (i+1)*NUM_OF_JAMMER_PER_PAGE; j++) {
			if (j >= list_result.length) {
				break;
			}
			toc_data.push({
				jammer_link: list_result[j].jammer_link,
				page: i,
				index: list_write.length,
			});

			list_write.push(list_result[j]);
		}
		await SF.write_json(list_write, output_folder, 'page_' + SF.int_to_str(i) + '.json');
	}

	

	let other_data = create_other_data(list_result);
	await SF.write_json(other_data, output_folder, 'other_data.json');

	return toc_data;
}

function create_other_data(list) {
	let num_of_game = 0;
	let num_of_majorjammer = 0;
	let num_of_minijammer = 0;
	for (let i = 0; i < list.length; i++) {
		let jammer = list[i];

		num_of_game += list[i].list_game_sorted.length;

		let major_jam_tagged = false;
		let mini_jam_tagged = false;
		for (let j = 0; j < jammer.list_game_sorted.length; j++) {
			let game = jammer.list_game_sorted[j];
			if (!major_jam_tagged && game.jam_type == 'major_jam') {
				major_jam_tagged = true;
				num_of_majorjammer++;
			}
			if (!mini_jam_tagged && game.jam_type == 'mini_jam') {
				mini_jam_tagged = true;
				num_of_minijammer++;
			}
		}
	}

	let other_data = {
		num_of_jammer: list.length,
		num_of_majorjammer: num_of_majorjammer,
		num_of_minijammer: num_of_minijammer,
		num_of_game: num_of_game,
		num_of_page: Math.ceil(list.length / NUM_OF_JAMMER_PER_PAGE),
		num_of_jammer_per_page: NUM_OF_JAMMER_PER_PAGE,
	}

	return other_data;
}

function get_jam_name_and_link(jam_list, jam_id) {
	let index = jam_list.length - jam_id;
	return {
		jam_name: jam_list[index].jam_name,
		jam_link: jam_list[index].link,
	}
}

async function push_data_from_file_into_list(list, max_rank, path, jam_type, jam_id, jam_name, jam_link) {
	let jam_data = await SF.read_json(path);

	for (let j = 0; j < jam_data.length; j++) {
		let game_data = jam_data[j];
		if (game_data.rank > max_rank) {
			continue;
		}
		
		for (let i_by = 0; i_by < game_data.by.length; i_by++) {
			let by = game_data.by[i_by];
			let by_link = game_data.by_link[i_by];
			let index = find_jammer_link_in_list(list, by_link);
			// This look like duplicate code but hear me out, if I make a function that return a jammer object
			// and push that object into list, The code will look pretty much the same. So I just leave it
			// like this
			if (index == -1) {
				list.push({
					jammer: by,
					jammer_link: by_link,
					list_game_sorted: [{
						jam_type: jam_type,
						jam_id: jam_id,
						jam_name: jam_name,
						jam_link: jam_link,
						title: game_data.title,
						title_link: game_data.title_link,
						submission_page_link: game_data.submission_page_link,
						by: game_data.by,
						by_link: game_data.by_link,
						rank: game_data.rank,
						ratings: game_data.ratings,
						score: game_data.score,
					}],
				});
			} else {
				list[index].list_game_sorted.push({
					jam_type: jam_type,
					jam_id: jam_id,
					jam_name: jam_name,
					jam_link: jam_link,
					title: game_data.title,
					title_link: game_data.title_link,
					submission_page_link: game_data.submission_page_link,
					by: game_data.by,
					by_link: game_data.by_link,
					rank: game_data.rank,
					ratings: game_data.ratings,
					score: game_data.score,
				});
			}
		}
	} 
}

function toc_data_process(table_of_content, toc_data, type) {
	for (let i = 0; i < toc_data.length; i++) {
		let jammer = toc_data[i];
		push_to_table_of_content(table_of_content, jammer.jammer_link, type, jammer.page, jammer.index);
	}
}

function push_to_table_of_content(table_of_content, jammer_link, type, page, index) {
	let i = find_jammer_link_in_list(table_of_content, jammer_link);

	if (i == -1) {
		let data = {
			jammer_link: jammer_link,
		};
		data[type] = {
			page: page,
			index: index,
		};
		table_of_content.push(data);

		return;
	}

	table_of_content[i][type] = {
		page: page,
		index: index,
	}
}

function find_jammer_link_in_list(list, jammer_link) {
	for (let i = 0; i < list.length; i++) {
		if (list[i].jammer_link == jammer_link) {
			return i;
		}
	}
	return -1;
}
