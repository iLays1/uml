const https = require('https');
const jsdom = require('jsdom');
const SF = require('./shared_functions');

const OUTPUT_JAM_LIST_FOLDER_PATH = './scrapped_files/jam_list/';
const OUTPUT_MAJOR_JAM_FOLDER_PATH = './scrapped_files/major_jam/';
const OUTPUT_MINI_JAM_FOLDER_PATH = './scrapped_files/mini_jam/';

const WAIT_BETWEEN_HTTPS_GETS = 3;

const CREATE_JAM_LIST_FILE = true;
const CREATE_MAJOR_JAM_FILES = true;
const CREATE_MINI_JAM_FILES = true;
const MINI_JAM_ID_MAX_CAP = 9999999;
const LIST_REWRITE_THESE_FILES = [
	// {
	//     link: 'https://itch.io/jam/mini-jam-91-ufo',
	//     folder_path: OUTPUT_MINI_JAM_FOLDER_PATH,
	//     file_name: 'mini_jam_0091.json',
	// },
	// {
	//     link: 'https://itch.io/jam/mini-jam-80-cats',
	//     folder_path: OUTPUT_MINI_JAM_FOLDER_PATH,
	//     file_name: 'mini_jam_0080.json',
	// },
	// {
	//     link: 'https://itch.io/jam/mini-jam-60',
	//     folder_path: OUTPUT_MINI_JAM_FOLDER_PATH,
	//     file_name: 'mini_jam_0060.json',
	// },
	// {
	//     link: 'https://itch.io/jam/mini-jam-16-western',
	//     folder_path: OUTPUT_MINI_JAM_FOLDER_PATH,
	//     file_name: 'mini_jam_0016.json',
	// },
];

let list_failed_https_gets = [];

async function main() {
	let list_major_jam = get_major_jam_list();
	let list_jam = await get_jam_list();
	if (CREATE_JAM_LIST_FILE) {
		SF.write_json({
			list_major_jam: list_major_jam,
			list_mini_jam: list_jam,
		}, OUTPUT_JAM_LIST_FOLDER_PATH, 'jam_list.json');
	}

	if (LIST_REWRITE_THESE_FILES.length == 0) {
		if (CREATE_MAJOR_JAM_FILES) {
			console.log('creating major jam files');
			for (let i = 0; i < list_major_jam.length; i++) {
				let file_name = 'major_jam_' + SF.int_to_str(list_major_jam[i].id) + '.json';
				await result_page__create_file(list_major_jam[i].link + '/results', 
													OUTPUT_MAJOR_JAM_FOLDER_PATH, file_name);
			}
		}
	
		if (CREATE_MINI_JAM_FILES) {
			console.log('creating mini jam files');
			for (let i = 0; i < list_jam.length; i++) {
				let file_name = 'mini_jam_' + SF.int_to_str(list_jam[i].id) + '.json';
				await result_page__create_file(list_jam[i].link + '/results', 
													OUTPUT_MINI_JAM_FOLDER_PATH, file_name);
			}
		}
	} else {
		for (let i = 0; i < LIST_REWRITE_THESE_FILES.length; i++) {
			let rewrite = LIST_REWRITE_THESE_FILES[i];
			await result_page__create_file(rewrite.link + '/results', rewrite.folder_path, rewrite.file_name);
		}
	}

	console.log('number of failed https get: ' + list_failed_https_gets.length);
	for (let i = 0; i < list_failed_https_gets.length; i++) {
		console.log('    link: ' + list_failed_https_gets[i].link);
		console.log('    raw headers: ' + list_failed_https_gets[i].raw_headers);
		console.log();
	}
	console.log('SCRIPT FINISHED');
}

main();



