// @flow
import React, { Component } from 'react';
import path from 'path';
import { remote } from 'electron';
import styles from './Home.css';
import TextInput from './TextInput';
import startDownloadingContent from '../downloadEngine';

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
    mediaDirectory: '',
    downloadInProgress: false
  };

  onUsernameChange = e =>
    this.setState({
      username: e.target.value
    });

  onParallelDownloadsChange = e =>
    this.setState({
      numberOfParallelDownloads: e.target.value
    });

  openFolderSelectionDialog = () => {
    const mediaDirectory = remote.dialog.showOpenDialog({
      properties: ['openDirectory']
    });
    this.setState({
      mediaDirectory: path.resolve(mediaDirectory[0], 'BowlOfSoup downloads')
      // mediaDirectory: mediaDirectory[0]
    });
  };

  onStart = () => {
    const { username, numberOfParallelDownloads, mediaDirectory } = this.state;

    startDownloadingContent(
      username,
      numberOfParallelDownloads,
      mediaDirectory,
      () => this.setState({ downloadInProgress: false })
    );
    this.setState({ downloadInProgress: true });
  };

  render() {
    const {
      username,
      numberOfParallelDownloads,
      mediaDirectory,
      downloadInProgress
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
            <span>{mediaDirectory}</span>
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={this.onStart}
            disabled={downloadInProgress || mediaDirectory === ''}
          >
            Start
          </button>
        </div>
        {downloadInProgress && <div>Download in progress...</div>}
      </div>
    );
  }
}
