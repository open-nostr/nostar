import React from 'react';
import './RelayTestPage.css';
import { getDataFromAO, getDefaultProcess, getWalletAddress, isLoggedIn, uuid } from '../util/util';
import { NOSTR_TEST, PAGE_SIZE } from '../util/consts';
import Loading from '../elements/Loading';
import { Server } from '../../server/server';
import NotiCard from '../elements/NotiCard';
import NostrCard from '../elements/NostrCard';

interface RelayTestPageState {
  notis: any;
  loading: boolean;
  loadNextPage: boolean;
  open: boolean;
  isAll: boolean;
}

class RelayTestPage extends React.Component<{}, RelayTestPageState> {

  constructor(props: {}) {
    super(props);
    this.state = {
      notis: [],
      loading: true,
      loadNextPage: false,
      open: false,
      isAll: false,
    };


    this.onOpen = this.onOpen.bind(this);
    this.onClose = this.onClose.bind(this);
    this.atBottom = this.atBottom.bind(this);

    // subscribe('wallet-events', () => {
    //   this.forceUpdate();
    // });
  }

  componentDidMount() {
    // if (!Server.service.getIsLoggedIn()) return;

    this.getRelayTests();
    // window.addEventListener('scroll', this.atBottom);
  }

  componentWillUnmount(): void {
    // clearInterval(this.refresh);
    window.removeEventListener('scroll', this.atBottom);
  }

  atBottom() {
    const scrollHeight = document.documentElement.scrollHeight;
    const scrollTop = document.documentElement.scrollTop;
    const clientHeight = document.documentElement.clientHeight;

    if (scrollTop + clientHeight + 300 >= scrollHeight) {
      setTimeout(() => {
        if (!this.state.loading && !this.state.loadNextPage && !this.state.isAll)
          this.nextPage();
      }, 200);
    }
  }

  onOpen() {
    this.setState({ open: true });
  }

  onClose(data: any) {
    // console.log("onClose:", data)
    this.setState({ open: false });
    if (data) {
      this.getRelayTests();
      // this.setState({ posts: [], loading: true, isAll: false });
      this.setState({ isAll: false });
    }
  }

  // async start() {
  //   await this.getStory();
  // }

  async getRelayTests() {
    let address = await isLoggedIn();
    let process = NOSTR_TEST;

    let notis = await getDataFromAO(process, 'REQ', [{}], true);
    console.log("notis:", notis)

    if (notis.length < PAGE_SIZE)
      this.setState({ isAll: true })

    this.setState({ notis, loading: false });
  }

  async nextPage() {
    let process = NOSTR_TEST;
    console.log("process:", process)

    this.setState({ loadNextPage: true });

    let offset = this.state.notis.length.toString();
    console.log("offset:", offset)

    let notis = await getDataFromAO(process, 'REQ', [{}], true);
    console.log("notis:", notis)
    if (notis.length < PAGE_SIZE)
      this.setState({ isAll: true })

    let total = this.state.notis.concat(notis);
    this.setState({ notis: total, loadNextPage: false });
  }

  renderRelayTests() {
    if (this.state.loading) return (<Loading />);

    let divs = [];
    for (let i = 0; i < this.state.notis.length; i++) {
      divs.push(
        <NostrCard key={i} data={this.state.notis[i]} />
      )
    }

    return divs
  }

  render() {
    // if (!Server.service.isLoggedIn())
    //   return (<div>Please login first.</div>)

    return (
        <div className='noti-page'>
          <div className='noti-page-header'>
            <div className='noti-page-title'>RelayTest</div>
          </div>

          {this.renderRelayTests()}

          {this.state.loadNextPage && <Loading />}
          {this.state.isAll &&
            <div style={{ marginTop: '20px', color: 'gray' }}>
              No more notifications.
            </div>
          }
        </div>
    )
  }
}

export default RelayTestPage;