function get_major_jam_list() {
	let list = [];

	let add = function(id, jam_name, link) {
		list.push({
			id: id,
			jam_name: jam_name,
			link: link,
		});
	}

	add(6, 'Major Jam 6: Life', 'https://itch.io/jam/major-jam-6-life');
	add(5, 'Major Jam 5: Legends', 'https://itch.io/jam/major-jam-5');
	add(4, 'Major Jam 4: Cosmic', 'https://itch.io/jam/major-jam-4-cosmic');
	add(3, 'Major Jam 3: Retro', 'https://itch.io/jam/major-jam-3');
	add(2, 'Major Jam 2: Love', 'https://itch.io/jam/major-jam-2');
	add(1, 'Major Jam: Isolation', 'https://itch.io/jam/major-jam-isolation');

	return list;
}

async function get_jam_list() {
	let api_link = 'https://minijamofficial.com/api/fetchMiniJams?n=';
	let first_data = JSON.parse(await https_get(api_link + '1'));
	let max_jam_id = first_data.jamId[0];
	let max_page = Math.ceil(max_jam_id/9);

	let list = [];

	for (let i = 0; i < first_data.jamId.length; i++) {
		if (first_data.jamId[i] > MINI_JAM_ID_MAX_CAP) {
			continue;
		}
		list.push({
			id: first_data.jamId[i],
			jam_name: first_data.jamName[i].replaceAll('\r', ''),
			link: first_data.jamLink[i].replaceAll('\r', ''),
			image_link: first_data.jamImage[i],
		});
	}

	for (let i_page = 2; i_page <= max_page; i_page++) {
		let data = JSON.parse(await https_get(api_link + i_page));
		for (let i = 0; i < data.jamId.length; i++) {
			if (data.jamId[i] > MINI_JAM_ID_MAX_CAP) {
				continue;
			}
			list.push({
				id: data.jamId[i],
				jam_name: data.jamName[i].replaceAll('\r', ''),
				link: data.jamLink[i].replaceAll('\r', ''),
				image_link: data.jamImage[i],
			});
		}
	}

	console.log('----------------------------------------------------');
	console.log('number of jams: ' + list.length);
	console.log('the last jam id is ' + list[list.length-1].id);
	console.log('if this value is not 1 then the script have bug, please report it to me')
	console.log('----------------------------------------------------');

	return list;
}

async function https_get(link) {
	await wait(WAIT_BETWEEN_HTTPS_GETS);
	return new Promise((resolve) => {
		https.get(link, function(res) {
			let str_data = '';

			if (res.statusCode != 200) {
				console.log('----------------------------------------------------');
			}
			console.log('    ' + link + '  status code: ' + res.statusCode);
			if (res.statusCode != 200) {
				console.log(res.rawHeaders);
				console.log('----------------------------------------------------');
			}

			if (res.statusCode != 200) {
				list_failed_https_gets.push({
					link: link,
					raw_headers: res.rawHeaders,
				});
			}

			res.setEncoding('utf8');
			res.on('data', function(data) {
				str_data = str_data + data;
			});
			res.on('end', function() {
				resolve(str_data);
			});
		}).on('error', function(err) {
			console.log('http get error: ' + err);
		});
	});
}

async function wait(time_sec) {
	return new Promise((resolve) => {
		setTimeout(function() { resolve(); }, time_sec*1000);
	});
}

async function result_page__create_file(link, folder_path, file_name) {
	let list_game_dom = await result_page__get_game_dom_list(link);

	list_data = [];
	
	for (let i = 0; i < list_game_dom.length; i++) {
		list_data.push(result_page__get_game_data(i, list_game_dom[i]));
	}

	await SF.write_json(list_data, folder_path, file_name);
}

async function result_page__get_game_dom_list(link) {
	let page_0_dom_str = await https_get(link);
	let page_0_dom = new jsdom.JSDOM(page_0_dom_str);
	let max_num_page = result_page__get_max_num_page(page_0_dom);
	let list_game_dom = [];

	list_game_dom = list_game_dom.concat(Array.from(page_0_dom.window.document.querySelectorAll('.game_rank')));

	for (let i = 2; i <= max_num_page; i++) {
		let paged_link = link + '?page=' + i;
		let str_dom = await https_get(paged_link);
		let dom = new jsdom.JSDOM(str_dom);
		list_game_dom = list_game_dom.concat(Array.from(dom.window.document.querySelectorAll('.game_rank')));
	}

	return list_game_dom;
}

