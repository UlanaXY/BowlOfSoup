// @flow
import React, { Component } from 'react';
import path from 'path';
import { remote, ipcRenderer } from 'electron';
import styles from './Home.css';
import TextInput from './TextInput';

type Props = {};

const parallelDownloadsSettings = {
  min: 1,
  max: 50
};

export default class Home extends Component<Props> {
  props: Props;

  state = {
    // username: 'ulanaxy',
    username: 'stanikus',
    // username: '',
    numberOfParallelDownloads: 10,
    downloadDirectory: '',
    downloadInProgress: false,
    numberOfFilesSuccessfullyDownloaded: null,
    numberOfFilesNotDownloaded: null
  };

  componentDidMount() {
    ipcRenderer.on('downloadFinished', (event, arg) => {
      this.setState({
        downloadInProgress: false,
        numberOfFilesSuccessfullyDownloaded: arg.successes,
        numberOfFilesNotDownloaded: arg.fails
      });
    });
  }

  onUsernameChange = e =>
    this.setState({
      username: e.target.value
    });

  onParallelDownloadsChange = e =>
    this.setState({
      numberOfParallelDownloads: e.target.value
    });

  openFolderSelectionDialog = () => {
    const topDirectoryName = 'BowlOfSoup_downloads';
    let selectedPath;

    const downloadDirectory = remote.dialog.showOpenDialog({
      properties: ['openDirectory']
    });

    if (downloadDirectory == null) return null;
    // eslint-disable-next-line prefer-destructuring
    selectedPath = downloadDirectory[0];

    if (path.basename(selectedPath) !== topDirectoryName) {
      selectedPath = path.resolve(selectedPath, topDirectoryName);
    }
    this.setState({
      downloadDirectory: selectedPath
      // downloadDirectory: downloadDirectory[0]
    });
  };

  onStart = () => {
    const {
      username,
      numberOfParallelDownloads,
      downloadDirectory
    } = this.state;

    const args = {
      username,
      downloadDirectory,
      parallelDownloads: numberOfParallelDownloads
    };

    ipcRenderer.send('start-downloading', args);
    this.setState({
      downloadInProgress: true,
      numberOfFilesSuccessfullyDownloaded: null,
      numberOfFilesNotDownloaded: null
    });
  };

  render() {
    const {
      username,
      numberOfParallelDownloads,
      downloadDirectory,
      downloadInProgress,
      numberOfFilesSuccessfullyDownloaded,
      numberOfFilesNotDownloaded
    } = this.state;

    return (
      <div className={styles.container} data-tid="container">
        <h2>BowlOfSoup</h2>
        <h3>Save your images and videos from soup.io</h3>
        <div className={styles.settingsContainer}>
          <div className={styles.optionBlock}>
            <div>Your Username</div>
            <div>
              <TextInput value={username} onChange={this.onUsernameChange} />
              <span>.soup.io</span>
            </div>
          </div>
          <div className={styles.optionBlock}>
            <div>Number of parallel downloads</div>
            <input
              type="number"
              name="quantity"
              min={parallelDownloadsSettings.min}
              max={parallelDownloadsSettings.max}
              value={numberOfParallelDownloads}
              onChange={this.onParallelDownloadsChange}
            />
          </div>
          <div className={styles.optionBlock}>
            <div>Where to save the files?</div>
            <button type="button" onClick={this.openFolderSelectionDialog}>
              Chose Directory
            </button>
            <span>{downloadDirectory}</span>
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={this.onStart}
            disabled={downloadInProgress || downloadDirectory === ''}
          >
            Start
          </button>
        </div>
        {downloadInProgress && <div>Download in progress...</div>}
        {(numberOfFilesSuccessfullyDownloaded !== null ||
          numberOfFilesNotDownloaded !== null) && (
          <div className={styles.summary}>
            <div>
              <span>Files downloaded successfully:&nbsp;</span>
              <span>{numberOfFilesSuccessfullyDownloaded || '0'}</span>
            </div>
            <div>
              <span>Files not downloaded due to errors:&nbsp;</span>
              <span>{numberOfFilesNotDownloaded || '0'}</span>
            </div>
          </div>
        )}
      </div>
    );
  }
}
