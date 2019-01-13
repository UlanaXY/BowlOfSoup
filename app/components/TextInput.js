// @flow
import React, { Component } from 'react';
import styles from './TextInput.css';

type Props = {};

export default class Home extends Component<Props> {
  props: Props;

  render() {
    return <input type="text" className={styles.textInput} {...this.props} />;
  }
}