function result_page__get_max_num_page(dom) {
	let element = dom.window.document.querySelector('.pager_label a');

	if (element != null) {
		return parseInt(element.innerHTML);
	}

	return 0;
}

function result_page__get_game_data(i, game) {
	let summary = game.querySelector('.game_summary');
	let table = game.querySelector('.ranking_results_table');

	let data = {
		title: summary.querySelector('h2 a').innerHTML,
		title_link: summary.querySelector('h2 a').href,
		submission_page_link: 'https://itch.io' + summary.querySelector('p a').href,
		by: game_data__get_by(summary.querySelector('h3')),
		by_link: game_data__get_by_link(summary.querySelector('h3')),
		rank: game_data__get_rank(summary.querySelectorAll('h3')[1].innerHTML),
		ratings: game_data__get_num_of_rating(summary.querySelectorAll('h3')[1].innerHTML),
		score: game_data__get_score(summary.querySelectorAll('h3')[1].textContent),

		table_data: game_data__get_table_data(table),
	};

	return data;
}

function game_data__get_table_data(table) {
	let get_row_data = function(tr) {
		let list_td = Array.from(tr.querySelectorAll('td'));
		let has_a = list_td[0].querySelector('a') != null;

		let row_data = {
			criteria: game_data__get_criteria(has_a, list_td[0].innerHTML),
			rank: parseInt(list_td[1].innerHTML.replaceAll('#', '')),
			score: parseFloat(list_td[2].innerHTML),
			raw_score: parseFloat(list_td[3].innerHTML),
		}

		return row_data;
	}

	let list_tr = Array.from(table.querySelectorAll('tr'));
	let table_data = [];
	
	for (let i = 1; i < list_tr.length; i++) {
		table_data.push(get_row_data(list_tr[i]));
	}

	return table_data;
}

function game_data__get_criteria(has_a, str) {
	if (has_a) {
		str = str_remove_between(str, '<', '>');
		str = str_remove_between(str, '<', '>');
		str = str.replaceAll('<', '');
		str = str.replaceAll('>', '');
	}
	return str;
}

function game_data__get_by(element) {
	let list = [];
	let list_a = Array.from(element.querySelectorAll('a'));
	for (let i = 0; i < list_a.length; i++) {
		list.push(list_a[i].innerHTML);
	}
	return list;
}

function game_data__get_by_link(element) {
	let list = [];
	let list_a = Array.from(element.querySelectorAll('a'));
	for (let i = 0; i < list_a.length; i++) {
		list.push(list_a[i].href);
	}
	return list;
}

function game_data__get_rank(str) {
	str = str_get_between(str, 'Ranked', '</strong>');
	str = str_only_nums(str);
	return parseInt(str);
}

function game_data__get_num_of_rating(str) {
	str = str_remove_tag(str, 'strong');
	str = str_remove_between(str, '(', ')');
	str = str.replaceAll('Ranked', '');
	str = str.replaceAll('with', '');
	str = str.replaceAll('ratings', '');
	str = str.replaceAll('rating', '');
	str = str.replaceAll(' ', '');
	return parseInt(str);
}

function game_data__get_score(str) {
	str = str_get_between(str, '(', ')');
	str = str.replaceAll('Score:', '');
	str = str.replaceAll(' ', '');
	return parseFloat(str);
}

function str_remove_tag(str, tag) {
	let start = str.indexOf('<' + tag);
	let end = str.indexOf('</' + tag + '>') + tag.length + 3;
	return str.slice(0, start) + str.slice(end, str.length);
}

function str_remove_between(str, strstart, strend) {
	let start = str.indexOf(strstart);
	let end = str.indexOf(strend) + strend.length;
	return str.slice(0, start) + str.slice(end, str.length);
}

function str_get_between(str, strstart, strend) {
	let start = str.indexOf(strstart);
	let end = str.indexOf(strend) + strend.length;
	return str.slice(start + strstart.length, end - strend.length);
}

function str_only_nums(str) {
	return str.replace(/\D/g, '');
}
