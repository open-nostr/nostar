import React from 'react';
import './BookmarksPage.css';
import { getDataFromAO, getDefaultProcess, isLoggedIn, messageToAO } from '../util/util';
import { Server } from '../../server/server';
import ActivityPost from '../elements/ActivityPost';
import { BsCloudUpload } from 'react-icons/bs';
import MessageModal from '../modals/MessageModal';

interface BookmarksPageState {
  bookmarks: any;
  question: string;
  alert: string;
  message: string;
  loading: boolean;
  isLoggedIn: string;
  address: string;
}

class BookmarksPage extends React.Component<{}, BookmarksPageState> {

  constructor(props: {}) {
    super(props);
    this.state = {
      bookmarks: [],
      question: '',
      alert: '',
      message: '',
      loading: true,
      isLoggedIn: '',
      address: '',
    };
  }

  componentDidMount() {
    this.start();
  }

  async start() {
    window.scrollTo(0, 0);
    let address = await isLoggedIn();
    this.setState({ isLoggedIn: address, address });
    this.getBookmarks(address);
  }

  async getBookmarks(address: string) {
    let bookmarks = [];
    let val = localStorage.getItem('bookmarks');
    if (val) bookmarks = JSON.parse(val);

    this.setState({ bookmarks, loading: false });
  }

  renderBookmarks() {
    if (this.state.loading)
      return (<div>Loading...</div>);

    let bookmarks = this.state.bookmarks;
    bookmarks.sort((a: any, b: any) => {
      return b.time - a.time;
    });

    let divs = [];
    for (let i = 0; i < bookmarks.length; i++) {
      let data = bookmarks[i];
      data.isBookmarked = true;
      Server.service.addPostToCache(data);

      divs.push(
        <ActivityPost
          key={i}
          data={data}
        />
      )
    }

    return divs.length > 0 ? divs : <div>No bookmarks yet.</div>
  }

  async upload2AO() {
    this.setState({ message: 'Upload bookmarks to AO...' });

    let process = await getDefaultProcess(Server.service.getActiveAddress());
    let resp = await messageToAO(
      process,
      this.state.bookmarks,
      'AOTwitter.setBookmark'
    );

    this.setState({ message: '' });
  }

  render() {
    return (
      <div className='bookmarks-page'>
        <div className='bookmarks-page-header'>
          <div className='bookmarks-page-header-title'>Bookmarks</div>

          {this.state.bookmarks.length > 0 &&
            <div className="app-icon-button" onClick={() => this.upload2AO()}>
              <BsCloudUpload size={20} />Upload to AO
            </div>
          }
        </div>

        {this.renderBookmarks()}
        <MessageModal message={this.state.message} />
      </div>
    )
  }
}

export default BookmarksPage;