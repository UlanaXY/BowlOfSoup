const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');
const lazy = require('lazy');
const async = require('async');
const http = require('http');



// last page http://stanikus.soup.io/since/258895020
// after last page http://stanikus.soup.io/since/258894239?

let urlListFilePath = null;
const login = 'ulanaxy';
const soupUrl = `http://${login}.soup.io`;
const urlsListCollection = './urlsListCollection';
let pageCounter = 1;
const allMedia = [];


async function fetchUntilEnd(url) {
    const respond = await axios.get(url);
    // const respond = await axios.get('http://stanikus.soup.io/since/258894239');

    // console.log(respond);
    // todo co jak respond nie jest ok
    if (respond.statusText !== 'OK') {
        console.error(`Not OK server respond, status: ${respond.status}`);
        throw `Not OK server respond, status: ${respond.status}`;
    }
    const $ = cheerio.load(respond.data);

    $('.imagecontainer img').each(function(i, elem) {
        // console.log(elem);
        console.log(elem.attribs.src);
        allMedia.push(elem.attribs.src);
    });

    $('video').each(function(i, elem) {
        // console.log(elem);
        console.log(elem.attribs.src);
        allMedia.push(elem.attribs.src);
    });

    let end = $('#new-future').children().length > 0;

    if (end) {
        console.log(`end of soup, this page is last: ${pageCounter}`);
        return true;
    } else {
        let newUrl = $('#load_more strong a').prop('href');
        newUrl = newUrl.split('?')[0];

        pageCounter++;
        console.log(`fetching page ${pageCounter}`);
        console.log(soupUrl + newUrl);
        writeUrlListFile();
        fetchUntilEnd(soupUrl + newUrl)
    }


}

function writeUrlListFile() {
    if (!fs.existsSync(urlsListCollection)) {
        console.log(`Creating Directory: ${urlsListCollection}`);
        fs.mkdirSync(urlsListCollection);
    }

    if (urlListFilePath === null) {
        urlListFilePath = `${urlsListCollection}/urlList-${Date.now()}`;
    }

    fs.writeFile(urlListFilePath, allMedia.join('\n'), (err) => {
        if(err) {
            return console.error(err);
        }
        console.log(`The file was saved: ${urlListFilePath}`);
    });
}

function main() {
    console.log('Fetching home page, page 1');
    fetchUntilEnd(soupUrl)
        .then(() => {
            writeUrlListFile();

    });
    console.log('Downloading complete');
}

main();

