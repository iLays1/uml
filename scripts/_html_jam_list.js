const SF = require('./_shared_functions');

module.exports = {
	main: main,
}

const INPUT_MAJOR_JAM_FOLDER_PATH = './data_files/jam_list_data/major_jam/';
const INPUT_MINI_JAM_FOLDER_PATH = './data_files/jam_list_data/mini_jam/';
const INPUT_OTHER_DATA_FOLDER_PATH = './data_files/jam_list_data/';
const OUTPUT_FOLDER_PATH = '../docs/jam_list/';

async function main() {
	let other_data = await SF.read_json(INPUT_OTHER_DATA_FOLDER_PATH + 'other_data.json');
	for (let i = 0; i < other_data.major_jam_num_of_page; i++) {
		let jam_list = await SF.read_json(INPUT_MAJOR_JAM_FOLDER_PATH 
											+ 'major_jam_list_page_' + SF.int_to_str(i) + '.json');
		create_html_file(other_data.major_jam_num_of_page, i, jam_list, 'major_jam');
	}
	for (let i = 0; i < other_data.mini_jam_num_of_page; i++) {
		let jam_list = await SF.read_json(INPUT_MINI_JAM_FOLDER_PATH 
											+ 'mini_jam_list_page_' + SF.int_to_str(i) + '.json');
		create_html_file(other_data.mini_jam_num_of_page, i, jam_list, 'mini_jam');
	}
}

// main();



async function create_html_file(num_of_page, page, jam_list, jam_type) {
	let str_before = SF.html_nav(true) + `
		<h1>List of all jams</h1>`
		+ html_mini_major_links(jam_type)
		+ html_page_links(num_of_page, page, jam_type)
		+ `
		<div id="result">`;
	let str_after = `
		</div>`
		+ html_page_links(num_of_page, page, jam_type);


	let str_html = '';
	for (let i = 0; i < jam_list.length; i++) {
		let jam = jam_list[i];

		let attribs = 'class="jam_title" href="' + jam.link + '"';
		str_html += SF.html_tag('a', SF.get_jam_name(jam.jam_name, jam.id, jam_type), attribs, 3);

		str_html += SF.html_tag('span', jam.num_of_game + ' games', 'class="num_of_game"', 3);
		str_html += SF.html_tag('span', jam.num_of_jammer + ' jammers', 'class="num_of_jammer"', 3);
		str_html += SF.html_tag('span', jam.num_of_new_jammer + ' new jammers', 'class="num_of_new_jammer"', 3);

		str_html += html_game_list(jam.list);
	}

	let full_str_html = SF.add_html_top_bottom(str_before + str_html + str_after, ['../_css/jam_list.css']);
	await SF.write_file_str(full_str_html, OUTPUT_FOLDER_PATH, 
							jam_type + '_page_' + SF.int_to_str(page) + '.html');
}

function html_game_list(game_list) {
	let game_list_inner_html = '';
	game_list_inner_html += html_table_title_row();

	for (let i = 0; i < game_list.length; i++) {
		let game = game_list[i];

		let rank_html = SF.html_tag('span', game.rank, 'class="rank"', 5);

		let title_rank_html = SF.html_tag('span', game.rank + '. ', 'class="title_rank"', 7);
		let a_title_html = SF.html_tag('a', title_rank_html + game.title, 'href="' + game.title_link + '"', 6, true);
		let title_html = SF.html_tag('span', a_title_html, 'class="title"', 5, true);

		let a_by_list_html = '';
		for (let j = 0; j < game.by.length; j++) {
			let by = game.by[j];
			let by_link = game.by_link[j];
			a_by_list_html += SF.html_tag('a', by, 'href="' + by_link + '"', 6);
			if (j != game.by.length - 1) {
				a_by_list_html += ', ';
			}
		}
		let by_list_html = SF.html_tag('span', a_by_list_html, 'class="by_list"', 5, true);

		let ratings_html = SF.html_tag('span', game.ratings, 'class="ratings"', 5);

		let score_html = SF.html_tag('span', game.score, 'class="score"', 5);

		let game_html = SF.html_tag('span', rank_html + title_html + by_list_html + ratings_html + score_html,
										'class="game"', 4, true);

		game_list_inner_html += game_html;
	}

	return SF.html_tag('div', game_list_inner_html, 'class="game_list"', 3);
}

function html_table_title_row() {
	let str_html = '';
	str_html += SF.html_tag('span', 'Rank', 'class="rank"', 5);
	str_html += SF.html_tag('span', 'Title', 'class="title"', 5);
	str_html += SF.html_tag('span', 'By', 'class="by_list"', 5);
	str_html += SF.html_tag('span', 'Ratings', 'class="ratings"', 5);
	str_html += SF.html_tag('span', 'Score', 'class="score"', 5);
	return SF.html_tag('span', str_html, 'class="game"', 4, true);
}

function html_page_links(num_of_page, page, jam_type) {
	let str_html = '';
	for (let i = 0; i < num_of_page; i++) {
		let link = './' + jam_type + '_page_' + SF.int_to_str(i) + '.html';
		let attribs = 'href="' + link + '"';
		if (page == i) {
			attribs += ' class="link_highlight"';
		}
		let a = SF.html_tag('a', i.toString(), attribs, 3);
		str_html += a;
	}
	return SF.html_tag('div', str_html, 'class="page_links"', 2, true);
}

function html_mini_major_links(jam_type) {
	if (jam_type == 'major_jam') {
		return `
		<div id="jam_type">
			<a href="./mini_jam_page_0000.html">Mini Jam</a>
			<a href="./major_jam_page_0000.html" class="link_highlight">Major Jam</a>
		</div>`;
	}

	return `
		<div id="jam_type">
			<a href="./mini_jam_page_0000.html" class="link_highlight">Mini Jam</a>
			<a href="./major_jam_page_0000.html">Major Jam</a>
		</div>`;
}
