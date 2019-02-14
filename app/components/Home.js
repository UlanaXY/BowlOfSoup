// @flow
import React, { Component } from 'react';
import TextInput from './TextInput';
import { parallelDownloadsSettings } from '../config';
import statuses from '../constants/statusEnum';

import styles from './Home.css';

type Props = {
  username: string,
  numberOfParallelDownloads: number,
  downloadDirectory: string,
  currentStatus: string,
  numberOfFilesSuccessfullyDownloaded: number,
  numberOfFilesNotDownloaded: number,
  errorMessage: string,
  onUsernameChange: Function,
  onParallelDownloadsChange: Function,
  openFolderSelectionDialog: Function,
  onStart: Function,
  onHalt: Function
};

export default class Home extends Component<Props> {
  props: Props;

  renderMessage = () => {
    const {
      currentStatus,
      numberOfFilesSuccessfullyDownloaded,
      numberOfFilesNotDownloaded,
      errorMessage
    } = this.props;

    if (currentStatus === statuses.IDLE) return null;

    if (currentStatus === statuses.FAILED) {
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

    let message = 'Unknown status';
    if (currentStatus === statuses.INPROGRESS) {
      message = 'Download in progress...';
    }
    if (currentStatus === statuses.FINISHED) {
      message = 'Downloading finished';
    }
    if (currentStatus === statuses.HALTED) {
      message = 'Downloading halted';
    }

    return (
      <div className={styles.message}>
        <div>{message}</div>
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
  };

  render() {
    const {
      username,
      numberOfParallelDownloads,
      downloadDirectory,
      currentStatus,
      onUsernameChange,
      onParallelDownloadsChange,
      openFolderSelectionDialog,
      onStart,
      onHalt
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
            <button
              className={styles.choseDirectoryButton}
              type="button"
              onClick={openFolderSelectionDialog}
            >
              Chose Directory
            </button>
            <div className={styles.downloadDirectory}>{downloadDirectory}</div>
          </div>
        </div>

        <div className={styles.buttonsRow}>
          <button
            type="button"
            onClick={onStart}
            disabled={
              currentStatus === statuses.INPROGRESS ||
              downloadDirectory === '' ||
              username === ''
            }
          >
            Start
          </button>
          <button
            className=""
            type="button"
            onClick={onHalt}
            disabled={currentStatus !== statuses.INPROGRESS}
          >
            Cancel
          </button>
        </div>
        {this.renderMessage()}
      </div>
    );
  }
}
