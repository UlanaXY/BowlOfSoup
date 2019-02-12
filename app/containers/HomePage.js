// @flow
import React, { Component } from 'react';
import { remote, ipcRenderer } from 'electron';
import path from 'path';
import Home from '../components/Home';

const initialStatusState = {
  numberOfFilesSuccessfullyDownloaded: null,
  numberOfFilesNotDownloaded: null,
  errorMessage: null
};

type Props = {};

export default class HomePage extends Component<Props> {
  props: Props;

  state = {
    // username: 'stanikus', // small soup 150 files;
    username: '',
    numberOfParallelDownloads: 10,
    downloadDirectory: '',
    downloadInProgress: false,
    ...initialStatusState
  };

  componentDidMount() {
    ipcRenderer.on('downloadProgress', (event, arg) => {
      this.setState({
        numberOfFilesSuccessfullyDownloaded: arg.successes,
        numberOfFilesNotDownloaded: arg.fails
      });
    });

    ipcRenderer.on('downloadFinished', (event, arg) => {
      this.setState({
        downloadInProgress: false,
        numberOfFilesSuccessfullyDownloaded: arg.successes,
        numberOfFilesNotDownloaded: arg.fails
      });
    });

    ipcRenderer.on('downloadFailed', (event, arg) => {
      this.setState({
        downloadInProgress: false,
        numberOfFilesSuccessfullyDownloaded: arg.successes,
        numberOfFilesNotDownloaded: arg.fails,
        errorMessage: arg.error
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
      ...initialStatusState
    });
  };

  render() {
    const {
      username,
      numberOfParallelDownloads,
      downloadDirectory,
      downloadInProgress,
      numberOfFilesSuccessfullyDownloaded,
      numberOfFilesNotDownloaded,
      errorMessage
    } = this.state;

    return (
      <Home
        username={username}
        numberOfParallelDownloads={numberOfParallelDownloads}
        downloadDirectory={downloadDirectory}
        downloadInProgress={downloadInProgress}
        numberOfFilesSuccessfullyDownloaded={
          numberOfFilesSuccessfullyDownloaded
        }
        numberOfFilesNotDownloaded={numberOfFilesNotDownloaded}
        errorMessage={errorMessage}
        onUsernameChange={this.onUsernameChange}
        onParallelDownloadsChange={this.onParallelDownloadsChange}
        openFolderSelectionDialog={this.openFolderSelectionDialog}
        onStart={this.onStart}
      />
    );
  }
}
