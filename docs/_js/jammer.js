const INPUT_FOLDER_PATH = './_data_files/leaderboard_data/';

async function main() {
	let url = window.location.href;
	if (url.indexOf('?jammer=') == -1) {
		window.location.replace('./jammer_search.html');
		return;
	}
	
	let jammer_name_h1 = document.querySelector('#jammer_name');
	let jammer_link_a = document.querySelector('#jammer_link');
	let result_div = document.querySelector('#result');

	let toc = await get_json(INPUT_FOLDER_PATH + 'table_of_content.json');
	let jammer_link = get_page_jammer_link();
	let page_ref = get_page_ref(toc, jammer_link);
	
	if (page_ref == -1) {
		jammer_name_h1.innerHTML = 'Not found';
		return;
	}

	let other_data = await get_json(INPUT_FOLDER_PATH + 'all/other_data.json');
	let jammer_page = await get_json(INPUT_FOLDER_PATH + 'all/page_' + int_to_str(page_ref.all.page) + '.json');
	let jammer_data = jammer_page[page_ref.all.index];
	jammer_name_h1.innerHTML = jammer_data.jammer;
	jammer_link_a.innerHTML = get_jammer_short_link(jammer_data.jammer_link);
	jammer_link_a.href = jammer_data.jammer_link;

	if (page_ref.hasOwnProperty('_1')) {
		await leaderboard_data(page_ref._1.page, page_ref._1.index, other_data.num_of_jammer_per_page,
									INPUT_FOLDER_PATH + 'by_game_in_top_1/',
									'Rank by game in top 1');
	}
	if (page_ref.hasOwnProperty('_5')) {
		await leaderboard_data(page_ref._5.page, page_ref._5.index, other_data.num_of_jammer_per_page,
									INPUT_FOLDER_PATH + 'by_game_in_top_5/',
									'Rank by game in top 5');
	}
	if (page_ref.hasOwnProperty('_10')) {
		await leaderboard_data(page_ref._10.page, page_ref._10.index, other_data.num_of_jammer_per_page,
									INPUT_FOLDER_PATH + 'by_game_in_top_10/',
									'Rank by game in top 10');
	}
	if (page_ref.hasOwnProperty('_20')) {
		await leaderboard_data(page_ref._20.page, page_ref._20.index, other_data.num_of_jammer_per_page,
									INPUT_FOLDER_PATH + 'by_game_in_top_20/',
									'Rank by game in top 20');
	}

	let h3 = document.createElement('h3');
	h3.innerHTML = 'Games';
	result_div.append(h3);
	game_list(jammer_data);
}

main();



function game_list_first_row(game_list) {
	let game = document.createElement('span');
	game.classList.add('game');

	game.append(span('Title', 'title'));
	game.append(span('By', 'by_list'));
	game.append(span('Jam', 'jam'));
	game.append(span('Rank', 'rank'));
	game.append(span('Ratings', 'ratings'));
	game.append(span('Score', 'score'));

	game_list.append(game);
}

function game_list(jammer_data) {
	let result_div = document.querySelector('#result');

	let game_list = document.createElement('div');
	game_list.classList.add('game_list');
	game_list_first_row(game_list);

	for (let i = 0; i < jammer_data.list_game_sorted.length; i++) {
		let obj_game = jammer_data.list_game_sorted[i];

		let game = document.createElement('span');
		game.classList.add('game');

		let title_a = document.createElement('a');
		title_a.append(obj_game.title);
		title_a.href = obj_game.title_link;
		let title = span(title_a, 'title');

		if (obj_game.jam_type == 'major_jam') {
			let major_jam_tag = span('Major Jam', 'major_jam_tag');
			title.append(major_jam_tag);
		}

		let by_list = document.createElement('span');
		by_list.classList.add('by_list');
		for (let i = 0; i < obj_game.by.length; i++) {
			let by = obj_game.by[i];
			let by_link = obj_game.by_link[i];
			let a = document.createElement('a');
			a.innerHTML = by;
			a.href = by_link;
			by_list.append(a);
			if (i != obj_game.by.length - 1) {
				by_list.append(', ');
			}
		}

		let jam_a = document.createElement('a');
		jam_a.innerHTML = get_jam_name(obj_game.jam_name, obj_game.jam_id, obj_game.jam_type);
		jam_a.href = obj_game.jam_link;
		let jam = span(jam_a, 'jam');

		let rank = span(obj_game.rank, 'rank');

		let ratings = span(obj_game.ratings, 'ratings');

		let score = span(obj_game.score, 'score');

		game.append(title);
		game.append(by_list);
		game.append(jam);
		game.append(rank);
		game.append(ratings);
		game.append(score);

		game_list.append(game);
	}

	result_div.append(game_list);
}

function span(append, class_name) {
	let span = document.createElement('span');
	span.classList.add(class_name);
	span.append(append);
	return span;
}

async function leaderboard_data(page, index, num_of_jammer_per_page, input_folder_path, h3_text) {
	let result_div = document.querySelector('#result');
	let jammer_page = await get_json(input_folder_path + 'page_' + int_to_str(page) + '.json');
	let jammer_data = jammer_page[index];

	let h3 = document.createElement('h3');
	h3.innerHTML = h3_text;
	result_div.append(h3);

	let p = document.createElement('p');
	p.innerHTML = 'Rank: ' + (num_of_jammer_per_page*page + index + 1);
	result_div.append(p);

	result_div.append(get_rank_list(jammer_data));
}

function get_rank_list(jammer_data) {
	let rank_list = document.createElement('span');
	rank_list.classList.add('rank_list');

	for (let i = 0; i < jammer_data.list_game_sorted.length; i++) {
		let game = jammer_data.list_game_sorted[i];
		let span = document.createElement('span');
		span.innerHTML = game.rank;
		rank_list.append(span);
	}

	return rank_list;
}

function get_page_ref(toc, jammer_link) {
	for (let i = 0; i < toc.length; i++) {
		let jammer = toc[i];
		if (get_jammer_short_link(jammer.jammer_link) == jammer_link) {
			return jammer;
		}
	}

	return -1;
}

function get_jammer_short_link(link) {
	link = link.replaceAll('https://', '');
	if (link[link.length - 1] == '/') {
		link = link.slice(0, link.length - 1);
	}
	return link;
}

function get_page_jammer_link() {
	let url = window.location.href;
	let index = url.indexOf('jammer=') + 7;
	if (index - 7 == -1) {
		return 0;
	}
	return url.slice(index, url.length).replaceAll('%22', '');
}

async function get_json(link) {
	let data = [];

	await fetch(link)
	.then(res => res.json())
	.then(out => data = out)
	.catch(err => { throw err });

	return data;
}

function int_to_str(num) {
	return ('000000' + num).slice(-4);
};

function get_jam_name(jam_name, jam_id, jam_type) {
	if (jam_type == 'major_jam') {
		let colon_pos = jam_name.indexOf(':');
		if (colon_pos != -1) {
			jam_name = jam_name.slice(colon_pos + 2, jam_name.length);
		}
	}

	return (jam_type == 'major_jam' ? 'Major Jam ' : 'Mini Jam ') + jam_id + ': ' + jam_name;
}
