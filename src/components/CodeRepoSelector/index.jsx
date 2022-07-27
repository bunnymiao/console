/*
 * This file is part of KubeSphere Console.
 * Copyright (C) 2022 The KubeSphere Console Authors.
 *
 * KubeSphere Console is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * KubeSphere Console is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with KubeSphere Console.  If not, see <https://www.gnu.org/licenses/>.
 */
import React from 'react'
import cs from 'classnames'
import { pick } from 'lodash'
import { Select, Icon } from '@kube-design/components'

import CodeStore from 'stores/codeRepo'

import styles from './index.scss'

export default class CodeRepoSelect extends React.Component {
  constructor(props) {
    super(props)

    this.codeStore = new CodeStore()
    this.state = {
      options: [],
    }
  }

  componentDidMount() {
    this.getRepoList()
  }

  getRepoList = async params => {
    const { devops, cluster, showAllItem } = this.props
    await this.codeStore.fetchList({ devops, cluster, ...params })
    let options = this.codeStore.list.data.map(item => {
      return {
        label: item.name,
        value: item.repoURL,
        icon:
          item.provider === 'bitbucket_server' ? 'bitbucket' : item.provider,
      }
    })

    if (showAllItem) {
      const allItem = {
        label: t('ALL'),
        value: '*',
        icon: 'allowlist',
      }
      options = [allItem, ...options]
    }

    this.setState({ options })
  }

  handleRepoChange = () => null

  repoOptionRenderer = option => type => (
    <span className={styles.option}>
      <Icon
        name={option.icon ?? ''}
        type={type === 'value' ? 'dark' : 'light'}
      />
      {option.label}
      {option.value === '*' ? '' : ` (${option.value})`}
    </span>
  )

  render() {
    const {
      value,
      index,
      name,
      showCreateRepo,
      allowCreateCodeRepo,
    } = this.props

    return (
      <>
        <Select
          clearable
          searchable
          key={index}
          name={name}
          value={value}
          className={styles.select}
          onChange={this.handleRepoChange}
          options={this.state.options}
          onFetch={this.getRepoList}
          isLoading={this.codeStore.list.isLoading}
          pagination={pick(this.codeStore.list, ['page', 'limit', 'total'])}
          valueRenderer={option => this.repoOptionRenderer(option)('value')}
          optionRenderer={option => this.repoOptionRenderer(option)('option')}
        />
        {allowCreateCodeRepo && (
          <span
            className={cs(styles['multi-repo'], 'form-item-desc')}
            onClick={showCreateRepo}
          >
            {t('GO_CREATE_REPO')}
          </span>
        )}
      </>
    )
  }
}