//
// let count = 0;
// let souppiccounter = 0;
// let options = {};
// let lastTitle = '';
//
//
// const rssFilesDir = './rssFiles';
// const soupRSSfilpath = process.argv[4]; //'./soup_falk_2013-01-03.rss', // change to reflect yours
// const writeMeta = process.argv[2] != 'false'; // if you want a metadatafile to each image from the soup info
// const parralelDLs = process.argv[3]; // how many pictures will be downloaded in parralel - adjust to soup speed of the day and you connection speed
// const path = process.argv[5]; //'./soupImages/'; // change to reflect yours
//
// // first we check if path exists if it does not we create it - this is synchronous as without a path there is no saving a picture
// if (!fs.existsSync(path)) {
//     console.log('Creating Directory: ' + path);
//     fs.mkdirSync(path);
// }
//
// // some extracting and formating of stuff we found in the rss file - not much but at least a source and some tags and stuff
// function cleverMetadataGenerator(souplineOBJ) {
//     //console.log(souplineOBJ);
//     var sourceArray = new Array(),
//         mainURLArray = new Array(),
//         originalName = '',
//         mainURLName = '',
//         stringedsouplineOBJ = JSON.stringify(souplineOBJ).replace(new RegExp(',', 'g'), '\n').replace(new RegExp('\n', 'g'), '\n\n').replace(new RegExp('["{}]', 'g'), '').replace(new RegExp('(?!:\/\/):', 'g'), ':  ');
//
//     if ('source' in souplineOBJ && souplineOBJ.source != null) {
//         if (souplineOBJ.source.charAt(souplineOBJ.source.toString().length - 1) == '/') {
//             souplineOBJ.source = souplineOBJ.source.slice(0, -1);
//         }
//         var sourceArray = souplineOBJ.source.split('/');
//         var mainURLArray = sourceArray[2].split('.');
//         var mainURLName = mainURLArray[mainURLArray.length - 2];
//         const regex = new RegExp('%..', 'gi');
//         var originalName = sourceArray[sourceArray.length - 1].split('.')[0].replace(regex, '');
//         let newFileName = mainURLName + '-' + originalName;
//         newFileName = newFileName.replace(/\?|\/|\\|\:|"|<|>/g, '-');
//         //console.log(originalName);
//         //console.log(mainURLName + '-' + originalName);
//         //console.log(stringedsouplineOBJ);
//         return {
//             filename: newFileName,
//             stringedSoup: stringedsouplineOBJ
//         };
//     } else {
//         return {
//             filename: '',
//             stringedSoup: stringedsouplineOBJ
//         };
//     }
// }
//
// // take apart the rsscode line
// // if there is a <soup:attributes> tag
// // and inside that (JSON object) a url field
// // start the downloading madness
// // pass down the callback from the queue
//
// function downloader(task, callback) {
//     const soupline = task.line.toString('utf8').match('<soup:attributes>(.*?)</soup:attributes>');
//     const title = task.line.toString('utf8').match('<title>(.*?)</title>');
//     if (title != null) {
//         lastTitle = title[1];
//     }
//     if (soupline != null) {
//         const souplineOBJ = JSON.parse(soupline[1]);
//         if (lastTitle) {
//             souplineOBJ.title = lastTitle;
//         }
//         if ('url' in souplineOBJ && souplineOBJ.url != null) {
//             souppiccounter++;
//
//             const metadata = cleverMetadataGenerator(souplineOBJ);
//
//             const souplineURLArray = souplineOBJ.url.split('/');
//             // console.log(souplineOBJ.url.split("/"));
//             options = {
//                 host: souplineURLArray[2],
//                 port: 80,
//                 path: '/' + souplineURLArray[3] + '/' + souplineURLArray[4] + '/' + souplineURLArray[5]
//             };
//             const fileext = souplineURLArray[5].split('.')[souplineURLArray[5].split('.').length - 1];
//             //console.log(fileext);
//             const request = http.get(options, function (res) {
//                 let imagedata = '';
//                 res.setEncoding('binary');
//
//                 res.on('data', function (chunk) {
//                     imagedata += chunk;
//                 });
//
//                 res.on('end', function () {
//                     //console.log("respnsoe ends", res.socket.parser._header)
//                     //console.log(imagedata.toString())
//                     //write the file
//
//                     const fullpath = path + '/' + metadata.filename + '_' + souplineURLArray[5].split('.')[0];
//
//                     //console.log(new Buffer(imagedata).toString('utf16le',1,1000));
//                     fs.writeFile(fullpath + '.' + fileext, imagedata, 'binary', function (err) {
//                         if (err) throw err;
//                         if (writeMeta) {
//                             //write MetaData Text File
//                             fs.writeFile(fullpath + '.txt', metadata.stringedSoup, 'utf8', function (err) {
//                                 if (err) console.log(err.message);
//                                 console.log('File ' + fullpath + ' and Metadata saved.');
//                                 callback();
//                             });
//                         } else {
//                             console.log('File ' + fullpath + ' saved.');
//                             callback();
//                         }
//
//                     });
//                 });
//             });
//         } else {
//             callback();
//         }
//     } else {
//         callback();
//     }
// }
//
//
// // initialize the process and download queue
//
// const q = async.queue(function (task, callback) {
//     //console.log('Processing task: ' + task.id);
//     downloader(task, callback);
// }, parralelDLs);
//
// //push a new line into the queue to be processed
//
// function processRssLine(line) {
//     count++;
//     q.push({id: count.toString(), line: line}, function (err) {
//         if (err) console.log('ERROR in Queue: ', err.message);
//     });
// }
//
// // if the queue gets empty resume the filestream
//
// q.empty = function () {
//     console.log('NEW BATCH');
//     stream.resume();
// };
//
// // read in the file in chunks process asynchronous as much as possible
// // pause after each chunk cause downloading needs to catch up
// async function getStream() {
//     let fileToRead;
//
//     if (soupRSSfilpath.startsWith('http')) {
//         console.log('star fetch');
//
//         const respond = await axios.get(soupRSSfilpath);
//         // const respond = await axios.get('https://nodejs.org/api/fs.html#fs_class_fs_readstream');
//
//         // console.log(respond);
//         if (respond.statusText !== 'OK') {
//             console.error(`Not OK server respond, status: ${respond.status}`);
//             throw `Not OK server respond, status: ${respond.status}`;
//         }
//
//         console.log('rss file fetched');
//
//         if (!fs.existsSync(rssFilesDir)) {
//             console.log(`Creating Directory: ${rssFilesDir}`);
//             fs.mkdirSync(rssFilesDir);
//         }
//
//         const rssFilePath = `${rssFilesDir}/rssFeed-${Date.now()}`;
//         fs.writeFile(rssFilePath, respond.data, (err) => {
//             if(err) {
//                 return console.log(err);
//             }
//             console.log(`The file was saved: ${rssFilePath}`);
//         });
//
//         fileToRead = rssFilePath
//     } else {
//         fileToRead = soupRSSfilpath;
//     }
//     return fs.createReadStream(fileToRead);
// }
//
//
// getStream()
//     .then(stream => {
//         new lazy(stream)
//             .lines
//             .forEach(line => {
//                 // console.log(line.toString());
//                 stream.pause();
//                 processRssLine(line.toString());
//             });
//
//
//     });
//
//
