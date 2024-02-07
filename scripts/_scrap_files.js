const https = require('https');
const jsdom = require('jsdom');
const SF = require('./_shared_functions');

module.exports = {
	options_obj_create: options_obj_create,
	main: main,
}

const API_LINK = 'https://minijamofficial.com/api/fetchMiniJams?n=';

const OUTPUT_JAM_LIST_FOLDER_PATH = './scrapped_files/jam_list/';
const OUTPUT_MAJOR_JAM_FOLDER_PATH = './scrapped_files/major_jam/';
const OUTPUT_MINI_JAM_FOLDER_PATH = './scrapped_files/mini_jam/';

const WAIT_BETWEEN_HTTPS_GETS = 6;

let options = {};
let list_failed_https_gets = [];


function options_obj_create() {
	return {
		wait_between_https_gets: WAIT_BETWEEN_HTTPS_GETS,
		use_jam_list_json: false,
		create_jam_list_file: true,
		create_major_jam_files: true,
		create_mini_jam_files: true,
		create_jam_result_files: true,
		create_submission_time_files: true,
		mini_jam_id_max_cap: 99999999,
		list_rewrite_these_files: [],
	}
}

async function main(in_options) {
	options = in_options;

	let list_major_jam = get_major_jam_list();
	let list_mini_jam = [];
	if (options.use_jam_list_json) {
		list_mini_jam = await get_mini_jam_list_from_json();
	} else {
		list_mini_jam = await get_mini_jam_list(await first_mini_jam_in_api_result_available());
	}

	if (options.list_rewrite_these_files.length == 0) {
		if (!options.use_jam_list_json && options.create_jam_list_file && options.mini_jam_id_max_cap > 10000) {
			SF.write_json({
				list_major_jam: list_major_jam,
				list_mini_jam: list_mini_jam,
			}, OUTPUT_JAM_LIST_FOLDER_PATH, 'jam_list.json');
		}

		if (options.create_major_jam_files && options.mini_jam_id_max_cap > 10000) {
			console.log('creating major jam files');
			for (let i = 0; i < list_major_jam.length; i++) {
				let file_name = 'major_jam_' + SF.int_to_str(list_major_jam[i].id);
				await create_file(list_major_jam[i].link, 
									OUTPUT_MAJOR_JAM_FOLDER_PATH, file_name);
			}
		}
	
		if (options.create_mini_jam_files) {
			console.log('creating mini jam files');
			for (let i = 0; i < list_mini_jam.length; i++) {
				let file_name = 'mini_jam_' + SF.int_to_str(list_mini_jam[i].id);
				await create_file(list_mini_jam[i].link, 
									OUTPUT_MINI_JAM_FOLDER_PATH, file_name);
			}
		}
	} else {
		for (let i = 0; i < options.list_rewrite_these_files.length; i++) {
			let rewrite_link = options.list_rewrite_these_files[i];
			let jam_info = get_jam_info_from_link(list_major_jam, list_mini_jam, rewrite_link);

			let folder_path = OUTPUT_MAJOR_JAM_FOLDER_PATH;
			if (jam_info.type == 'mini_jam') {
				folder_path = OUTPUT_MINI_JAM_FOLDER_PATH;
			}

			await create_file(rewrite_link, folder_path, jam_info.type + '_' + SF.int_to_str(jam_info.id));
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


async function first_mini_jam_in_api_result_available() {
	let jam_info = JSON.parse(await https_get(API_LINK + '0'));
	let page_str = await https_get(jam_info.jamLink[0]);
	let page_dom = new jsdom.JSDOM(page_str);

	let list_header_tab = Array.from(page_dom.window.document.querySelectorAll('.header_tabs > *'));
	for (let i = 0; i < list_header_tab.length; i++) {
		if (list_header_tab[i].innerHTML == 'Results') {
			return true;
		}
	}
	
	return false;
}

function get_jam_info_from_link(list_major_jam, list_mini_jam, link) {
	for (let i = 0; i < list_major_jam.length; i++) {
		let jam = list_major_jam[i];
		if (jam.link == link) {
			return {
				type: 'major_jam',
				id: jam.id,
				jam_name: jam.jam_name,
				link: jam.link,
			}
		}
	}

	for (let i = 0; i < list_mini_jam.length; i++) {
		let jam = list_mini_jam[i];
		if (jam.link == link) {
			return {
				type: 'mini_jam',
				id: jam.id,
				jam_name: jam.jam_name,
				link: jam.link,
			}
		}
	}

	console.log(link + ' not found');
	return null;
}

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

async function get_mini_jam_list(get_first_minijam_in_api) {
	let mini_jam_id_max_cap = options.mini_jam_id_max_cap;
	if (options.list_rewrite_these_files.length != 0) {
		mini_jam_id_max_cap = 9999999;
	}

	let first_data_page_num = get_first_minijam_in_api ? '0' : '1';
	let first_data = JSON.parse(await https_get(API_LINK + first_data_page_num));
	let i_page_start = get_first_minijam_in_api ? 1 : 2;

	let max_jam_id = first_data.jamId[0];
	let max_page = Math.ceil(max_jam_id/9);

	let list = [];

	for (let i = 0; i < first_data.jamId.length; i++) {
		if (first_data.jamId[i] > mini_jam_id_max_cap) {
			continue;
		}
		list.push({
			id: first_data.jamId[i],
			jam_name: first_data.jamName[i].replaceAll('\r', ''),
			link: first_data.jamLink[i].replaceAll('\r', ''),
			image_link: first_data.jamImage[i],
		});
	}

	for (let i_page = i_page_start; i_page <= max_page; i_page++) {
		let data = JSON.parse(await https_get(API_LINK + i_page));
		for (let i = 0; i < data.jamId.length; i++) {
			if (data.jamId[i] > mini_jam_id_max_cap) {
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

async function get_mini_jam_list_from_json() {
	let mini_jam_id_max_cap = options.mini_jam_id_max_cap;
	if (options.list_rewrite_these_files.length != 0) {
		mini_jam_id_max_cap = 9999999;
	}

	let list = [];
	let jam_list_json = await SF.read_json(OUTPUT_JAM_LIST_FOLDER_PATH + 'jam_list.json');

	for (let i = 0; i < jam_list_json.list_mini_jam.length; i++) {
		let jam = jam_list_json.list_mini_jam[i];
		if (jam.id > mini_jam_id_max_cap) {
			continue;
		}
		list.push({
			id: jam.id,
			jam_name: jam.jam_name,
			link: jam.link,
		});
	}

	return list;
}

async function https_get(link) {
	await wait(options.wait_between_https_gets);
	return new Promise((resolve) => {
		https.get(link, { timeout: 0 }, async function(res) {
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
				console.log('retrying')
				resolve(await https_get(link));
				return;
			}

			res.setEncoding('utf8');
			res.on('data', function(data) {
				str_data = str_data + data;
			});
			res.on('end', function() {
				resolve(str_data);
			});
		}).on('error', async function(err) {
			if (err instanceof AggregateError) {
				console.log('http get error: aggregate error:' + err.message);
				console.log(err.errors);
				return;
			}
			console.log('http get error: ' + err);
			console.log('retrying');
			resolve(await https_get(link));
			return;
		});
	});
}

async function wait(time_sec) {
	return new Promise((resolve) => {
		setTimeout(function() { resolve(); }, time_sec*1000);
	});
}

async function create_file(link, folder_path, file_name) {
	let list_game_dom = [];
	let t_vote_start = 0;

	if (options.create_jam_result_files) {
		let list_game_dom_obj = await result_page__get_game_dom_list(link + '/results');
		list_game_dom = list_game_dom_obj.list_game_dom;
		t_vote_start = list_game_dom_obj.t_vote_start;
	} else {
		t_vote_start = await result_page__get_jam_vote_start_time_from_link(link + '/results');
	}

	if (options.create_jam_result_files) {
		list_data = [];
	
		for (let i = 0; i < list_game_dom.length; i++) {
			list_data.push(result_page__get_game_data(list_game_dom[i]));
		}
	
		await SF.write_json(list_data, folder_path, file_name + '.json');
	}

	if (options.create_submission_time_files) {
		let list_publish_time_data = await feed_page__get_game_publish_time_list(link + '/feed');
		await SF.write_json({
			t_vote_start: t_vote_start, 
			list: list_publish_time_data,
		}, folder_path, file_name + '_publish_time.json');
	}
}

async function result_page__get_jam_vote_start_time_from_link(link) {
	let page_0_dom_str = await https_get(link);
	let page_0_dom = new jsdom.JSDOM(page_0_dom_str);
	let t_vote_start = result_page__get_jam_vote_start_time_from_dom(page_0_dom);
	return t_vote_start;
}

async function result_page__get_game_dom_list(link) {
	let page_0_dom_str = await https_get(link);
	let page_0_dom = new jsdom.JSDOM(page_0_dom_str);
	let max_num_page = result_page__get_max_num_page(page_0_dom);
	let t_vote_start = result_page__get_jam_vote_start_time_from_dom(page_0_dom);
	let list_game_dom = [];

	list_game_dom = list_game_dom.concat(Array.from(page_0_dom.window.document.querySelectorAll('.game_rank')));

	for (let i = 2; i <= max_num_page; i++) {
		let paged_link = link + '?page=' + i;
		let str_dom = await https_get(paged_link);
		let dom = new jsdom.JSDOM(str_dom);
		list_game_dom = list_game_dom.concat(Array.from(dom.window.document.querySelectorAll('.game_rank')));
	}

	return {
		t_vote_start: t_vote_start,
		list_game_dom: list_game_dom,
	};
}

function result_page__get_max_num_page(dom) {
	let element = dom.window.document.querySelector('.pager_label a');

	if (element != null) {
		return parseInt(element.innerHTML);
	}

	return 0;
}

function result_page__get_jam_vote_start_time_from_dom(dom) {
	let element = Array.from(dom.window.document.querySelectorAll('.jam_summary .date_format'))[1];
	return Date.parse(element.innerHTML + ' UTC');
}

function result_page__get_game_data(game) {
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

async function feed_page__get_game_publish_time_list(link) {
	let list = [];

	let page_dom_str = await https_get(link);
	let page_dom = new jsdom.JSDOM(page_dom_str);
	while (true) {
		let list_event_row = page_dom.window.document.querySelectorAll('.event_row');
		for (let i = 0; i < list_event_row.length; i++) {
			let event_row = list_event_row[i];
			if (event_row.querySelector('.event_user_action > strong').innerHTML != 'published a game') {
				continue;
			}
			let time_msec = Date.parse(event_row.querySelector('.event_user_action > .event_time').title + ' UTC');
			let game_link = event_row.querySelector('.event_content .object_title').href;
			list.push({
				time: time_msec,
				link: game_link,
			});
		}

		let next_page_link = page_dom.window.document.querySelector('.next_page > a');
		if (next_page_link == null) {
			break;
		}

		page_dom_str = await https_get(link + next_page_link.getAttribute('href'));
		page_dom = new jsdom.JSDOM(page_dom_str);
	}

	return list;
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
