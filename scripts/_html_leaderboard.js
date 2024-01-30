const SF = require('./_shared_functions');

module.exports = {
	main: main,
}

const INPUT_FOLDER_PATH = '../docs/_data_files/leaderboard_data/';
const OUTPUT_FOLDER_PATH = '../docs/leaderboard/';

async function main() {
	await create_leaderboard_html(INPUT_FOLDER_PATH + 'by_game_in_top_1/', 'leaderboard_1_page_');
	await create_leaderboard_html(INPUT_FOLDER_PATH + 'by_game_in_top_5/', 'leaderboard_5_page_');
	await create_leaderboard_html(INPUT_FOLDER_PATH + 'by_game_in_top_10/', 'leaderboard_10_page_');
	await create_leaderboard_html(INPUT_FOLDER_PATH + 'by_game_in_top_20/', 'leaderboard_20_page_');
}

// main();



async function create_leaderboard_html(input_folder, output_filename_format) {
	let other_data = await SF.read_json(input_folder + 'other_data.json');
	for (let i = 0; i < other_data.num_of_page; i++) {
		let jammer_list = await SF.read_json(input_folder + 'page_' + SF.int_to_str(i) + '.json');
		await create_html_file(i, other_data.num_of_page, other_data.num_of_jammer_per_page, 
								jammer_list, output_filename_format);
	}
}

async function create_html_file(page, num_of_page, num_of_jammer_per_page, jammer_list, output_filename_format) {
	let str_before = SF.html_nav(true) + `
		<h1>Unofficial Mini Jam Leaderboard</h1>`
		+ html_games_that_got_in_top(output_filename_format)
		+ html_page_links(num_of_page, page, output_filename_format)
		+`
		<div id="result">`;
	let str_after = `
		</div>`
		+ html_page_links(num_of_page, page, output_filename_format);

	let str_html = '';
	for (let i = 0; i < jammer_list.length; i++) {
		let jammer = jammer_list[i];

		let jammer_link_attribs = 'class="jammer_link" href="' + jammer.jammer_link + '"';
		let jammer_link_html = SF.html_tag('a', (i+1 + page*num_of_jammer_per_page) + '. ' + jammer.jammer,
											jammer_link_attribs, 3);
		str_html += jammer_link_html;

		let jammer_page_link_attribs = 'class="jammer_page" href="' + '../jammer.html?jammer=%22'
										+ get_jammer_short_link(jammer.jammer_link) + '%22"';
		let jammer_page_link_html = SF.html_tag('a', 'Jammer page', jammer_page_link_attribs, 3);
		str_html += jammer_page_link_html;

		str_html += html_rank_list(jammer.list_game_sorted);

		str_html += html_game_list(jammer.list_game_sorted);
	}

	let full_str_html = SF.add_html_top_bottom(str_before + str_html + str_after, 
												['../_css/jammer_leaderboard.css']);
	await SF.write_file_str(full_str_html, OUTPUT_FOLDER_PATH, 
							output_filename_format + SF.int_to_str(page) + '.html');
}

function html_rank_list(game_list) {
	let str_html = '';
	str_html += `
`;
	str_html += `				`;
	for (let i = 0; i < game_list.length; i++) {
		str_html += '<span>' + game_list[i].rank + '</span>';
	}
	return SF.html_tag('div', str_html, 'class="rank_list"', 3, true);
}

