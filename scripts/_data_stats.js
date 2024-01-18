const SF = require('./_shared_functions');

module.exports = {
	main: main,
}

async function main() {
	let jam_list_other_data = await SF.read_json('./data_files/jam_list_data/other_data.json');
	let leaderboard_other_data = await SF.read_json('../docs/_data_files/leaderboard_data/all/other_data.json');

	let stats = {
		num_of_major_jam: jam_list_other_data.num_of_major_jam,
		num_of_mini_jam: jam_list_other_data.num_of_mini_jam,
		major_jam_num_of_game: jam_list_other_data.major_jam_num_of_game,
		mini_jam_num_of_game: jam_list_other_data.mini_jam_num_of_game,

		num_of_jammer: leaderboard_other_data.num_of_jammer,
	}

	await SF.write_json(stats, './data_files/stats/', 'stats.json');
} 

// main();
