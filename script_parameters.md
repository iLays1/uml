# Script parameters
Script parameters are consts defined on the top of the script files. Most of them are self explain. Here I will explain the confusing ones

## scrap_files.js
### GET_FIRST_MINIJAM_IN_API
This is the most important parameter to know about, and probably the most confusing too

So go to https://minijamofficial.com/editions. minijamofficial.com is where the script get the list of minijams. You can see the first jam in the list, sometimes it is a finished jam, sometime it is a not finished jam

Now we dont want to read the data of a not finished jam

So, if the first jam in that page is not finished, you set `GET_FIRST_MINIJAM_IN_API` to `false`

### MINI_JAM_ID_MAX_CAP
Scraping took really long time. Imagine you scraping from Mini Jam 150 to Mini Jam 30 and suddenly there is a Windows Update. Now you dont want to scrap from Mini Jam 150 again dont you?

Set `MINI_JAM_ID_MAX_CAP` to `30`, and the scraping will start from Mini Jam 30 instead

Make sure to set `MINI_JAM_ID_MAX_CAP` back to 9999999 (pick a number larger than 10000) for normal scraping 

### LIST_REWRITE_THESE_FILES
When scraping files, you might sometime get 429 error (too many requests) for some http requests. I mean I am waiting 6 seconds between requests so this shouldnt happen. But just in case, and also there might be other errors

When `scrap_files.js` finished scraping, it will provide you a list of error http requests. You can use `LIST_REWRITE_THESE_FILES` and run `scrap_files.js` again to rescrap only the errored jam pages. There is a commented example in `scrap_files.js`

Make sure to empty `LIST_REWRITE_THESE_FILES` for normal scraping

## Other parameters
There are other parameters in `scrap_files.js` and other script files. But they are self explain so I wont cover them here
