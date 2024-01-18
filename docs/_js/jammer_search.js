let INPUT_FOLDER_PATH = './_data_files/jammer_lookup/';

async function main() {
	if (window.location.href.indexOf('?search=') == -1) {
		return;
	}

	let search_str = get_search_str();
	if (search_str.replaceAll(' ', '') == '') {
		return;
	}

	let search_box = document.querySelector('#search_box');
	search_box.value = search_str;
	await search();
}

main();

window.onpopstate = function(e) {
	if (e.state) {
		main();
	}
};

function on_key_press_search_box(e) {
	let key = e.keyCode || e.which;
	if (key == 13) {
		search();
	}
}

async function search() {	
	let result_div = document.querySelector('#result');
	result_div.innerHTML = '';

	let search_box = document.querySelector('#search_box');
	let str_search = search_box.value;
	if (str_search.replaceAll(' ', '') == '') {
		return;
	}

	if (window.location.href.indexOf('?search=') == -1 || str_search != get_search_str()) {
		change_url(str_search);
	}

	let lookup = await get_json(INPUT_FOLDER_PATH + 'jammer_lookup.json');

	let list_found = [];
	for (let i = 0; i < lookup.length; i++) {
		let jammer = lookup[i];
		let index = jammer.jammer.toLowerCase().indexOf(str_search.toLowerCase());
		if (index != -1) {
			list_found.push(jammer);
			if (list_found.length >= 500) {
				list_found.push('...');
				break;
			}
		}
	}

	datas(list_found);
}

function change_url(str_search) {
	window.history.pushState(window.location.href, '', './jammer_search.html?search="' + str_search + '"');
}

function datas(list_found) {
	let result_div = document.querySelector('#result');
	for (let i = 0; i < list_found.length; i++) {
		if (list_found[i] == '...') {
			let span = document.createElement('span');
			span.innerHTML = '...';
			result_div.append(span);
			break;
		}

		let result = document.createElement('div');
		result.classList.add('result');

		let jammer_link = document.createElement('a');
		jammer_link.classList.add('jammer_link');
		jammer_link.innerHTML = list_found[i].jammer;
		jammer_link.href = list_found[i].jammer_link;
		result.append(jammer_link);

		// let jammer_link_text = document.createElement('a');
		// jammer_link_text.classList.add('jammer_link_text');
		// jammer_link_text.innerHTML = '(' + list_found[i].jammer_link + ')';
		// jammer_link_text.href = list_found[i].jammer_link;
		// result.append(jammer_link_text);

		let jammer_page_link = document.createElement('a');
		jammer_page_link.classList.add('jammer_page');
		jammer_page_link.innerHTML = 'Jammer page';
		jammer_page_link.href = './jammer.html?jammer="' + get_jammer_short_link(list_found[i].jammer_link) + '"';
		result.append(jammer_page_link);

		result_div.append(result);
	}
}

async function get_json(link) {
	let data = [];

	await fetch(link)
	.then(res => res.json())
	.then(out => data = out)
	.catch(err => { throw err });

	return data;
}

function get_jammer_short_link(link) {
	link = link.replaceAll('https://', '');
	if (link[link.length - 1] == '/') {
		link = link.slice(0, link.length - 1);
	}
	return link;
}

function get_search_str() {
	let url = window.location.href;
	let index = url.indexOf('search=') + 7;
	if (index - 7 == -1) {
		return 0;
	}
	return url.slice(index, url.length).replaceAll('%22', '');
}
