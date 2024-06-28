import React from 'react';
import { convertUrlsToLinks, randomAvatar, shortAddr } from '../util/util';
import { formatTimestamp } from '../util/util';
import './NostrCard.css';
import parse, { attributesToProps } from 'html-react-parser';
import { Navigate } from 'react-router-dom';
import ViewImageModal from '../modals/ViewImageModal';
import AlertModal from '../modals/AlertModal';
import { Service } from '../../server/service';
import { subscribe } from '../util/event';
import { Tooltip } from 'react-tooltip'
import MessageModal from '../modals/MessageModal';
import ExternalEmbed from './externalEmbed';

interface NostrCardProps {
  data: any;
}

interface NostrCardState {
  openImage: boolean;
  navigate: string;
  content: string;
  message: string;
  alert: string;
}

class NostrCard extends React.Component<NostrCardProps, NostrCardState> {

  id: string;
  imgUrl: string;
  loading: boolean = false;

  static service: Service = new Service();

  parseOptions = {
    replace: (domNode: any) => {
      if (domNode.attribs && domNode.name === 'img') {
        const props = attributesToProps(domNode.attribs);
        return <img className='ql-editor-image' onClick={(e) => this.tapImage(e, props.src)} {...props} />;
      } else if (domNode.name === 'span' && domNode.attribs) {
        if (domNode.attribs.class === 'youtube-url') {
          return <ExternalEmbed src={domNode.attribs['data-src']} />;
        }
      }
    }
  };

  constructor(props: NostrCardProps) {
    super(props);
    this.state = {
      openImage: false,
      navigate: '',
      content: '',
      message: '',
      alert: '',
    };

    this.onClose = this.onClose.bind(this);

    subscribe('wallet-events', () => {
      this.forceUpdate();
    });
  }

  componentDidMount() {
    this.start();

    const links = document.querySelectorAll("[id^='url']");
    for (let i = 0; i < links.length; i++) {
      links[i].addEventListener('click', function (e) {
        e.stopPropagation();
      });
    }
  }

  componentWillUnmount() {
    const links = document.querySelectorAll("[id^='url']");
    for (let i = 0; i < links.length; i++) {
      links[i].removeEventListener('click', function (e) {
        e.stopPropagation();
      });
    }
  }

  async start() {
    this.getPostContent();
  }

  async getPostContent() {
    console.log('getPostContent', this);
    let content = '';
    if(this.props.data.kind === 6){
      let json = JSON.parse(this.props.data.content);
      content = json.content;
    }
    else {
      content = this.props.data.content;
    }
    // content = convertHashTag(content);
    content = convertUrlsToLinks(content);
    this.setState({ content });
  }

  tapImage(e: any, src: string) {
    e.stopPropagation();
    this.imgUrl = src;
    this.setState({ openImage: true })
  }

  goProfilePage(e: any, id: string) {
    window.open("https://njump.me/" + id );
  }

  goPostPage(id: string) {
    window.open("https://njump.me/" + id );
  }

  getClassName(kind: number) {
    if (kind === 1){
      return 'NOTE'
    } else if (kind === 6){
      return 'REPOST'
    } else if (kind === 7){
      return 'REACTION'
    }
  }

  onClose() {
    this.setState({ openImage: false });
  }

  render() {
    let data = this.props.data;

    if (this.state.navigate)
      return <Navigate to={this.state.navigate} />;

    return (
      <div
        className='home-msg-line'
        style={{ cursor: this.state.openImage ? 'auto' : 'pointer' }}
        onClick={() => this.goPostPage(data.id)}
      >
        <div className='home-msg-header'>
          <img
            className='home-msg-portrait'
            // data-tooltip-id="my-tooltip"
            // data-tooltip-content="Go to the profile page"
            src={data.avatar? data.avatar : randomAvatar()}
            onClick={(e) => this.goProfilePage(e, data.pubkey)}
            title='Show Profile'
          // onMouseEnter={()=>this.openPopup()}
          // onMouseLeave={(e)=>this.closePopup(e)}
          />
          <div className="home-msg-nickname">
            {data.nickname}
          </div>

          <div className="home-msg-address">{shortAddr(data.pubkey, 4)}</div>
          <div className='home-msg-time'>
            ·&nbsp;&nbsp;{formatTimestamp(data.created_at)}
          </div>
          <div className='noti-card-label-reply'>{this.getClassName(data.kind)}</div>
        </div>

        <div className='activity-post-content'>
          {parse(this.state.content, this.parseOptions)}
        </div>

        <Tooltip id="my-tooltip" />
        <MessageModal message={this.state.message} />
        <AlertModal message={this.state.alert} button="OK" onClose={() => this.setState({ alert: '' })} />
        <ViewImageModal open={this.state.openImage} src={this.imgUrl} onClose={this.onClose} />
      </div>
    )
  }
}

export default NostrCard;