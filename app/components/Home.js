// @flow
import React, { Component } from 'react';
import TextInput from './TextInput';
import { parallelDownloadsSettings } from '../config';

import styles from './Home.css';

type Props = {
  username: string,
  numberOfParallelDownloads: number,
  downloadDirectory: string,
  downloadInProgress: boolean,
  numberOfFilesSuccessfullyDownloaded: number,
  numberOfFilesNotDownloaded: number,
  errorMessage: string,
  onUsernameChange: Function,
  onParallelDownloadsChange: Function,
  openFolderSelectionDialog: Function,
  onStart: Function
};

export default class Home extends Component<Props> {
  props: Props;

  renderMessage = () => {
    const {
      downloadInProgress,
      numberOfFilesSuccessfullyDownloaded,
      numberOfFilesNotDownloaded,
      errorMessage
    } = this.props;

    if (downloadInProgress) {
      return (
        <div className={styles.message}>
          <div>Download in progress...</div>
          <div>
            <span>Files downloaded successfully:&nbsp;</span>
            <span>{numberOfFilesSuccessfullyDownloaded || '0'}</span>
          </div>
          <div>
            <span>Files not downloaded due to errors:&nbsp;</span>
            <span>{numberOfFilesNotDownloaded || '0'}</span>
          </div>
        </div>
      );
    }
    if (errorMessage !== null) {
      return (
        <div className={styles.message}>
          <div className={styles.errorMessage}>
            <div>There was an error:</div>
            <div>{errorMessage}</div>
          </div>
          <div>
            <span>Files downloaded successfully:&nbsp;</span>
            <span>{numberOfFilesSuccessfullyDownloaded || '0'}</span>
          </div>
          <div>
            <span>Files not downloaded due to errors:&nbsp;</span>
            <span>{numberOfFilesNotDownloaded || '0'}</span>
          </div>
        </div>
      );
    }
    if (!downloadInProgress && numberOfFilesSuccessfullyDownloaded !== null) {
      return (
        <div className={styles.message}>
          <div>Downloading finished</div>
          <div>
            <span>Files downloaded successfully:&nbsp;</span>
            <span>{numberOfFilesSuccessfullyDownloaded || '0'}</span>
          </div>
          <div>
            <span>Files not downloaded due to errors:&nbsp;</span>
            <span>{numberOfFilesNotDownloaded || '0'}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  render() {
    const {
      username,
      numberOfParallelDownloads,
      downloadDirectory,
      downloadInProgress,
      onUsernameChange,
      onParallelDownloadsChange,
      openFolderSelectionDialog,
      onStart
    } = this.props;

    return (
      <div className={styles.container} data-tid="container">
        <h2>BowlOfSoup</h2>
        <h3>Save your images and videos from soup.io</h3>
        <div className={styles.settingsContainer}>
          <div className={styles.optionBlock}>
            <div className={styles.inputLabel}>Your Username</div>
            <div>
              <TextInput value={username} onChange={onUsernameChange} />
              <span>.soup.io</span>
            </div>
          </div>
          <div className={styles.optionBlock}>
            <div className={styles.inputLabel}>
              Number of parallel downloads
            </div>
            <input
              type="number"
              name="quantity"
              min={parallelDownloadsSettings.min}
              max={parallelDownloadsSettings.max}
              value={numberOfParallelDownloads}
              onChange={onParallelDownloadsChange}
            />
          </div>
          <div className={styles.optionBlock}>
            <div className={styles.inputLabel}>Where to save the files?</div>
            <button type="button" onClick={openFolderSelectionDialog}>
              Chose Directory
            </button>
            <span>{downloadDirectory}</span>
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={onStart}
            disabled={
              downloadInProgress || downloadDirectory === '' || username === ''
            }
          >
            Start
          </button>
        </div>
        {this.renderMessage()}
      </div>
    );
  }
}