function html_game_list(game_list) {
	let game_list_inner_html = '';
	game_list_inner_html += html_table_title_row();

	for (let i = 0; i < game_list.length; i++) {
		let game = game_list[i];

		let a_title_html = SF.html_tag('a', game.title, 'href="' + game.title_link + '"', 6);
		let title_html = SF.html_tag('span', 
									game.jam_type == 'major_jam' ? a_title_html + html_major_jam_tag() : a_title_html, 
									'class="title"', 5, true);

		let a_by_list_html = '';
		for (let j = 0; j < game.by.length; j++) {
			let by = game.by[j];
			let by_link = game.by_link[j];
			a_by_list_html += SF.html_tag('a', by, 'href="../jammer.html?jammer=%22' 
														+ SF.get_jammer_short_link(by_link) 
														+ '%22"', 6);
			if (j != game.by.length - 1) {
				a_by_list_html += ', ';
			}
		}
		let by_list_html = SF.html_tag('span', a_by_list_html, 'class="by_list"', 5, true);

		let a_jam_html = SF.html_tag('a', SF.get_jam_name(game.jam_name, game.jam_id, game.jam_type),
										'href="' + game.jam_link + '"', 6);
		let jam_html = SF.html_tag('span', a_jam_html, 'class="jam"', 5, true);

		let rank_html = SF.html_tag('span', game.rank, 'class="rank"', 5);

		let ratings_html = SF.html_tag('span', game.ratings, 'class="ratings"', 5);

		let score_html = SF.html_tag('span', game.score, 'class="score"', 5);

		let game_html = SF.html_tag('span', title_html + by_list_html + jam_html + rank_html 
											+ ratings_html + score_html,
											'class="game"', 4, true);

		game_list_inner_html += game_html;
	}

	return SF.html_tag('div', game_list_inner_html, 'class="game_list"', 3);
}

function html_major_jam_tag() {
	return '<span class="major_jam_tag">Major Jam</span>';
}

function html_table_title_row() {
	let str_html = '';
	str_html += SF.html_tag('span', 'Game Title', 'class="title"', 5);
	str_html += SF.html_tag('span', 'By', 'class="by_list"', 5);
	str_html += SF.html_tag('span', 'Jam', 'class="jam"', 5);
	str_html += SF.html_tag('span', 'Rank', 'class="rank"', 5);
	str_html += SF.html_tag('span', 'Ratings', 'class="ratings"', 5);
	str_html += SF.html_tag('span', 'Score', 'class="score"', 5);
	return SF.html_tag('span', str_html, 'class="game"', 4, true);
}

function html_games_that_got_in_top(output_filename_format) {
	if (output_filename_format == 'leaderboard_1_page_') {
		return `
		<div id="games_that_got_in_top">
			<span>Games that got in top: </span>
			<a href="./leaderboard_1_page_0000.html" class="link_highlight">1</a>
			<a href="./leaderboard_5_page_0000.html">5</a>
			<a href="./leaderboard_10_page_0000.html">10</a>
			<a href="./leaderboard_20_page_0000.html">20</a>
		</div>`;
	}
	if (output_filename_format == 'leaderboard_5_page_') {
		return `
		<div id="games_that_got_in_top">
			<span>Games that got in top: </span>
			<a href="./leaderboard_1_page_0000.html">1</a>
			<a href="./leaderboard_5_page_0000.html" class="link_highlight">5</a>
			<a href="./leaderboard_10_page_0000.html">10</a>
			<a href="./leaderboard_20_page_0000.html">20</a>
		</div>`;
	}
	if (output_filename_format == 'leaderboard_10_page_') {
		return `
		<div id="games_that_got_in_top">
			<span>Games that got in top: </span>
			<a href="./leaderboard_1_page_0000.html">1</a>
			<a href="./leaderboard_5_page_0000.html">5</a>
			<a href="./leaderboard_10_page_0000.html" class="link_highlight">10</a>
			<a href="./leaderboard_20_page_0000.html">20</a>
		</div>`;
	}
	if (output_filename_format == 'leaderboard_20_page_') {
		return `
		<div id="games_that_got_in_top">
			<span>Games that got in top: </span>
			<a href="./leaderboard_1_page_0000.html">1</a>
			<a href="./leaderboard_5_page_0000.html">5</a>
			<a href="./leaderboard_10_page_0000.html">10</a>
			<a href="./leaderboard_20_page_0000.html" class="link_highlight">20</a>
		</div>`;
	}
}

function html_page_links(num_of_page, page, output_filename_format) {
	let str_html = '';
	for (let i = 0; i < num_of_page; i++) {
		let link = './' + output_filename_format + SF.int_to_str(i) + '.html';
		let attribs = 'href="' + link + '"';
		if (page == i) {
			attribs += ' class="link_highlight"';
		}
		let a = SF.html_tag('a', i.toString(), attribs, 3);
		str_html += a;
	}
	return SF.html_tag('div', str_html, 'class="page_links"', 2, true);
}

function get_jammer_short_link(link) {
    link = link.replaceAll('https://', '');
    if (link[link.length - 1] == '/') {
        link = link.slice(0, link.length - 1);
    }
    return link;
}
