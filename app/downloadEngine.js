const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');
const async = require('async');
const path = require('path');
const { BrowserWindow } = require('electron');
const { download } = require('electron-dl');

// last page http://stanikus.soup.io/since/258895020
// after last page http://stanikus.soup.io/since/258894239?

// config
let soupUrl; // string
let mediaDirectory; // string

const urlsListDirectory = path.resolve(__dirname, 'urlCollections');
const urlListFilePath = path.resolve(
  urlsListDirectory,
  `urlList-${Date.now()}`
);

// starting variables
let q;
let pageCounter = 1;
let allMedia = [];
let downloadSuccess = 0;
let downloadFailse = 0;

function setUpWorkingDirectoryStructure() {
  // console.log('saving file with all urls...');
  if (!fs.existsSync(urlsListDirectory)) {
    console.log(`Creating Directory: ${urlsListDirectory}`);
    fs.mkdirSync(urlsListDirectory);
  }

  if (!fs.existsSync(mediaDirectory)) {
    console.log(`Creating Directory: ${mediaDirectory}`);
    fs.mkdirSync(mediaDirectory);
  }
}

function writeUrlListFile() {
  fs.writeFileSync(urlListFilePath, allMedia.join('\n'));
  console.log('file saved');
}

async function downloadFile(task) {
  return (
    download(BrowserWindow.getAllWindows()[0], task.url, {
      saveAs: false,
      directory: mediaDirectory
    })
      // eslint-disable-next-line promise/always-return
      .then(() => {
        downloadSuccess += 1;
      })
      .catch(e => {
        downloadFailse += 1;
        console.error(e);
      })
  );
}

function proceedElement(elem) {
  // console.log(elem);
  const url = elem.attribs.src;
  console.log(url);
  allMedia.push(url);
  // push a new line into the queue to be processed
  q.push({ url });
}

async function fetchUntilEnd(url) {
  let respond;
  try {
    respond = await axios.get(url, { timeout: 3 * 60 * 1000 });
    // const respond = await axios.get('http://stanikus.soup.io/since/258894239');
  } catch (e) {
    if (e.code === 'ETIMEDOUT') {
      throw Error(`Timeout fetching ${url}`);
    }
  }
  // todo what if respond isn't ok
  if (respond.statusText !== 'OK') {
    console.error(`Not OK server respond, status: ${respond.status}`);
    throw Error(`Not OK server respond, status: ${respond.status}`);
  }
  const $ = cheerio.load(respond.data);

  $('.imagecontainer img').each((i, elem) => proceedElement(elem));
  $('video').each((i, elem) => proceedElement(elem));

  const end = $('#new-future').children().length > 0;

  if (end) {
    console.log(`end of soup, this page is last: ${pageCounter}`);
    writeUrlListFile();
  } else {
    const newUrl = $('#load_more strong a')
      .prop('href')
      .split('?')[0];

    pageCounter += 1;
    console.log(`fetching page ${pageCounter}: ${soupUrl + newUrl}`);
    // console.log(soupUrl + newUrl);
    await fetchUntilEnd(soupUrl + newUrl).catch(e => {
      throw e;
    });
  }
}

export default function startDownloadingContent(
  username,
  downloadDirectory,
  parallelDownloads,
  finishCallback
) {
  soupUrl = `http://${username}.soup.io`;
  mediaDirectory = downloadDirectory;

  // reset starting variables
  pageCounter = 1;
  allMedia = [];
  downloadSuccess = 0;
  downloadFailse = 0;
  q = async.queue(downloadFile, parallelDownloads);
  q.error((e, task) => {
    console.error('error in taks', task);
    console.error(e);
  });

  setUpWorkingDirectoryStructure();
  console.log('Fetching home page, page 1');
  fetchUntilEnd(soupUrl, finishCallback)
    // eslint-disable-next-line promise/always-return
    .then(() => {
      finishCallback(downloadSuccess, downloadFailse);
    })
    .catch(error => {
      console.error(error);
      finishCallback(downloadSuccess, downloadFailse);
    });
}
